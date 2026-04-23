import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if a user ID exists in your storage
  const isAuthenticated = localStorage.getItem('user_id');

  if (!isAuthenticated) {
    // If not logged in, kick them back to the login page
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;