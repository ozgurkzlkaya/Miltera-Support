import { redirect } from "next/navigation";
import { getAuth } from "../features/auth/getAuth";

const HomePage = async () => {
  // Auth kontrolünü kaldır - direkt dashboard'a yönlendir
  // const auth = await getAuth();

  // if (auth.isAuthenticated) {
  //   redirect("/dashboard");
  // } else {
  //   redirect("/auth");
  // }
  
  // Direkt dashboard'a yönlendir
  redirect("/dashboard");
};

export default HomePage;
