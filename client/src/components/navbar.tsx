import { Link } from "react-router-dom";
import React from "react";

const NavBar: React.FC = () => {
    return (
        <div>
            <nav>
                <Link to="/" className="link">Home</Link>
                <Link to="/canvas" className="link">Canvas</Link>
                <Link to="/login">
                    <button className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-gray-200">
                        Login
                    </button>
                </Link>
                <Link to="/register">
                    <button className="bg-white text-indigo-600 px-4 py-2 rounded hover:bg-gray-200">
                        Register
                    </button>
                </Link>
            </nav>
            <h3>Loop Lab NavBar</h3>
        </div>
    );
};

export default NavBar;