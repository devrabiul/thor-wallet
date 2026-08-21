import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const loginTime = localStorage.getItem('loginTime');
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    // Check if session has expired
    if (loginTime) {
        const currentTime = Date.now();
        const timeElapsed = currentTime - parseInt(loginTime);
        
        if (timeElapsed >= 3600000) { // 1 hour
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
            localStorage.removeItem('username');
            localStorage.removeItem('loginTime');
            return <Navigate to="/login" replace />;
        }
    }
    
    return children;
};

export default PrivateRoute;