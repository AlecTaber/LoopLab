import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_LOOPS_BY_USER, GET_USER_BY_ID, GET_COMMENTS_BY_LOOP } from "../utils/queries";
import { FaCommentAlt, FaHeart } from "react-icons/fa";
import Modal from "react-modal";

const UserPage: React.FC = () => {
    const { id: userId } = useParams();
    const [loops, setLoops] = useState<any[]>([]);
    const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [loopToViewComments, setLoopToViewComments] = useState<string | null>(null);
    const [fetchedComments, setFetchedComments] = useState<any[]>([]);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER_BY_ID, {
        variables: { id: userId }
    });
    const { data: loopsData, loading: loopsLoading, error: loopsError } = useQuery(GET_LOOPS_BY_USER, {
        skip: !userData,
        variables: { userId },
    });
    const { refetch: refetchComments, data: commentsData, error: commentsError } = useQuery(GET_COMMENTS_BY_LOOP, {
        skip: true,
        onError: (error) => console.error("Error fetching comments:", error.message),
    });

    useEffect(() => {
        console.log("Fetched comments updated:", fetchedComments);
    }, [fetchedComments]);
    
    useEffect(() => {
        console.log("Loop to view comments updated:", loopToViewComments);
    }, [loopToViewComments]);

    const openCommentsModal = async (loopId: string) => {
        console.log("Opening comments modal for loop ID:", loopId);
        setIsCommentsModalOpen(true);
        setLoopToViewComments(loopId);

        try {
            const { data } = await refetchComments({ _id: loopId }); // Trigger the query manually
            console.log("Fetched comments data:", data);

            if (data) {
                // Use the fetched data directly to set comments if needed
                setFetchedComments(data.getCommentsByLoop); // Define `fetchedComments` in state
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error fetching comments with refetch:", error.message);
            } else {
                console.error("Unknown error fetching comments:", error);
            }
        }
    };

    const closeCommentsModal = () => {
        setIsCommentsModalOpen(false);
        setLoopToViewComments(null);
    };

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

    console.log("Comments data in modal:", commentsData);
    console.log("Loop to view comments in modal:", loopToViewComments);

    return (
        <div className="user-page-container min-h-screen bg-blue-100 p-4 flex flex-col gap-6">
            <div className='relative inline-flex'>
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-3 items-center">
                    <h1 className="text-2xl font-bold text-indigo-600">{userData?.getUserById.username}</h1>
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
                                <button
                                    className="flex items-center justify-center w-12 h-12 bg-white text-indigo-500 rounded-full shadow-md hover:bg-gray-200"
                                    onClick={() => openCommentsModal(loop._id)}
                                >
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
            {/* Comments Modal */}
            <Modal
                isOpen={isCommentsModalOpen}
                onRequestClose={closeCommentsModal}
                className="bg-white p-6 rounded shadow-lg w-96 mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h2 className="text-lg font-bold mb-4 text-indigo-600">Comments</h2>
                {commentsError ? (
                    <p className="text-red-500">Failed to load comments: {commentsError.message}</p>
                ) : fetchedComments.length > 0 ? (
                    <div className="space-y-4">
                        {fetchedComments.map((comment) => (
                            <div key={comment._id} className="border-b pb-2">
                                <p className="text-sm font-semibold text-indigo-700">
                                    {comment.username || "Unknown User"}
                                </p>
                                <p className="text-sm text-gray-600">{comment.body}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No comments available for this loop.</p>
                )}
                <div className="flex justify-end mt-4">
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        onClick={closeCommentsModal}
                    >
                        Close
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default UserPage;