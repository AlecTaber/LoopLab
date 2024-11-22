import React, { useEffect, useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_LOOPS } from '../utils/queries';

const ProfilePage: React.FC = () => {
    return (
        <div className="homepage-container min-h-screen bg-blue-100 p-6 space-y-8">
            <div className="lg:fixed lg:w-64 lg:h-5/6 bg-white shadow-md rounded-lg overflow-hidden border border-gray-300 p-6 mt-20">
                <h1 className="text-2xl font-bold mb-2">Insert Username</h1>
                <h2 className="text sm mb-4">Change Username</h2>
                <h2 className="text-lg mb-4">insert user email</h2>
            </div>
            <div></div>
        </div>
    );
}

export default ProfilePage;