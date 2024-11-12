import jwtDecode from 'jwt-decode';

export const getUserDataFromToken = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const decoded = jwtDecode(token);
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
