// src/features/dash/components/TreeDataTable.tsx

import React from 'react';

interface ColumnConfig {
    header: string;
    accessor: string;
    isClickable?: boolean;
    onClick?: (rowId: string) => void;
}

interface TreeDataTableProps {
    data: any[];
    columns: ColumnConfig[];
}

const TreeDataTable: React.FC<TreeDataTableProps> = ({ data, columns }) => {
    return (
        <table>
            <thead>
                <tr>
                    {columns.map((col, index) => (
                        <th key={index}>{col.header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                            <td
                                key={colIndex}
                                onClick={() => col.isClickable && col.onClick && col.onClick(row.id)}
                                style={{ cursor: col.isClickable ? 'pointer' : 'default' }}
                            >
                                {row[col.accessor]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default TreeDataTable;
