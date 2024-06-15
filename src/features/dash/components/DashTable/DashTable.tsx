import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import './DashTable.css'; // Import the custom CSS for styling

// Define types for the props
interface Column {
  header: string;
  accessor: string; // Key to access the data in each row
}

interface DashTableProps {
  columns: Column[];
  data: Record<string, any>[];
  clickableColumns: Record<string, (value: any, row: Record<string, any>) => void>; // Object with accessor keys as keys and click handler functions as values
}

const DashTable: React.FC<DashTableProps> = ({ columns, data, clickableColumns }) => {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [clickedCell, setClickedCell] = React.useState<{ rowIndex: number, accessor: string } | null>(null);
  const rowsPerPage: number = 10; // Define the maximum number of rows per page

  // Calculate the total number of pages
  const totalPages: number = Math.ceil(data.length / rowsPerPage);

  // Calculate the indices for the current page's data
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = data.slice(indexOfFirstRow, indexOfLastRow);

  // Function to handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Function to render pagination controls
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
          {pageNumbers.map(number => (
            <li
              key={number}
              className={`page-item ${number === currentPage ? 'active' : ''}`}
            >
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

  // Handle cell click and update the clicked cell state
  const handleCellClick = (columnAccessor: string, cellValue: any, rowIndex: number, row: Record<string, any>) => {
    setClickedCell({ rowIndex, accessor: columnAccessor });
    if (clickableColumns[columnAccessor]) {
      clickableColumns[columnAccessor](cellValue, row);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Styled Table with Pagination and Clickable Columns</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-header">
            <tr>
              {columns.map((column) => (
                <th key={column.accessor}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={indexOfFirstRow + rowIndex} className="table-row">
                {columns.map((column) => {
                  const isClickable = column.accessor in clickableColumns;
                  const isClicked = clickedCell?.rowIndex === (indexOfFirstRow + rowIndex) && clickedCell?.accessor === column.accessor;
                  return (
                    <td
                      key={column.accessor}
                      onClick={isClickable ? () => handleCellClick(column.accessor, row[column.accessor], indexOfFirstRow + rowIndex, row) : undefined}
                      className={`${isClickable ? 'clickable-cell' : ''} ${isClicked ? 'clicked-cell' : ''}`}
                    >
                      {row[column.accessor]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderPaginationControls()}
    </div>
  );
};

export default DashTable;
