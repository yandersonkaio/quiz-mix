import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Loading from "./components/Loading";
import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./components/MainLayout";

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
