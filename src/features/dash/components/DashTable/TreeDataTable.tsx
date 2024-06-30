import React, { useState } from 'react';
import './TreeDataTable.css'; // Import the updated CSS file

interface ColumnConfig {
    header: string;
    accessor: string;
    isClickable?: boolean;
    onClick?: (rowId: string) => void;
    sortable?: boolean; // New prop to indicate if column is sortable
}

interface TreeDataTableProps {
    data: any[];
    columns: ColumnConfig[];
    title: string; // New prop for the table title
}

const TreeDataTable: React.FC<TreeDataTableProps> = ({ data, columns, title }) => {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' | 'default' }>({
        key: '',
        direction: 'default', // Default sorting direction
    });

    const handleSort = (key: string) => {
        let direction: 'ascending' | 'descending' | 'default' = 'ascending';
        if (sortConfig.key === key) {
            direction = sortConfig.direction === 'ascending' ? 'descending' : 'default';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (sortConfig.direction === 'ascending') {
            return a[sortConfig.key] < b[sortConfig.key] ? -1 : 1;
        } else if (sortConfig.direction === 'descending') {
            return a[sortConfig.key] > b[sortConfig.key] ? -1 : 1;
        }
        return 0;
    });

    const getSortIndicator = (column: ColumnConfig): JSX.Element | null => {
        if (!column.sortable) return null;

        let indicator = '↑↓'; // Default indicator

        if (sortConfig.key === column.accessor) {
            if (sortConfig.direction === 'ascending') {
                indicator = '↑'; // Ascending indicator
            } else if (sortConfig.direction === 'descending') {
                indicator = '↓'; // Descending indicator
            }
        }

        return <span className="sortIndicator">{indicator}</span>;
    };

    return (
        <div className="tableContainer">
            <h2 className="tableTitle">{title}</h2> {/* Table title */}
            <table>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} onClick={() => col.sortable && handleSort(col.accessor)}>
                                <div className="headerCell">
                                    <span>{col.header}</span>
                                    {col.sortable && (
                                        <span className="sortIndicatorContainer">
                                            {getSortIndicator(col)}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    onClick={() => col.isClickable && col.onClick && col.onClick(row.id)}
                                    style={{ cursor: col.isClickable ? 'pointer' : 'default' }}
                                    className={col.isClickable ? 'clickable' : ''}
                                >
                                    {row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TreeDataTable;
