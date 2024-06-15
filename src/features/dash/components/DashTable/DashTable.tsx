import React, { useState } from 'react';
import './DashTable.css';
import Histogram from '../Graph/Histogram';

interface Column {
  header: string;
  accessor: string;
}

interface DashTableProps {
  columns: Column[];
  data: Record<string, any>[];
  clickableColumns: Record<string, (value: any, row: Record<string, any>) => void>;
}

const DashTable: React.FC<DashTableProps> = ({ columns, data, clickableColumns }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [clickedCell, setClickedCell] = useState<{ rowIndex: number, accessor: string } | null>(null);
  const rowsPerPage: number = 10;
  const [showHistogram, setShowHistogram] = useState<boolean>(false);
  const [histogramData, setHistogramData] = useState<number[]>([]);

  const totalPages: number = Math.ceil(data.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentData = data.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCellClick = (columnAccessor: string, cellValue: any, rowIndex: number, row: Record<string, any>) => {
    setClickedCell({ rowIndex, accessor: columnAccessor });

    let values: number[] = [];
    if (columnAccessor === 'averageNDVI') {
      values = row['ndviValues'];
    } else if (columnAccessor === 'averageNDRE') {
      values = row['ndreValues'];
    }

    setHistogramData(values);
    setShowHistogram(true);

    if (clickableColumns[columnAccessor]) {
      clickableColumns[columnAccessor](cellValue, row);
    }
  };

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

  return (
    <div className="container mt-4">
      <h2>Styled Table with Histogram and Pagination</h2>
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
      {showHistogram && clickedCell && (
        <Histogram
          data={histogramData}
          title={clickedCell.accessor === 'averageNDVI' ? 'NDVI Histogram' : 'NDRE Histogram'}
          showHistogram={showHistogram}
        />
      )}
      {renderPaginationControls()}
    </div>
  );
};

export default DashTable;
