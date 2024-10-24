import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function SalaryPrint() {
  const [salaryData, setSalaryData] = useState([]);
  const fileInputRef = useRef(null);
  const printFrameRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      setSalaryData(data);
    };

    reader.readAsBinaryString(file);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Salary Slips</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 10mm;
              font-family: Arial, sans-serif;
            }
            .container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10mm;
            }
            .salary-slip {
              border: 2px solid #000;
              padding: 8mm;
              page-break-inside: avoid;
              height: 90mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 5mm;
              border-bottom: 1px solid #000;
              padding-bottom: 2mm;
            }
            .content {
              font-size: 14px;
              line-height: 1.5;
            }
            .content div {
              border-bottom: 1px solid #ddd;
              padding: 2mm 0;
            }
            .content div:last-child {
              border-bottom: none;
            }
            .content strong {
              display: inline-block;
              width: 40%;
              font-size: 14px;
            }
            @media print {
              .salary-slip {
                break-inside: avoid;
                border: 2px solid #000 !important;
                box-shadow: none;
              }
              .content div {
                border-bottom: 1px solid #000 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            ${salaryData.map(slip => `
              <div class="salary-slip">
                <div class="header">
                  Salary Slip
                </div>
                <div class="content">
                  ${Object.entries(slip)
                    .map(([key, value]) => `
                      <div><strong>${key}:</strong> ${value}</div>
                    `)
                    .join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Salary Print</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Import Excel File
            </label>
            <div className="flex space-x-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  dark:file:bg-indigo-900 dark:file:text-indigo-300"
              />
            </div>
          </div>

          {salaryData.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {salaryData.length} records loaded
                </span>
                <button
                  onClick={handlePrint}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Print Salary Slips
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {Object.keys(salaryData[0]).map((header) => (
                        <th
                          key={header}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {salaryData.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td
                            key={i}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}