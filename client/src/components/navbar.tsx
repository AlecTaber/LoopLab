import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "../navbar.css";
import { AiFillHome } from "react-icons/ai";
import { FaPlusSquare } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaInfinity } from "react-icons/fa";



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
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="navbar-container sticky top-0">
    <nav className="flex items-center justify-between p-4 bg-indigo-600">
        {/* Left Section: Navigation Buttons */}
        <div className="flex items-center space-x-4">
            <button onClick={() => handleNavigation("/home")} className="link text-white text-4xl hover:text-gray-200"><AiFillHome /></button>
            <button onClick={() => handleNavigation("/canvas")} className="link text-white text-4xl hover:text-gray-200"><FaPlusSquare /></button>
            
        </div>

        {/* Center Section: Logo */}
        <h1 className="text-4xl text-white font-bold flex items-center space-x-1">
            <span>L</span>
            <FaInfinity/>
            <span>PLAB</span>
        </h1>

        {/* Placeholder for Right Section if Needed */}
        <button onClick={() => handleNavigation("/profile")} className="link text-white text-4xl hover:text-gray-200"><FaUser /></button>
    </nav>
</div>
    );
};

export default NavBar;
