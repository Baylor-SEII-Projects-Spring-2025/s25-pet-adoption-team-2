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
    if (loading) return;

    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }

    if (requiredUserType && user?.userType !== requiredUserType) {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, loading, requiredUserType, router, user]);

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

  if (isAuthenticated() && (!requiredUserType || user?.userType === requiredUserType)) {
    return children;
  }

  return null;
};

export default ProtectedRoute;