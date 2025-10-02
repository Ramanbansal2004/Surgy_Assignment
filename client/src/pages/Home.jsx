import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            // Handle case where user data is not in local storage
            handleLogout();
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            
            <div className="w-full max-w-lg p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-center">
                <h1 className="text-4xl font-bold">Welcome, {user.name}! 👋</h1>
                <p className="text-lg text-gray-300">You have successfully logged in.</p>
                <div className="border-t border-gray-700 my-6"></div>
                <div className="text-left space-y-4">
                    <h3 className="text-xl font-semibold">Your Credentials</h3>
                    <p className="text-md"><strong className="font-medium text-indigo-400">Name:</strong> {user.name}</p>
                    <p className="text-md"><strong className="font-medium text-indigo-400">Email:</strong> {user.email}</p>
                    <p className="text-md"><strong className="font-medium text-indigo-400">Phone:</strong> {user.phone}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full py-3 mt-8 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Home;