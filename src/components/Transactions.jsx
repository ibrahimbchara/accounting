import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction, createBulkTransactions } from '../api/transactions';
import { fetchClients, createClient, updateClient, deleteClient } from '../api/clients';
import { useAuth } from '../contexts/AuthContext';
import ClientForm from './ClientForm';
import TransactionForm from './TransactionForm';
import ConfirmDialog from './ConfirmDialog';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMultipleForm, setShowMultipleForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClientEditForm, setShowClientEditForm] = useState(false);
  const [showClientDeleteConfirm, setShowClientDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  
  const [multipleTransactions, setMultipleTransactions] = useState([
    {
      id: Date.now(),
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      debit: '',
      credit: ''
    }
  ]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    try {
      const data = await fetchClients(token);
      setClients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load clients');
      console.error('Error loading clients:', err);
    }
  };

  const loadTransactions = async () => {
    if (!selectedClientId) return;
    
    try {
      setIsLoading(true);
      const data = await fetchTransactions(selectedClientId, token);
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      const newClient = await createClient(clientData, token);
      setClients([...clients, newClient]);
      setSelectedClientId(newClient._id);
      setShowClientForm(false);
    } catch (err) {
      setError('Failed to add client');
      console.error('Error adding client:', err);
    }
  };

  const handleEditClient = async (clientData) => {
    try {
      const updatedClient = await updateClient(selectedClient._id, clientData, token);
      setClients(clients.map(client => 
        client._id === selectedClient._id ? updatedClient : client
      ));
      setShowClientEditForm(false);
      setSelectedClient(null);
    } catch (err) {
      setError('Failed to update client');
      console.error('Error updating client:', err);
    }
  };

  const handleDeleteClient = async () => {
    try {
      await deleteClient(selectedClient._id, token);
      setClients(clients.filter(client => client._id !== selectedClient._id));
      if (selectedClientId === selectedClient._id) {
        setSelectedClientId('');
      }
      setShowClientDeleteConfirm(false);
      setSelectedClient(null);
    } catch (err) {
      setError('Failed to delete client');
      console.error('Error deleting client:', err);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const newTransaction = await createTransaction(
        { ...transactionData, clientId: selectedClientId },
        token
      );
      await loadTransactions();
      setShowAddForm(false);
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', err);
    }
  };

  const handleEditTransaction = async (transactionData) => {
    try {
      await updateTransaction(selectedTransaction._id, transactionData, token);
      await loadTransactions();
      setShowEditForm(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError('Failed to update transaction');
      console.error('Error updating transaction:', err);
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await deleteTransaction(selectedTransaction._id, token);
      await loadTransactions();
      setShowDeleteConfirm(false);
      setSelectedTransaction(null);
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    }
  };

  const handleAddMultipleRow = () => {
    setMultipleTransactions([
      ...multipleTransactions,
      {
        id: Date.now(),
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        debit: '',
        credit: ''
      }
    ]);
  };

  const handleMultipleTransactionChange = (index, field, value) => {
    const updatedTransactions = multipleTransactions.map((transaction, i) => {
      if (i === index) {
        return { ...transaction, [field]: value };
      }
      return transaction;
    });
    setMultipleTransactions(updatedTransactions);
  };

  const handleMultipleTransactions = async (e) => {
    e.preventDefault();
    try {
      const transactionsWithClient = multipleTransactions.map(t => ({
        ...t,
        clientId: selectedClientId
      }));
      await createBulkTransactions(transactionsWithClient, token);
      await loadTransactions();
      setMultipleTransactions([
        {
          id: Date.now(),
          date: format(new Date(), 'yyyy-MM-dd'),
          description: '',
          debit: '',
          credit: ''
        }
      ]);
      setShowMultipleForm(false);
    } catch (err) {
      setError('Failed to add transactions');
      console.error('Error adding multiple transactions:', err);
    }
  };

  const removeMultipleRow = (index) => {
    if (multipleTransactions.length > 1) {
      setMultipleTransactions(multipleTransactions.filter((_, i) => i !== index));
    }
  };

  const exportToExcel = () => {
    let runningBalance = 0;
    const transactionsWithBalance = transactions.map(transaction => {
      runningBalance += (Number(transaction.debit) || 0) - (Number(transaction.credit) || 0);
      return {
        Date: format(new Date(transaction.date), 'yyyy-MM-dd'),
        Description: transaction.description,
        Debit: transaction.debit || '',
        Credit: transaction.credit || '',
        Balance: runningBalance.toFixed(2)
      };
    });

    const ws = XLSX.utils.json_to_sheet(transactionsWithBalance);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "transactions.xlsx");
  };

  const calculateBalance = () => {
    return transactions.reduce((acc, curr) => {
      return acc + (Number(curr.debit) || 0) - (Number(curr.credit) || 0);
    }, 0);
  };

  if (isLoading && selectedClientId) {
    return <div className="text-center dark:text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Transactions</h2>
        <button
          onClick={() => setShowClientForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          Add Client
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="mt-1 block w-64 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client._id} value={client._id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClientId && (
          <div className="flex space-x-4">
            <button
              onClick={() => {
                const client = clients.find(c => c._id === selectedClientId);
                setSelectedClient(client);
                setShowClientEditForm(true);
              }}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Edit Client
            </button>
            <button
              onClick={() => {
                const client = clients.find(c => c._id === selectedClientId);
                setSelectedClient(client);
                setShowClientDeleteConfirm(true);
              }}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete Client
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Add Transaction
            </button>
            <button
              onClick={() => setShowMultipleForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Add Multiple
            </button>
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              Export to Excel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-center dark:text-red-400">{error}</div>
      )}

      {showClientForm && (
        <ClientForm
          onSubmit={handleAddClient}
          onCancel={() => setShowClientForm(false)}
        />
      )}

      {showClientEditForm && (
        <ClientForm
          client={selectedClient}
          onSubmit={handleEditClient}
          onCancel={() => {
            setShowClientEditForm(false);
            setSelectedClient(null);
          }}
        />
      )}

      {showClientDeleteConfirm && (
        <ConfirmDialog
          isOpen={showClientDeleteConfirm}
          title="Delete Client"
          message="Are you sure you want to delete this client? This will also delete all associated transactions. This action cannot be undone."
          onConfirm={handleDeleteClient}
          onCancel={() => {
            setShowClientDeleteConfirm(false);
            setSelectedClient(null);
          }}
        />
      )}

      {showAddForm && (
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {showEditForm && (
        <TransactionForm
          transaction={selectedTransaction}
          onSubmit={handleEditTransaction}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          onConfirm={handleDeleteTransaction}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setSelectedTransaction(null);
          }}
        />
      )}

      {showMultipleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[800px] max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Add Multiple Transactions</h3>
            <form onSubmit={handleMultipleTransactions} className="space-y-4">
              <div className="space-y-4">
                {multipleTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="flex space-x-4 items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                      <input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => handleMultipleTransactionChange(index, 'date', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <input
                        type="text"
                        value={transaction.description}
                        onChange={(e) => handleMultipleTransactionChange(index, 'description', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Debit</label>
                      <input
                        type="number"
                        value={transaction.debit}
                        onChange={(e) => handleMultipleTransactionChange(index, 'debit', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credit</label>
                      <input
                        type="number"
                        value={transaction.credit}
                        onChange={(e) => handleMultipleTransactionChange(index, 'credit', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="pt-7">
                      <button
                        type="button"
                        onClick={() => removeMultipleRow(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        disabled={multipleTransactions.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddMultipleRow}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  + Add Another Row
                </button>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowMultipleForm(false)}
                  className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Add All
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedClientId && transactions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Debit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Credit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction, index) => {
                const runningBalance = transactions
                  .slice(0, index + 1)
                  .reduce((acc, curr) => acc + (Number(curr.debit) || 0) - (Number(curr.credit) || 0), 0);

                return (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                      {format(new Date(transaction.date), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{transaction.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{transaction.debit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{transaction.credit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">{runningBalance.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowEditForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <td colSpan="4" className="px-6 py-3 text-right font-medium text-gray-900 dark:text-gray-300">Total Balance:</td>
                <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-300">{calculateBalance().toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {selectedClientId && transactions.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No transactions found for this client. Add a transaction to get started.
        </div>
      )}
    </div>
  );
}