import React from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (commentBody: string) => void;
}

const CommentModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [comment, setComment] = React.useState("");

    const handleSubmit = () => {
        onSubmit(comment);
        setComment("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div
                className="bg-white rounded-lg p-6 shadow-lg w-full max-w-4xl"
                style={{
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                <h2 className="text-xl font-bold mb-4 text-indigo-500">Add a Comment</h2>
                <textarea
                    className="w-full p-2 border rounded mb-4 bg-gray-100"
                    rows={6}
                    placeholder="Write your comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                ></textarea>
                <div className="flex justify-end space-x-4">
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
