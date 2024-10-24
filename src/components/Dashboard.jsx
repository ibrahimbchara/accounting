import { useState } from 'react';

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalDebit: 0,
    totalCredit: 0,
    balance: 0
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold dark:text-white">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Transactions</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{summary.totalTransactions}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Debit</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">${summary.totalDebit.toFixed(2)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Credit</h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">${summary.totalCredit.toFixed(2)}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Current Balance</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">${summary.balance.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}