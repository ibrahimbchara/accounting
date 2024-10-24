const API_URL = '/api';

export const fetchTransactions = async (clientId, token) => {
  try {
    const response = await fetch(`${API_URL}/transactions?clientId=${clientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch transactions');
  }
};

export const createTransaction = async (transaction, token) => {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transaction),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to create transaction');
  }
};

export const updateTransaction = async (id, transaction, token) => {
  try {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        date: transaction.date,
        description: transaction.description,
        debit: transaction.debit || null,
        credit: transaction.credit || null
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update transaction');
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const deleteTransaction = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to delete transaction');
  }
};

export const createBulkTransactions = async (transactions, token) => {
  try {
    const response = await fetch(`${API_URL}/transactions/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ transactions }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to create transactions');
  }
};