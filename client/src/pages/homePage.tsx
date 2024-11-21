import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOOPS } from '../utils/queries';
import { FaHeart } from "react-icons/fa";
import { FaCommentAlt } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaBackward } from "react-icons/fa";
import { FaForward } from "react-icons/fa";


const HomePage: React.FC = () => {
  const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { data, loading, error } = useQuery(GET_LOOPS, {
    variables: { page: currentPage, limit: 10 },
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const loops = data?.getLoops || [];

  // Debug data and loops
  useEffect(() => {
    console.log("Query Data:", data);
    console.log("Loops:", loops);
  }, [data]);

  // Initialize frame indices
  useEffect(() => {
    if (loops.length) {
      const initialIndices = loops.reduce((acc: { [key: string]: number }, loop: any) => {
        if (loop._id) acc[loop._id] = 0;
        return acc;
      }, {});
      setFrameIndices(initialIndices);
    }
  }, [loops]);

  // Frame animation logic
  useEffect(() => {
    if (loops.length) {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setFrameIndices((prev) => {
          const updatedIndices = { ...prev };
          loops.forEach((loop: any) => {
            const totalFrames = loop.frames?.length || 0;
            if (totalFrames > 0) {
              updatedIndices[loop._id] = (updatedIndices[loop._id] + 1) % totalFrames;
            }
          });
          return updatedIndices;
        });
      }, 500); // Adjust interval speed as needed
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loops]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    setCurrentPage((prev) => (direction === 'next' ? prev + 1 : Math.max(prev - 1, 1)));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching loops: {error.message}</div>;

  return (
    <div className="min-h-screen bg-indigo-100 p-6 space-y-8">
    {loops.map((loop: any) => (
      <div
        key={loop._id}
        className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 mx-auto p-6"
        style={{
          maxWidth: '90%',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Loop Content */}
          <div className="w-full lg:w-1/3 flex justify-center items-center">
            <div className="aspect-square w-full max-w-lg p-6 flex items-center justify-center">
              <img
                src={loop.frames?.[frameIndices[loop._id] || 0]?.canvasImg || ''}
                alt={`Frame ${frameIndices[loop._id] || 0}`}
                className="object-cover w-full h-full rounded-lg shadow-lg border-indigo-900 border-2"
              />
            </div>
          </div>
          {/* Right Side */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className="w-full h-full p-6 flex flex-col">
              <div className="bg-indigo-500 text-white flex justify-between items-center p-3 rounded-t-lg shadow-md">
                <button className="px-4 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200">
                  <FaUser/>
                </button>
                <div className="flex space-x-2">
                  <button className="px-4 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200">
                    <FaHeart/>
                  </button>
                  <button className="px-4 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200">
                  <FaCommentAlt/>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-b-lg flex-1 mt-4 shadow-md">
                <h3 className="text-sm font-bold mb-2">Comments</h3>
                {Array(3)
                  .fill('This is a sample comment')
                  .map((comment, index) => (
                    <p key={`comment-${index}`} className="text-sm text-gray-700 mb-1">
                      {comment}
                    </p>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
    <footer className="flex justify-between">
      <button
        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 text-sm"
        disabled={currentPage === 1}
        onClick={() => handlePageChange('prev')}
      >
        <FaBackward/>
      </button>
      <button
        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 text-sm"
        onClick={() => handlePageChange('next')}
      >
        <FaForward/>
      </button>
    </footer>
  </div>
);
};

export default HomePage;
