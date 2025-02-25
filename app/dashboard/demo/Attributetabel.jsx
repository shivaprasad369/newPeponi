import React, { useState, useEffect } from "react";
import { FaRegEdit } from "react-icons/fa";
import { Trash2 } from "lucide-react"; // Assuming you're using this icon for delete

const Attributetabel = ({
  data,
  onDelete,
  onEdit,
  isLoading = false,
  setIsCancel,
}) => {
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [rowsPerPage, setRowsPerPage] = useState(5); // Rows per page

  useEffect(() => {
    // Reset to first page when data changes
    setCurrentPage(1);
  }, [data]);

  // Handle Search filtering
  const filteredData = data?.filter((item) => {
    const matchesCategory = item.CategoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubCategory = item.subcategoryName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory || matchesSubCategory;
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData?.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredData?.length / rowsPerPage);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="w-full h-fit bg-white shadow-lg rounded-lg p-6">
      {/* Add New Button */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-all"
          onClick={() => setIsCancel(true)} // Trigger Add New functionality
        >
          + Add New
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-between p-3 mt-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by Category or SubCategory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          onChange={(e) => setRowsPerPage(Number(e.target.value))}
          className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800">
              <th className="p-2 border text-left">Category Name</th>
              <th className="p-2 border text-left">SubCategory</th>
              <th className="p-2 border text-left">Attributes</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentRows?.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-all duration-200"
              >
                <td className="p-2 border">{item.CategoryName}</td>
                <td className="p-2 border">{item.subcategoryName}</td>
                <td className="p-2 border">
                  {item?.attributes?.map((attribute, idx) => (
                    <div
                      key={idx}
                      className="py-1 border-b last:border-0 text-sm"
                    >
                      <span className="font-medium">{attribute.attributeName}:</span>
                      <div className="flex gap-2 mt-1">
                        {attribute?.values?.map((value, vIdx) => (
                          <span
                            key={vIdx}
                            className="px-2 py-1 text-xs bg-gray-200 text-black rounded-md"
                          >
                            {value.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => onEdit(item)} // Edit handler
                    className="text-blue-500 hover:text-blue-700 transition-all"
                    aria-label="Edit Item"
                  >
                    <FaRegEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstRow + 1} to{" "}
          {Math.min(indexOfFirstRow + rowsPerPage, filteredData?.length)} of{" "}
          {filteredData?.length} entries
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 border rounded-md ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600"
                } hover:bg-blue-600 hover:text-white transition-all`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md text-gray-500 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attributetabel;
