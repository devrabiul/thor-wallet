import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    let logoutTimer;

    // Check authentication on mount
    useEffect(() => {
        const isAuth = localStorage.getItem('isAuthenticated');
        if (!isAuth || isAuth !== 'true') {
            navigate('/login');
        }
    }, [navigate]);

    // Function to handle logout
    const handleLogout = () => {
        // Clear localStorage
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        
        // Clear timer if exists
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
        
        // Navigate to login page
        navigate('/login');
    };

    // Function to reset timer
    const resetLogoutTimer = () => {
        // Clear existing timer
        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }
        
        // Set new timer for 1 hour (3600000 milliseconds)
        logoutTimer = setTimeout(() => {
            alert('Session expired! You will be logged out due to inactivity.');
            handleLogout();
        }, 3600000); // 1 hour = 3600000ms
    };

    // Set up activity listeners
    useEffect(() => {
        // Reset timer on user activity
        const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        
        const handleUserActivity = () => {
            resetLogoutTimer();
        };
        
        // Add event listeners
        activityEvents.forEach(event => {
            window.addEventListener(event, handleUserActivity);
        });
        
        // Initialize timer on component mount
        resetLogoutTimer();
        
        // Check if session has expired on mount (for page refresh)
        const loginTime = localStorage.getItem('loginTime');
        if (loginTime) {
            const currentTime = Date.now();
            const timeElapsed = currentTime - parseInt(loginTime);
            
            if (timeElapsed >= 3600000) {
                // Session expired
                handleLogout();
            } else {
                // Set remaining time
                const remainingTime = 3600000 - timeElapsed;
                logoutTimer = setTimeout(() => {
                    alert('Session expired! You will be logged out.');
                    handleLogout();
                }, remainingTime);
            }
        }
        
        // Cleanup on unmount
        return () => {
            if (logoutTimer) {
                clearTimeout(logoutTimer);
            }
            
            // Remove event listeners
            activityEvents.forEach(event => {
                window.removeEventListener(event, handleUserActivity);
            });
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500">
            {/* Header with Logout Button and Timer Display */}
            <div className="bg-white/10 backdrop-blur-xl shadow-lg">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-white text-lg font-semibold">
                                Welcome, <span className="text-yellow-300">{username || 'User'}</span>
                            </h2>
                            <p className="text-white/70 text-sm">
                                Role: <span className="text-green-300">{userRole || 'Guest'}</span>
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="flex flex-col gap-6 w-full max-w-sm px-6">

                    {/* Binance Light */}
                    <Link to="/binance-light">
                        <button className="w-full py-4 rounded-2xl text-white text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 shadow-xl hover:scale-105 transition duration-300">
                            Binance Light
                        </button>
                    </Link>

                    {/* Binance Dark */}
                    <Link to="/binance-dark">
                        <button className="w-full py-4 rounded-2xl text-white text-xl font-bold bg-gradient-to-r from-gray-900 to-black shadow-xl hover:scale-105 transition duration-300 border border-yellow-400">
                            Binance Dark
                        </button>
                    </Link>

                    {/* Bybit Dark */}
                    <Link to="/bybit">
                        <button className="w-full py-4 rounded-2xl text-white text-xl font-bold bg-gradient-to-r from-gray-900 to-black shadow-xl hover:scale-105 transition duration-300">
                            Bybit Dark
                        </button>
                    </Link>

                    {/* Bybit Light */}
                    <Link to="/bybit-light">
                        <button className="w-full py-4 rounded-2xl text-white text-xl font-bold bg-gradient-to-r from-pink-500 to-red-500 shadow-xl hover:scale-105 transition duration-300">
                            Bybit Light
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    );
};

export default Home;