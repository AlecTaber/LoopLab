import { jwtDecode } from 'jwt-decode';

export const getUserDataFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if(!token){
        throw new Error("Token does not exist!")
      }

      console.log("Token", token);

      const decoded = (jwtDecode as any)(token);

      console.log("UserId:", decoded.userId);
      console.log("Username:", decoded.username);
      
      return {
        userId: decoded.userId,
        username: decoded.username
      };
    } catch (error) {
      console.error("Failed to decode token", error);
      return null;
    }
};
