import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import Loading from "./components/Loading";

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return <AppRoutes />;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<Loading />}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;