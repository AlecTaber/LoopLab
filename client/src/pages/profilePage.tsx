import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOOPS } from '../utils/queries';

const ProfilePage: React.FC = () => {
    return (
        <div className="homepage-container min-h-screen bg-blue-100 p-6 flex gap-6">
            <div className="lg:fixed lg:w-1/7 lg:h-5/6 bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-6">
                <h1 className="text-2xl font-bold mb-2">Insert Username</h1>
                <h2 className="text sm mb-4">Change Username</h2>
                <h2 className="text-lg mb-4">insert user email</h2>
            </div>
            <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 mx-auto p-6 lg:ml-[15%] space-y-8" 
            style={{
                maxWidth: '90%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}></div>
        </div>
    );
}

export default ProfilePage;