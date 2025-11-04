import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= Math.min(3, totalPages); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 mb-12">
      <button 
        className="px-4 py-2 text-gray-400 hover:text-gray-600"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={`w-10 h-10 rounded ${
            currentPage === page ? 'bg-gray-200' : 'hover:bg-gray-100'
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <span className="px-2">...</span>
      <button className="w-10 h-10 rounded hover:bg-gray-100">8</button>
      <button className="w-10 h-10 rounded hover:bg-gray-100">9</button>
      <button className="w-10 h-10 rounded hover:bg-gray-100">10</button>
      <button 
        className="px-4 py-2 hover:text-gray-600"
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
