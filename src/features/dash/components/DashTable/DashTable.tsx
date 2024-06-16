// src/DashTable.tsx
import React, { useState } from 'react';
import './DashTable.css'; // Import the custom CSS for styling
import Histogram from '../Graph/Histogram'; // Import the Histogram component

interface Column {
  header: string;
  accessor: string; // Key to access the data in each row
}

interface DashTableProps {
  columns: Column[];
  data: Record<string, any>[]; // Array of data records
  clickableColumns: Record<string, (value: any, row: Record<string, any>) => void>; // Object with accessor keys as keys and click handler functions as values
}

const DashTable: React.FC<DashTableProps> = ({ columns, data, clickableColumns }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null); // State to track selected row index
  const [showHistogram, setShowHistogram] = useState<boolean>(false); // State to control histogram display
  const [histogramData, setHistogramData] = useState<number[]>([]); // State to store histogram data
  const [histogramTitle, setHistogramTitle] = useState<string>(''); // State to store histogram title

  const rowsPerPage: number = 10; // Define the maximum number of rows per page
  const totalPages: number = Math.ceil(data.length / rowsPerPage); // Calculate the total number of pages
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = data.slice(indexOfFirstRow, indexOfLastRow); // Data for the current page

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRowIndex(null); // Reset selected row index when changing pages
  };

  const handleRowClick = (rowIndex: number, row: Record<string, any>) => {
    setSelectedRowIndex(rowIndex);

    let title = ''; // Initialize title
    if (row.ndviValues) {
      setHistogramData(row.ndviValues);
      title = `Average NDVI value for ${row.orchardName}`; // Set title for NDVI values
      setShowHistogram(true);
    } else if (row.ndreValues) {
      setHistogramData(row.ndreValues);
      title = `Average NDRE value for ${row.orchardName}`; // Set title for NDRE values
      setShowHistogram(true);
    } else {
      setShowHistogram(false);
    }
    setHistogramTitle(title); // Update the histogram title state
  };

  // Render pagination controls
  const renderPaginationControls = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          {pageNumbers.map((number) => (
            <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(number)}>
                {number}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="centered-header">Tree Survey Data</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover green-table">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th key={column.accessor}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr
                key={indexOfFirstRow + rowIndex}
                className={`table-row ${selectedRowIndex === rowIndex ? 'selected-row' : ''}`}
                onClick={() => handleRowClick(indexOfFirstRow + rowIndex, row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.accessor}
                    className={`${column.accessor in clickableColumns ? 'clickable-cell' : ''}`}
                  >
                    {row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showHistogram && (
        <Histogram
          data={histogramData}
          title={histogramTitle} // Pass the dynamic title to the Histogram component
          showHistogram={showHistogram}
          onClose={() => setShowHistogram(false)}
        />
      )}
      {renderPaginationControls()}
    </div>
  );
};

export default DashTable;
