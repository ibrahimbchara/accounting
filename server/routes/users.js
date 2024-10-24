import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { verifyToken, checkPermission } from '../middleware/auth.js';
import { Permission, UserRole, defaultPermissions } from '../models/User.js';

const router = express.Router();

export default function(db) {
  // Create user (admin only)
  router.post('/', verifyToken, checkPermission(Permission.ADMIN), async (req, res) => {
    try {
      const { username, password, email, role, clientAccess } = req.body;
      
      const existingUser = await db.collection('users').findOne({ 
        $or: [{ username }, { email }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = {
        username,
        email,
        password: hashedPassword,
        role,
        permissions: defaultPermissions[role],
        clientAccess: clientAccess || [], // Array of client IDs this user can access
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection('users').insertOne(user);
      delete user.password;
      res.json({ ...user, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await db.collection('users').findOne({ username });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          _id: user._id,
          username: user.username,
          role: user.role,
          permissions: user.permissions,
          clientAccess: user.clientAccess
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Get users (admin only)
  router.get('/', verifyToken, checkPermission(Permission.ADMIN), async (req, res) => {
    try {
      const users = await db.collection('users')
        .find({}, { projection: { password: 0 } })
        .toArray();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Update user permissions (admin only)
  router.put('/:id', verifyToken, checkPermission(Permission.ADMIN), async (req, res) => {
    try {
      const { id } = req.params;
      const { role, clientAccess } = req.body;

      const result = await db.collection('users').findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: {
            role,
            permissions: defaultPermissions[role],
            clientAccess,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after', projection: { password: 0 } }
      );

      if (!result.value) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.value);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Delete user (admin only)
  router.delete('/:id', verifyToken, checkPermission(Permission.ADMIN), async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.collection('users').deleteOne({
        _id: new ObjectId(id)
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  return router;
}