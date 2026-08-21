import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import Home from './component/Home.jsx';
import BinanceLight from './component/BinanceLight.jsx';
import BinanceDark from './component/BinanceDark.jsx';
import Bybit from './component/Bybit.jsx';
import BybitLight from './component/BybitLight.jsx';
import Login from './component/Login.jsx';
import PrivateRoute from './Route/PrivateRoute.jsx';

// Helper function to check authentication
const isAuthenticated = () => {
  const auth = localStorage.getItem('isAuthenticated') === 'true';
  const loginTime = localStorage.getItem('loginTime');
  
  if (auth && loginTime) {
    const currentTime = Date.now();
    const timeElapsed = currentTime - parseInt(loginTime);
    
    // Check if session has expired (1 hour = 3600000ms)
    if (timeElapsed >= 3600000) {
      // Clear expired session
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      localStorage.removeItem('loginTime');
      return false;
    }
    return true;
  }
  return false;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: isAuthenticated() ? <Home /> : <Navigate to="/login" replace />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "binance-light",
        element: (
          <PrivateRoute>
            <BinanceLight />
          </PrivateRoute>
        )
      },
      {
        path: "binance-dark",
        element: (
          <PrivateRoute>
            <BinanceDark />
          </PrivateRoute>
        )
      },
      {
        path: "bybit",
        element: (
          <PrivateRoute>
            <Bybit />
          </PrivateRoute>
        )
      },
      {
        path: "bybit-light",
        element: (
          <PrivateRoute>
            <BybitLight />
          </PrivateRoute>
        )
      },
      // Catch all route - redirect to home or login
      {
        path: "*",
        element: isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
      }
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);