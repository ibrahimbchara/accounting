import { ObjectId } from 'mongodb';

export class Permission {
  static READ = 'read';
  static WRITE = 'write';
  static DELETE = 'delete';
  static ADMIN = 'admin';
}

export class UserRole {
  static ADMIN = 'admin';
  static MANAGER = 'manager';
  static USER = 'user';
}

export const defaultPermissions = {
  [UserRole.ADMIN]: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
  [UserRole.MANAGER]: [Permission.READ, Permission.WRITE, Permission.DELETE],
  [UserRole.USER]: [Permission.READ]
};