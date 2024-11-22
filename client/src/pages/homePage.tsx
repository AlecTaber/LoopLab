import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GET_LOOPS, GET_USER_BY_LOOP, GET_COMMENTS_BY_LOOP } from '../utils/queries';
import { CREATE_COMMENT } from '../utils/mutations';
import { FaUser, FaHeart, FaCommentAlt, FaBackward, FaForward } from 'react-icons/fa';
import socket from '../utils/socket';
import CommentModal from '../components/CommentModal';

const HomePage: React.FC = () => {
    const [loops, setLoops] = useState<any[]>([]);
    const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [usernames, setUsernames] = useState<{ [key: string]: string }>({}); // Store usernames by loop ID
    const { data, loading, error } = useQuery(GET_LOOPS);
    const [fetchUserByLoop] = useLazyQuery(GET_USER_BY_LOOP);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);
    const [createComment] = useMutation(CREATE_COMMENT);
    const [fetchCommentsByLoop] = useLazyQuery(GET_COMMENTS_BY_LOOP);

    const openModal = (loopId: string) => {
        setSelectedLoopId(loopId);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedLoopId(null);
        setModalOpen(false);
    };

    const handleCommentSubmit = async (commentBody: string) => {
        if (!selectedLoopId) {
            console.error("No loop selected");
            return;
        }
    
        try {
            await createComment({
                variables: {
                    input: {
                        body: commentBody,
                        loopId: selectedLoopId,
                    },
                },
            });
    
            const { data: updatedComments } = await fetchCommentsByLoop({
                variables: { _id: selectedLoopId }, // Ensure selectedLoopId is valid
            });
    
            console.log("Updated comments response:", updatedComments);
            if (!updatedComments?.getCommentsByLoop) {
                throw new Error("Failed to fetch updated comments");
            }
    
            setLoops((prevLoops) =>
                prevLoops.map((loop) =>
                    loop._id === selectedLoopId
                        ? { ...loop, comments: updatedComments?.getCommentsByLoop || [] }
                        : loop
                )
            );
        } catch (error) {
            console.error('Error creating comment:', error);
        } finally {
            closeModal();
        }
    };

    // Update loops when query data changes
    useEffect(() => {
        if (data?.getLoops) {
            setLoops(data.getLoops);
        }
    }, [data]);

    // Fetch usernames for each loop
    useEffect(() => {
        const fetchUsernames = async () => {
            const usernamePromises = loops.map(async (loop: any) => {
                try {
                    const { data } = await fetchUserByLoop({ variables: { _id: loop._id } });
                    return { loopId: loop._id, username: data?.getUserByLoop?.username || 'Unknown' };
                } catch (error) {
                    console.error(`Error fetching username for loop ${loop._id}:`, error);
                    return { loopId: loop._id, username: 'Error' };
                }
            });

            const resolvedUsernames = await Promise.all(usernamePromises);

            const usernameMap = resolvedUsernames.reduce((acc, { loopId, username }) => {
                acc[loopId] = username;
                return acc;
            }, {} as { [key: string]: string });

            setUsernames(usernameMap);
        };

        if (loops.length > 0) {
            fetchUsernames();
        }
    }, [loops, fetchUserByLoop]);

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

    useEffect(() => {
        // Listen for newLoop events and update the state
        socket.on("newLoop", (newLoop) => {
            console.log("New loop received:", newLoop);
            setLoops((prevLoops) => [newLoop, ...prevLoops]); // Add the new loop to the top
        });

        return () => {
            socket.off("newLoop");
        };
    }, []);

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching loops: {error.message}</div>;

    return (
        <div className="min-h-screen bg-indigo-100 p-6 space-y-8">
            {/* Loops Section */}
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
                                <div className="bg-indigo-500 text-white flex justify-between items-center p-3 rounded-t-lg shadow-md">
                                    <div className="flex items-center space-x-2">
                                        <h2 className="text-2xl font-bold">{usernames[loop._id] || 'Loading...'}</h2>
                                        <button
                                            className="px-3 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200"
                                            onClick={() => console.log(`Visit profile for ${usernames[loop._id]}`)}
                                        >
                                            <FaUser />
                                        </button>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button className="px-4 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200">
                                            <FaHeart />
                                        </button>
                                        <button
                                            className="px-4 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200"
                                            onClick={() => openModal(loop._id)}
                                        >
                                            <FaCommentAlt />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-b-lg flex-1 mt-4 shadow-md">
                                    <h3 className="text-sm font-bold mb-2">Comments</h3>
                                    {loop.comments && loop.comments.length > 0 ? (
                                        loop.comments.map((comment: any) => (
                                            <p key={comment._id} className="text-sm text-gray-700 mb-1">
                                                <strong>{comment.username}:</strong> {comment.body}
                                            </p>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {/* Pagination */}
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
            {/* Comment Modal */}
            <CommentModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleCommentSubmit}
            />
        </div>
    );
};

export default HomePage;
