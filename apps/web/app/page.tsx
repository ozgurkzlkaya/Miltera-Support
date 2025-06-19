import { redirect } from "next/navigation";
import { getAuth } from "../features/auth/getAuth";

const HomePage = async () => {
  const auth = await getAuth();

  if (auth.isAuthenticated) {
    redirect("/dashboard");
  } else {
    redirect("/auth");
  }
};

export default HomePage;
