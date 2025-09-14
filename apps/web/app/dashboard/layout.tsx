import { redirect } from "next/navigation";
import { Layout } from "../../components/Layout";
import { AuthProvider } from "../../features/auth/AuthProvider";
import { getAuth } from "../../features/auth/getAuth";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  // Auth kontrolünü kaldır - dashboard'a erişimi engelleme
  // const auth = await getAuth();

  // if (!auth.isAuthenticated) {
  //   return redirect("/auth");
  // }

  return (
    // pass auth to client component via server component
    <AuthProvider>
      <Layout>{children}</Layout>
    </AuthProvider>
  );
};

export default DashboardLayout;
