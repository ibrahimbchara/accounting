// Update the PUT route for transactions
app.put('/api/transactions/:id', verifyToken, checkPermission('write'), async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description, debit, credit } = req.body;
    
    // Validate the input
    if (!date || !description) {
      return res.status(400).json({ error: 'Date and description are required' });
    }

    const transaction = {
      date: new Date(date),
      description,
      debit: debit ? parseFloat(debit) : null,
      credit: credit ? parseFloat(credit) : null,
      updatedAt: new Date()
    };
    
    const result = await db.collection('transactions').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: transaction },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(result.value);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});