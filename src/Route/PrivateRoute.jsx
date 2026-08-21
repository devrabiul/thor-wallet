import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth';

const PrivateRoute = ({ children }) => {
    const location = useLocation();

    // Evaluated on every render, so a fresh login is picked up immediately.
    if (!isAuthenticated()) {
        // Pass the attempted route along so Login can send them back to it.
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
};

export default PrivateRoute;
