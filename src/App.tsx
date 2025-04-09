import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import MyQuizzes from "./pages/MyQuizzes";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/SideBar";
import Explore from "./pages/Explore";
import CreateQuiz from "./pages/CreateQuiz";
import PlayQuiz from "./pages/PlayQuiz";
import QuizDetails from "./pages/QuizDetails";
import Loading from "./components/Loading";
import NotFound from "./pages/NotFound";

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isPublicRoute = location.pathname === "/login";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) return <Loading />;

  return (
    <div className="flex min-h-screen">
      {!isPublicRoute && (
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      )}
      <main
        className={`flex-1 h-screen overflow-y-auto bg-gray-900 text-white transition-all duration-300 ease-in-out
                ${!isPublicRoute ? "md:ml-20 lg:ml-72" : ""}`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute user={user}>
                <Explore />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/my-quizzes"
            element={
              <PrivateRoute user={user}>
                <MyQuizzes />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-quiz"
            element={
              <PrivateRoute user={user}>
                <CreateQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/play-quiz/:quizId"
            element={
              <PrivateRoute user={user}>
                <PlayQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/details/:quizId"
            element={
              <PrivateRoute user={user}>
                <QuizDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </main>
    </div>
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