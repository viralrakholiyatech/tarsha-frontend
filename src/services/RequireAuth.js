import React, { useEffect } from 'react';
import { useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import {
  getToken,
  getUserRoles,
  shouldAllowedOfRoles,
  isSessionExpired,
  clearSession,
} from './useLocalStorage';

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

const RequireAuth = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { accessible } = props;

  const token = getToken();
  const expired = isSessionExpired();

  useEffect(() => {
    // If token exists but is already expired, logout immediately
    if (token && expired) {
      clearSession();
      navigate('/login', { state: { from: location, sessionExpired: true }, replace: true });
      return;
    }

    if (!token) return;

    // Calculate remaining milliseconds in 3-hour session
    const loginTimeStr = localStorage.getItem('login_time');
    const loginTime = loginTimeStr ? parseInt(loginTimeStr, 10) : Date.now();
    const elapsed = Date.now() - loginTime;
    const remaining = Math.max(0, THREE_HOURS_MS - elapsed);

    // Active timer to logout exactly when 3 hours elapse
    const timer = setTimeout(() => {
      clearSession();
      navigate('/login', { state: { from: location, sessionExpired: true }, replace: true });
    }, remaining);

    // Periodic safety check every 15s (e.g. if computer slept/woke up)
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        clearSession();
        navigate('/login', { state: { from: location, sessionExpired: true }, replace: true });
      }
    }, 15000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [token, expired, location, navigate]);

  if (!token || expired) {
    clearSession();
    return <Navigate to="/login" state={{ from: location, sessionExpired: !!token }} replace />;
  }

  shouldAllowedOfRoles(getUserRoles(), accessible);

  return <Outlet />;
};

export default RequireAuth;