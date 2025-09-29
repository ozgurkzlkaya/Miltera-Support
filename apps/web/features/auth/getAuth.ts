// import { getSession } from "./auth.service";
import type { Auth } from "./AuthProvider";

const getAuth = async () => {
  try {
    // const session = await getSession();
    
    return {
      isLoading: false,
      isAuthenticated: false,
      user: null,
    } as Auth;
  } catch (error) {
    return {
      isLoading: false,
      isAuthenticated: false,
      user: null,
    } as Auth;
  }
};

export { getAuth };
