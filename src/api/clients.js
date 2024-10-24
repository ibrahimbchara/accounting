const API_URL = '/api';

export const fetchClients = async (token) => {
  try {
    const response = await fetch(`${API_URL}/clients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to fetch clients');
  }
};

export const createClient = async (client, token) => {
  try {
    const response = await fetch(`${API_URL}/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(client),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to create client');
  }
};

export const updateClient = async (id, client, token) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(client),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error('Failed to update client');
  }
};

export const deleteClient = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}`, {
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
    throw new Error('Failed to delete client');
  }
};