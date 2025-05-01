import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * A wrapper component for pages that require authentication in Next.js
 * 
 * Usage:
 * ```jsx
 * // pages/some-protected-page.jsx
 * import ProtectedRoute from '../components/ProtectedRoute';
 * 
 * const ProtectedPage = () => {
 *   return (
 *     <ProtectedRoute requiredUserType="SHELTER">
 *       <YourActualComponent />
 *     </ProtectedRoute>
 *   );
 * };
 * ```
 */
const ProtectedRoute = ({ children, requiredUserType }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Skip the check during initial loading
    if (loading) return;

    // If not authenticated, redirect to login
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    // If a specific user type is required, check for that as well
    if (requiredUserType && user?.userType !== requiredUserType) {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, loading, requiredUserType, router, user]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Show the protected content if authenticated and has right permissions
  if (isAuthenticated() && (!requiredUserType || user?.userType === requiredUserType)) {
    return children;
  }

  // Return null during redirect to avoid flashing content
  return null;
};

export default ProtectedRoute;