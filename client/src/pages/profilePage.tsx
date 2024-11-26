import React, { useEffect, useState, useRef } from 'react';
import Modal from 'react-modal';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LOOPS_BY_USER, QUERY_ME, GET_COMMENTS_BY_LOOP } from '../utils/queries';
import { UPDATE_USERNAME, DELETE_LOOP } from '../utils/mutations';
import { useNavigate } from 'react-router-dom';
import { FaCommentAlt, FaHeart, FaTrashAlt } from 'react-icons/fa';

Modal.setAppElement('#root');

const ProfilePage: React.FC = () => {
    const [loops, setLoops] = useState<any[]>([]);
    const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [loopToViewComments, setLoopToViewComments] = useState<string | null>(null);
    const { data: userData } = useQuery(QUERY_ME);
    const [newUsername, setNewUsername] = useState('');
    const [updateUsername] = useMutation(UPDATE_USERNAME);
    const [fetchedComments, setFetchedComments] = useState<any[]>([]);
    const [deleteLoop] = useMutation(DELETE_LOOP, {
        refetchQueries: [{ query: GET_LOOPS_BY_USER, variables: { userId: userData?.me?._id } }],
        awaitRefetchQueries: true,
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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loopToDelete, setLoopToDelete] = useState<string | null>(null);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const { data: loopsData, loading: loopsLoading, error: loopsError } = useQuery(GET_LOOPS_BY_USER, {
        skip: !userData,
        variables: { userId: userData?.me?._id },
    });

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleUsernameChange = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found, user is not authenticated");
            return;
        }

        try {
            const { data } = await updateUsername({
                variables: {
                    userId: userData?.me?._id,
                    username: newUsername
                }
            });

            if (data) {
                console.log("Username updated successfully:", data.updateUsername);
            } else {
                console.error("No data returned from mutation");
            }

        } catch (error) {
            console.error("Error updating username:", error);
        }

        setIsModalOpen(false); // Close modal on success
    };


    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const openDeleteModal = (loopId: string) => {
        setIsDeleteModalOpen(true);
        setLoopToDelete(loopId);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setLoopToDelete(null);
    };

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

    const handleDeleteLoop = async () => {
        if (!loopToDelete) return;

        try {
            await deleteLoop({
                variables: { _id: loopToDelete },
            });
            console.log("Loop deleted successfully from database!");
            setLoops((prev) => prev.filter((loop) => loop._id !== loopToDelete));
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error deleting loop:", error.message);
            } else {
                console.error("Unknown error deleting loop:", error);
            }
        }

        closeDeleteModal();
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

    console.log("Comments data in modal:", commentsData);
    console.log("Loop to view comments in modal:", loopToViewComments);

    return (
        <div className="profile-page-container min-h-screen bg-blue-100 p-4 flex flex-col gap-6">
            {/* Profile and settings */}
            <div className="relative inline-flex">
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-3 items-center">
                    <div className="flex cursor-pointer space-x-2" onClick={toggleDropdown}>
                        <h1 className="text-2xl font-bold text-indigo-600">{userData?.me?.username || 'My Profile'}</h1>
                        <span className="text-lg text-indigo-600">&#9662;</span>
                    </div>
                    {dropdownOpen && (
                        <div className="absolute bg-white shadow-md rounded-lg mt-2 border border-gray-300 z-20">
                            <div className="p-4 text-left space-y-2">
                                <button
                                    className="text-sm cursor-pointer text-blue-600 hover:underline"
                                    onClick={openModal}
                                >
                                    Change Username
                                </button>
                                {/* Username Modal */}
                                <Modal
                                    isOpen={isModalOpen}
                                    onRequestClose={closeModal}
                                    className="bg-white p-6 rounded shadow-lg w-96 mx-auto mt-20"
                                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                                >
                                    <h2 className="text-lg font-bold mb-4">Change Username</h2>
                                    <input
                                        type="text"
                                        placeholder="Enter new username"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                                            onClick={closeModal}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="bg-blue-600 text-white px-4 py-2 rounded"
                                            onClick={handleUsernameChange}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </Modal>
                                <h2 className="text-sm">Account Email: {userData?.me?.email || 'My Email'}</h2>
                                <div
                                    className="text-sm cursor-pointer text-blue-600 hover:underline"
                                    onClick={logout}
                                >
                                    Logout
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Loops */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loops.map((loop) => (
                    <div
                        key={loop._id}
                        className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300"
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
                            {/* Comments Button */}
                            <button
                                className="flex items-center justify-center w-12 h-12 bg-white text-indigo-500 rounded-full shadow-md hover:bg-gray-200"
                                onClick={() => openCommentsModal(loop._id)}
                            >
                                <FaCommentAlt size={24} />
                            </button>

                            {/* Likes Button */}
                            <div className="flex items-center space-x-2">
                                <button
                                    className="flex items-center justify-center w-12 h-12 bg-white text-red-500 rounded-full shadow-md hover:bg-gray-200"
                                >
                                    <FaHeart size={24} />
                                </button>
                                <span className="text-sm font-bold">{loop.likeCount || 0}</span>
                            </div>

                            {/* Trash Button */}
                            <button
                                className="flex items-center justify-center w-12 h-12 bg-white text-indigo-500 rounded-full shadow-md hover:bg-red-500 hover:text-white"
                                onClick={() => openDeleteModal(loop._id)}
                            >
                                <FaTrashAlt size={24} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comments Modal */}
            <Modal
                isOpen={isCommentsModalOpen}
                onRequestClose={closeCommentsModal}
                className="bg-white p-6 rounded shadow-lg w-2/3 mx-auto mt-10 max-h-[80vh] overflow-y-auto"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h2 className="text-xl font-bold mb-4 text-indigo-600">Comments</h2>
                {commentsError ? (
                    <p className="text-red-500 text-sm">Failed to load comments: {commentsError.message}</p>
                ) : fetchedComments.length > 0 ? (
                    <div className="space-y-4">
                        {fetchedComments.map((comment) => (
                            <div key={comment._id} className="border-b pb-2">
                                <p className="text-sm font-semibold text-indigo-700">
                                    {comment.username || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-600">{comment.body}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No comments available for this loop.</p>
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

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onRequestClose={closeDeleteModal}
                className="bg-white p-6 rounded shadow-lg w-96 mx-auto mt-20"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
                <h2 className="text-lg font-bold mb-4 text-red-600">Are you sure you want to delete this loop?</h2>
                <div className="flex justify-end space-x-2">
                    <button
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                        onClick={closeDeleteModal}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        onClick={handleDeleteLoop}
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default ProfilePage;