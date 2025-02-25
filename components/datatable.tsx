import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface DataTableProps {
    data: any[];
    columns: {
        key: string;
        header: string;
    }[];
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, onEdit, onDelete }) => {
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

    const toggleDropdown = (index: number) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
                <thead>
                    <tr className="bg-gray-50">
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                                {column.header}
                            </th>
                        ))}
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr key={index}>
                            {columns.map((column) => (
                                <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                                    {item[column.key]}
                                </td>
                            ))}
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                <div className="relative">
                                    <button
                                        onClick={() => toggleDropdown(index)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <MoreVertical size={20} />
                                    </button>
                                    {activeDropdown === index && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => {
                                                        onEdit(item);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onDelete(item);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;