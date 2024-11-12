import jwtDecode from 'jwt-decode';

export const getUserDataFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = (jwtDecode as any)(token);
      
      return {
        userId: decoded.userId,
        username: decoded.username
      };
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
  }
  return null;
};
