import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOOPS_BY_USER, QUERY_ME } from '../utils/queries';
import { useNavigate } from 'react-router-dom';
import { FaCommentAlt, FaHeart, FaTrashAlt, FaChevronDown } from 'react-icons/fa';

const ProfilePage: React.FC = () => {
    const [loops, setLoops] = useState<any[]>([]);
    const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { data: userData } = useQuery(QUERY_ME);
    const { data: loopsData, loading: loopsLoading, error: loopsError } = useQuery(GET_LOOPS_BY_USER, {
        skip: !userData,
        variables: { userId: userData?.me?._id },
    });

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
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

    if (loopsLoading || !userData) return <div>Loading...</div>;
    if (loopsError) return <div>Error fetching loops: {loopsError.message}</div>;

    return (
        <div className="profile-page-container min-h-screen bg-blue-100 p-4 flex flex-col gap-6">
            <div className='relative inline-flex'>
                {/* Username dropdown */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-3 items-center">
                    <div
                        className="flex cursor-pointer space-x-2"
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
                                <div
                                    className="text-sm cursor-pointer text-blue-600"
                                    onClick={logout} // Log the user out when clicked
                                >
                                    Logout
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* display loops */}
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loops.map((loop: any) => (
                            <div
                                key={loop._id}
                                className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 lg:mx-20 "
                            >
                                {/* Frame Preview */}
                                <div className="aspect-square flex justify-center items-center p-4">
                                    <img
                                        src={loop.frames?.[frameIndices[loop._id] || 0]?.canvasImg || ''}
                                        alt={`Frame ${frameIndices[loop._id] || 0}`}
                                        className="object-cover w-full h-full rounded-lg shadow-lg border-indigo-900 border-2"
                                    />
                                </div>

                                {/* Loop Details */}
                                <div className="bg-indigo-500 text-white flex justify-between items-center p-3 rounded-t-lg shadow-md">
                                    {/* Comments */}
                                    <button className="flex items-center justify-center w-12 h-12 bg-white text-indigo-500 rounded-full shadow-md hover:bg-gray-200">
                                        <FaCommentAlt size={24} />
                                    </button>

                                    {/* Likes */}
                                    <button className="flex items-center justify-center w-12 h-12 bg-white text-indigo-500 rounded-full shadow-md hover:bg-gray-200">
                                        <FaHeart size={24} />
                                    </button>

                                    {/* Trash */}
                                    <button className="flex items-center justify-center w-12 h-12 bg-white text-indigo-500 rounded-full shadow-md hover:bg-gray-200">
                                        <FaTrashAlt size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;