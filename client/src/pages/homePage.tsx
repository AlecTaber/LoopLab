import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOOPS } from '../utils/queries';
import '../../src/homePage.css';

const HomePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, loading, error } = useQuery(GET_LOOPS, {
    variables: { page: currentPage, limit: 10 },
  });

  const handlePageChange = (direction: 'next' | 'prev') => {
    setCurrentPage((prev) => (direction === 'next' ? prev + 1 : prev - 1));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching loops: {error.message}</div>;

  const loops = data?.getLoops || [];

  return (
    <div className="min-h-screen bg-blue-100 p-6 space-y-8">
    {loops.map((loop: any) => (
      <div
        key={loop._id}
        className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 mx-auto p-2"
        style={{
          maxWidth: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex flex-col lg:flex-row gap-1">
          {/* Loop Content: Square with Equal Padding */}
          <div className="w-full lg:w-1/3 flex justify-center items-center">
            <div className="aspect-square w-full max-w-lg p-6 flex items-center justify-center">
              <img
                src={loop.frames[0]?.canvasImg || ''}
                alt="Loop Preview"
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          </div>
          {/* Right Side: Buttons and Comments */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className="w-full h-full p-6 flex flex-col">
              {/* Top Blue Bar with Buttons */}
              <div className="bg-blue-500 text-white flex justify-between items-center p-3 rounded-t-lg">
                <button className="px-4 py-1 rounded-lg bg-white text-blue-500 text-sm hover:bg-gray-200">
                  UserPage
                </button>
                <div className="flex space-x-2">
                  <button className="px-4 py-1 rounded-lg bg-gray-200 text-blue-500 text-sm hover:bg-white">
                    Like
                  </button>
                  <button className="px-4 py-1 rounded-lg bg-gray-200 text-blue-500 text-sm hover:bg-white">
                    Comment
                  </button>
                </div>
              </div>
              {/* Comments Section */}
              <div className="bg-gray-50 p-4 rounded-b-lg flex-1 mt-4">
                <h3 className="text-sm font-bold mb-2">Comments</h3>
                {Array(3)
                  .fill('This is a sample comment')
                  .map((comment, index) => (
                    <p key={index} className="text-sm text-gray-700 mb-1">
                      {comment}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
    {/* Pagination */}
    <footer className="flex justify-between">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
        disabled={currentPage === 1}
        onClick={() => handlePageChange('prev')}
      >
        Previous
      </button>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm"
        onClick={() => handlePageChange('next')}
      >
        Next
      </button>
    </footer>
  </div>
);
};

export default HomePage;
