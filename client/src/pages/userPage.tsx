import React from "react";

const UserPage: React.FC = () => {
    return (
        <div className="profile-page-container min-h-screen bg-blue-100 p-4 flex flex-col gap-6">
            <div className='relative inline-flex'>
                {/* Username dropdown */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-3 items-center">
                    <h1 className="text-2xl font-bold">Display Username</h1>
                </div>
            </div>
        </div>
    );
};

export default UserPage;