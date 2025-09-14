import { getSession } from "./auth.service";
import type { Auth } from "./AuthProvider";

const getAuth = async () => {
  try {
    const session = await getSession();
    
    return {
      isAuthenticated: session.user !== null,
      session: null, // Session artık kullanmıyoruz
      user: session.user,
    } as Auth & { isLoading: false };
  } catch (error) {
    return {
      isAuthenticated: false,
      session: null,
      user: null,
    } as Auth & { isLoading: false };
  }
};

export { getAuth };
