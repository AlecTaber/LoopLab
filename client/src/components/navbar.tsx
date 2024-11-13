import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "../navbar.css";

const NavBar: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleNavigation = (path: string) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate(path);
        }, 500); // Ensures loading screen is shown for at least 0.5 seconds
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="navbar-container">
            <nav className="flex items-center space-x-4 p-4 bg-indigo-600">
                <button onClick={() => handleNavigation("/")} className="link text-white hover:text-gray-200">Home</button>
                <button onClick={() => handleNavigation("/canvas")} className="link text-white hover:text-gray-200">Canvas</button>
                <button onClick={() => handleNavigation("/profile")} className="link text-white hover:text-gray-200">My Profile</button>
                <button onClick={() => handleNavigation("/login")} className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-gray-200">
                    Login
                </button>
                <button onClick={() => handleNavigation("/register")} className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-gray-200">
                    Register
                </button>
            </nav>
            <h3 className="mt-4 text-indigo-600">Loop Lab NavBar</h3>
        </div>
    );
};

export default NavBar;
