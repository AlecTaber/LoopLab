import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOOPS_BY_USER, QUERY_ME } from '../utils/queries';
import { FaBackward, FaForward } from 'react-icons/fa';

const ProfilePage: React.FC = () => {
    const [loops, setLoops] = useState<any[]>([]);
    const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { data: userData } = useQuery(QUERY_ME);
    const { data: loopsData, loading: loopsLoading, error: loopsError } = useQuery(GET_LOOPS_BY_USER, {
        skip: !userData,
        variables: { userId: userData?.me?._id, page: currentPage, limit: 10 },
    });

    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Toggle the dropdown
    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Update loops when query data changes
    useEffect(() => {
        if (loopsData?.getLoopsByUser) {
            setLoops(loopsData.getLoopsByUser);
        }
    }, [loopsData]);

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
            }, 500);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [loops]);

    const handlePageChange = (direction: 'next' | 'prev') => {
        setCurrentPage((prev) => (direction === 'next' ? prev + 1 : Math.max(prev - 1, 1)));
    };

    if (loopsLoading || !userData) return <div>Loading...</div>;
    if (loopsError) return <div>Error fetching loops: {loopsError.message}</div>;

    return (
        <div className="homepage-container min-h-screen bg-blue-100 p-6 flex gap-6">
        <div className='relative'>
            {/* Username dropdown */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-3">
                <div
                    className="flex items-center justify-center cursor-pointer space-x-2"
                    onClick={toggleDropdown}
                >
                    <h1 className="text-2xl font-bold">{userData?.me?.username || 'My Profile'}</h1>
                    <span className="text-lg">&#9662;</span> {/* Dropdown arrow */}
                </div>

                {/* Dropdown menu */}
                {dropdownOpen && (
                    <div className="absolute bg-white shadow-md rounded-lg mt-2 border border-gray-300 z-20">
                        <div className="p-4 text-left space-y-2">
                            <h2 className="text-sm">Change Username</h2>
                            <h2 className="text-sm">Account Email: {userData?.me?.email || 'My Email'}</h2>
                            <h2 className='text-sm'>logout</h2>
                        </div>
                    </div>
                )}
            </div>
        </div>

            {/* display loops */}
            <div>
            {loops.map((loop: any) => (
                <div
                    key={loop._id}
                    className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 mx-auto p-6"
                    style={{ maxWidth: '90%' }}
                >
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Frame Preview */}
                        <div className="w-full lg:w-1/3 flex justify-center items-center">
                            <div className="aspect-square w-full max-w-lg p-6 flex items-center justify-center">
                            <img
                                        src={loop.frames?.[frameIndices[loop._id] || 0]?.canvasImg || ''}
                                        alt={`Frame ${frameIndices[loop._id] || 0}`}
                                        className="object-cover w-full h-full rounded-lg shadow-lg border-indigo-900 border-2"
                                    />
                            </div>
                        </div>

                        {/* Loop Details */}
                        <div className="w-full lg:w-2/3 flex flex-col">
                            <div className="w-full h-full p-6 flex flex-col">
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
                    <FaBackward />
                </button>
                <button
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 text-sm"
                    onClick={() => handlePageChange('next')}
                >
                    <FaForward />
                </button>
            </footer>
            </div>
        </div>
    );
};

export default ProfilePage;