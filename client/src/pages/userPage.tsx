import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_LOOPS_BY_USER, GET_USER_BY_ID } from "../utils/queries";
import { FaCommentAlt, FaHeart } from "react-icons/fa";

const UserPage: React.FC = () => {
    const [loops, setLoops] = useState<any[]>([]);
    const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const userId = "67400f5afa3e64f97d20a43b";  // Hardcoded for now
    const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER_BY_ID, {
        variables: { id: userId }
    });
    const { data: loopsData, loading: loopsLoading, error: loopsError } = useQuery(GET_LOOPS_BY_USER, {
        skip: !userData,
        variables: { userId: userData?.getUserById._id },
    });

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

    if (userLoading) return <p>Loading user data...</p>;
    if (userError) return <p>Error loading user: {userError.message}</p>;

    if (loopsLoading) return <p>Loading loops...</p>;
    if (loopsError) return <p>Error loading loops: {loopsError.message}</p>;


    return (
        <div className="user-page-container min-h-screen bg-blue-100 p-4 flex flex-col gap-6">
            <div className='relative inline-flex'>
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-3 items-center">
                    <h1 className="text-2xl font-bold">{userData?.getUserById.username}</h1>
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserPage;