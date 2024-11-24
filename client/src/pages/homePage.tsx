// import React, { useEffect, useState, useRef } from 'react';
// import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
// import { GET_LOOPS, GET_USER_BY_LOOP, GET_COMMENTS_BY_LOOP, QUERY_ME } from '../utils/queries';
// import { CREATE_COMMENT, ADD_LIKE_TO_LOOP } from '../utils/mutations';
// import { FaUser, FaHeart, FaCommentAlt } from 'react-icons/fa';
// import socket from '../utils/socket';
// import CommentModal from '../components/CommentModal';

// const HomePage: React.FC = () => {
//     const [loops, setLoops] = useState<any[]>([]);
//     const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
//     const [likedLoops, setLikedLoops] = useState<{ [key: string]: boolean }>({}); // Store liked loops by loop ID
//     const [usernames, setUsernames] = useState<{ [key: string]: string }>({}); // Store usernames by loop ID
//     const { data, loading, error } = useQuery(GET_LOOPS);
//     const [fetchUserByLoop] = useLazyQuery(GET_USER_BY_LOOP);
//     const intervalRef = useRef<NodeJS.Timeout | null>(null);
//     const [isModalOpen, setModalOpen] = useState(false);
//     const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);
//     const [createComment] = useMutation(CREATE_COMMENT);
//     const [addLikeToLoop] = useMutation(ADD_LIKE_TO_LOOP);
//     const [fetchCommentsByLoop] = useLazyQuery(GET_COMMENTS_BY_LOOP);
//     const { data: userData } = useQuery(QUERY_ME);
//     const currentUserId = userData?.me?._id;

//     console.log("Fetched current user ID:", currentUserId);

//     const openModal = (loopId: string) => {
//         setSelectedLoopId(loopId);
//         setModalOpen(true);
//     };

//     const closeModal = () => {
//         setSelectedLoopId(null);
//         setModalOpen(false);
//     };

//     const handleCommentSubmit = async (commentBody: string) => {
//         if (!selectedLoopId) {
//             console.error("No loop selected");
//             return;
//         }

//         try {
//             console.log("Submitting comment for loop ID:", selectedLoopId);
//             await createComment({
//                 variables: {
//                     input: {
//                         body: commentBody,
//                         loopId: selectedLoopId,
//                     },
//                 },
//             });

//             const { data: updatedComments } = await fetchCommentsByLoop({
//                 variables: { _id: selectedLoopId }, // Ensure selectedLoopId is valid
//             });

//             console.log("Fetched updated comments for loop ID:", selectedLoopId, updatedComments);

//             console.log("Updated comments response:", updatedComments);
//             if (!updatedComments?.getCommentsByLoop) {
//                 throw new Error("Failed to fetch updated comments");
//             }

//             setLoops((prevLoops) =>
//                 prevLoops.map((loop) =>
//                     loop._id === selectedLoopId
//                         ? { ...loop, comments: updatedComments?.getCommentsByLoop || [] }
//                         : loop
//                 )
//             );
//         } catch (error) {
//             console.error('Error creating comment:', error);
//         } finally {
//             closeModal();
//         }
//     };

//     const handleLike = async (loopId: string) => {
//         try {
//             console.log("Toggling like for loop ID:", loopId);

//             // Optimistically toggle like status
//             setLikedLoops((prev) => ({
//                 ...prev,
//                 [loopId]: !prev[loopId],
//             }));

//             // Send mutation to update likes in the backend
//             await addLikeToLoop({ variables: { _id: loopId } });
//         } catch (error) {
//             console.error("Error toggling like:", error);

//             // Revert optimistic update if mutation fails
//             setLikedLoops((prev) => ({
//                 ...prev,
//                 [loopId]: !prev[loopId],
//             }));
//         }
//     };

//     // Update loops when query data changes
//     useEffect(() => {
//         if (data?.getLoops) {
//             setLoops(data.getLoops);

//             if (currentUserId) {
//                 const initialLikes = data.getLoops.reduce((acc: { [key: string]: boolean }, loop: any) => {
//                     const userLiked = loop.likes.some((like: any) => like.userId === currentUserId);
//                     acc[loop._id] = userLiked;
//                     return acc;
//                 }, {});
//                 setLikedLoops(initialLikes);
//             }
//         }
//     }, [data, currentUserId]);

//     // Fetch usernames for each loop
//     useEffect(() => {
//         const fetchUsernames = async () => {
//             const usernamePromises = loops.map(async (loop: any) => {
//                 try {
//                     console.log("Fetching username for loop ID:", loop._id);

//                     const { data } = await fetchUserByLoop({ variables: { _id: loop._id } });
//                     return { loopId: loop._id, username: data?.getUserByLoop?.username || 'Unknown' };
//                 } catch (error) {
//                     console.error(`Error fetching username for loop ${loop._id}:`, error);
//                     return { loopId: loop._id, username: 'Error' };
//                 }
//             });

//             const resolvedUsernames = await Promise.all(usernamePromises);

//             const usernameMap = resolvedUsernames.reduce((acc, { loopId, username }) => {
//                 acc[loopId] = username;
//                 return acc;
//             }, {} as { [key: string]: string });

//             setUsernames(usernameMap);
//         };

//         if (loops.length > 0) {
//             fetchUsernames();
//         }
//     }, [loops, fetchUserByLoop]);

//     // Initialize frame indices
//     useEffect(() => {
//         if (loops.length) {
//             const initialIndices = loops.reduce((acc: { [key: string]: number }, loop: any) => {
//                 if (loop._id) acc[loop._id] = 0;
//                 return acc;
//             }, {});
//             setFrameIndices(initialIndices);
//         }
//     }, [loops]);

//      // Socket.IO listeners for real-time updates
//      useEffect(() => {
//         socket.on("newLoop", (newLoop) => {
//             setLoops((prevLoops) => [newLoop, ...prevLoops]);
//         });

//         socket.on("newComment", (newComment) => {
//             setLoops((prevLoops) =>
//                 prevLoops.map((loop) =>
//                     loop._id === newComment.loopId
//                         ? { ...loop, comments: [...(loop.comments || []), newComment] }
//                         : loop
//                 )
//             );
//         });

//         socket.on('likeUpdate', ({ loopId, likeCount, likes }) => {
//             setLoops((prevLoops) =>
//                 prevLoops.map((loop) =>
//                     loop._id === loopId
//                         ? { ...loop, likeCount, likes }
//                         : loop
//                 )
//             );

//             if (currentUserId) {
//                 setLikedLoops((prev) => ({
//                     ...prev,
//                     [loopId]: likes.some((like: any) => like.userId === currentUserId),
//                 }));
//             }
//         });

//         return () => {
//             socket.off("newLoop");
//             socket.off("newComment");
//             socket.off("likeUpdate");
//         };
//     }, [currentUserId]);

//     // Frame animation logic
//     useEffect(() => {
//         if (loops.length) {
//             if (intervalRef.current) clearInterval(intervalRef.current);

//             intervalRef.current = setInterval(() => {
//                 setFrameIndices((prev) => {
//                     const updatedIndices = { ...prev };
//                     loops.forEach((loop: any) => {
//                         const totalFrames = loop.frames?.length || 0;
//                         if (totalFrames > 0) {
//                             updatedIndices[loop._id] = (updatedIndices[loop._id] + 1) % totalFrames;
//                         }
//                     });
//                     return updatedIndices;
//                 });
//             }, 500);
//         }

//         return () => {
//             if (intervalRef.current) clearInterval(intervalRef.current);
//         };
//     }, [loops]);

//     if (loading) {
//         console.log("Loading loops...");
//         return <div>Loading...</div>;
//     }
//     if (error) {
//         console.error("Error fetching loops:", error);
//         return <div>Error fetching loops: {error.message}</div>;
//     }

//     return (
//         <div className="min-h-screen bg-indigo-100 p-6 space-y-8">
//             {/* Loops Section */}
//             {loops.map((loop: any) => (
//                 <div
//                     key={loop._id}
//                     className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 mx-auto p-6"
//                     style={{ maxWidth: '90%' }}
//                 >
//                     <div className="flex flex-col lg:flex-row gap-6">
//                         {/* Frame Preview */}
//                         <div className="w-full lg:w-1/3 flex justify-center items-center">
//                             <div className="aspect-square w-full max-w-lg p-6 flex items-center justify-center">
//                                 <img
//                                     src={loop.frames?.[frameIndices[loop._id] || 0]?.canvasImg || ''}
//                                     alt={`Frame ${frameIndices[loop._id] || 0}`}
//                                     className="object-cover w-full h-full rounded-lg shadow-lg border-indigo-900 border-2"
//                                 />
//                             </div>
//                         </div>
//                         {/* Loop Details */}
//                         <div className="w-full lg:w-2/3 flex flex-col">
//                             <div className="w-full h-full p-6 flex flex-col">
//                                 <div className="bg-indigo-500 text-white flex justify-between items-center p-3 rounded-t-lg shadow-md">
//                                     <div className="flex items-center space-x-2">
//                                         <h2 className="text-2xl font-bold">{usernames[loop._id] || 'Loading...'}</h2>
//                                         <button
//                                             className="px-3 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200"
//                                             onClick={() => console.log(`Visit profile for ${usernames[loop._id]}`)}
//                                         >
//                                             <FaUser />
//                                         </button>
//                                     </div>
//                                     <div className="flex space-x-2">
//                                         <span className="text-sm">{loop.likeCount}</span>
//                                         <button
//                                             className={`px-4 py-1 rounded-lg text-sm hover:bg-gray-200 ${likedLoops[loop._id]
//                                                 ? 'bg-white text-red-500'
//                                                 : 'bg-white text-indigo-500'
//                                                 }`}
//                                             onClick={() => handleLike(loop._id)}
//                                         >
//                                             <FaHeart />
//                                         </button>
//                                         <button
//                                             className="px-4 py-1 rounded-lg bg-white text-indigo-500 text-sm hover:bg-gray-200"
//                                             onClick={() => openModal(loop._id)}
//                                         >
//                                             <FaCommentAlt />
//                                         </button>
//                                     </div>
//                                 </div>
//                                 <div className="bg-gray-50 p-4 rounded-b-lg flex-1 mt-4 shadow-md">
//                                     <h3 className="text-sm font-bold mb-2">Comments</h3>
//                                     {loop.comments && loop.comments.length > 0 ? (
//                                         loop.comments.map((comment: any) => (
//                                             <p key={comment._id} className="text-sm text-gray-700 mb-1">
//                                                 <strong>{comment.username}:</strong> {comment.body}
//                                             </p>
//                                         ))
//                                     ) : (
//                                         <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             ))}
//             {/* Comment Modal */}
//             <CommentModal
//                 isOpen={isModalOpen}
//                 onClose={closeModal}
//                 onSubmit={handleCommentSubmit}
//             />
//         </div>
//     );
// };

// export default HomePage;

























import React, { useEffect, useState } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { GET_LOOPS, GET_USER_BY_LOOP, QUERY_ME } from '../utils/queries';
import { CREATE_COMMENT, ADD_LIKE_TO_LOOP } from '../utils/mutations';
import { FaUser, FaHeart, FaCommentAlt } from 'react-icons/fa';
import socket from '../utils/socket';
import CommentModal from '../components/CommentModal';

const HomePage: React.FC = () => {
    const [loops, setLoops] = useState<any[]>([]);
    const [frameIndices, setFrameIndices] = useState<{ [key: string]: number }>({});
    const [likedLoops, setLikedLoops] = useState<{ [key: string]: boolean }>({});
    const [usernames, setUsernames] = useState<{ [key: string]: string }>({});
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedLoopId, setSelectedLoopId] = useState<string | null>(null);
    const { data, loading, error } = useQuery(GET_LOOPS);
    const { data: userData } = useQuery(QUERY_ME);
    const [createComment] = useMutation(CREATE_COMMENT);
    const [addLikeToLoop] = useMutation(ADD_LIKE_TO_LOOP);
    const [fetchUserByLoop] = useLazyQuery(GET_USER_BY_LOOP);
    const currentUserId = userData?.me?._id;
    //const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize loops and likedLoops state
    useEffect(() => {
        if (data?.getLoops) {
            setLoops(data.getLoops);

            if (currentUserId) {
                const initialLikes = data.getLoops.reduce((acc: { [key: string]: boolean }, loop: any) => {
                    const userLiked = loop.likes.some((like: any) => like.userId === currentUserId);
                    acc[loop._id] = userLiked;
                    return acc;
                }, {});
                setLikedLoops(initialLikes);
            }
        }
    }, [data, currentUserId]);

    // Fetch usernames for loops
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

    // Socket.IO listeners for real-time updates
    useEffect(() => {
        socket.on('newLoop', (newLoop) => {
            setLoops((prevLoops) => [newLoop, ...prevLoops]);
        });

        socket.on('newComment', (newComment) => {
            console.log("New comment received:", newComment);
            setLoops((prevLoops) =>
                prevLoops.map((loop) =>
                    loop._id === newComment.loopId
                        ? {
                            ...loop,
                            comments: [...(loop.comments || []), newComment], // Add the new comment
                        }
                        : loop
                )
            );
        });

        socket.on('likeUpdate', ({ loopId, likeCount, likes }) => {
            console.log("Like update received for loop:", loopId);
            setLoops((prevLoops) =>
                prevLoops.map((loop) =>
                    loop._id === loopId
                        ? {
                              ...loop,
                              likeCount, // Update likeCount
                              likes, // Replace likes array with the latest value
                              comments: loop.comments || [], // Ensure comments are preserved
                          }
                        : loop
                )
            );
    
            if (currentUserId) {
                setLikedLoops((prev) => ({
                    ...prev,
                    [loopId]: likes.some((like: any) => like.userId === currentUserId),
                }));
            }
        });

        return () => {
            socket.off('newLoop');
            socket.off('newComment');
            socket.off('likeUpdate');
        };
    }, [currentUserId]);

    // Frame animation logic
    useEffect(() => {
        if (loops.length) {
            // Initialize frame indices for new loops
            const initialIndices = loops.reduce((acc: { [key: string]: number }, loop: any) => {
                acc[loop._id] = acc[loop._id] || 0; // Preserve existing indices if already set
                return acc;
            }, { ...frameIndices });

            setFrameIndices(initialIndices);

            // Start frame animation
            const interval = setInterval(() => {
                setFrameIndices((prevIndices) => {
                    const updatedIndices = { ...prevIndices };
                    loops.forEach((loop: any) => {
                        const totalFrames = loop.frames?.length || 0;
                        if (totalFrames > 0) {
                            updatedIndices[loop._id] = (updatedIndices[loop._id] + 1) % totalFrames;
                        }
                    });
                    return updatedIndices;
                });
            }, 500); // Adjust animation speed as needed

            return () => clearInterval(interval);
        }
    }, [loops]);

    // Open and close modal
    const openModal = (loopId: string) => {
        setSelectedLoopId(loopId);
        setModalOpen(true);
    };

    const closeModal = () => {
        setSelectedLoopId(null);
        setModalOpen(false);
    };

    // Handle comment submission
    const handleCommentSubmit = async (commentBody: string) => {
        if (!selectedLoopId) return;

        try {
            await createComment({
                variables: {
                    input: { body: commentBody, loopId: selectedLoopId },
                },
            });

            closeModal();
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };

    const handleLike = async (loopId: string) => {
        try {
            console.log("Toggling like for loop ID:", loopId);

            // Optimistically update likes and preserve comments
            setLoops((prevLoops) =>
                prevLoops.map((loop) =>
                    loop._id === loopId
                        ? {
                            ...loop,
                            likeCount: loop.likes.some((like: any) => like.userId === currentUserId)
                                ? loop.likeCount - 1
                                : loop.likeCount + 1,
                            likes: loop.likes.some((like: any) => like.userId === currentUserId)
                                ? loop.likes.filter((like: any) => like.userId !== currentUserId)
                                : [...loop.likes, { userId: currentUserId }],
                            comments: loop.comments || [], // Preserve comments
                        }
                        : loop
                )
            );

            // Send mutation to update the backend
            await addLikeToLoop({ variables: { _id: loopId } });
        } catch (error) {
            console.error("Error toggling like:", error);

            // Revert optimistic update if the mutation fails
            setLoops((prevLoops) =>
                prevLoops.map((loop) =>
                    loop._id === loopId
                        ? {
                            ...loop,
                            likeCount: loop.likes.some((like: any) => like.userId === currentUserId)
                                ? loop.likeCount + 1
                                : loop.likeCount - 1,
                            likes: loop.likes.some((like: any) => like.userId === currentUserId)
                                ? [...loop.likes, { userId: currentUserId }]
                                : loop.likes.filter((like: any) => like.userId !== currentUserId),
                            comments: loop.comments || [], // Preserve comments
                        }
                        : loop
                )
            );
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching loops: {error.message}</div>;

    return (
        <div className="min-h-screen bg-indigo-100 p-6 space-y-8">
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
                                        <span className="text-sm">{loop.likeCount}</span>
                                        <button
                                            className={`px-4 py-1 rounded-lg text-sm hover:bg-gray-200 ${likedLoops[loop._id]
                                                ? 'bg-white text-red-500'
                                                : 'bg-white text-indigo-500'
                                                }`}
                                            onClick={() => handleLike(loop._id)}
                                        >
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
            <CommentModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleCommentSubmit} />
        </div>
    );
};

export default HomePage;

