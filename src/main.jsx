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
import BinanceWithdrawal from './component/new/BinanceWithdrawal.jsx';
import BybitWithdrawal from './component/new/BybitWithdrawal.jsx';
import PrivateRoute from './Route/PrivateRoute.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        // Auth is checked inside PrivateRoute so it re-evaluates on every
        // render. Calling it here would freeze the result at module load and
        // strand the user on /login until a full page reload.
        index: true,
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        )
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
      // New Templates — same generators, redrawn to match the latest
      // screenshots. Namespaced under /new so the V1 routes stay untouched.
      {
        path: "new/binance-light",
        element: (
          <PrivateRoute>
            <BinanceWithdrawal />
          </PrivateRoute>
        )
      },
      {
        path: "new/binance-dark",
        element: (
          <PrivateRoute>
            <BinanceWithdrawal dark />
          </PrivateRoute>
        )
      },
      {
        path: "new/bybit-dark",
        element: (
          <PrivateRoute>
            <BybitWithdrawal dark />
          </PrivateRoute>
        )
      },
      {
        path: "new/bybit-light",
        element: (
          <PrivateRoute>
            <BybitWithdrawal />
          </PrivateRoute>
        )
      },
      // Catch all - send everything home; PrivateRoute redirects to /login
      // from there if the session isn't valid.
      {
        path: "*",
        element: <Navigate to="/" replace />
      }
    ]
  },
], {
  // '/' in dev, '/thor-wallet/' in a production build. Keeps every `to="/..."`
  // in the app subpath-agnostic instead of hardcoding the Pages prefix.
  basename: import.meta.env.BASE_URL,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);