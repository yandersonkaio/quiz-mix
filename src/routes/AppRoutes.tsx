import { Routes, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PrivateRoute from "./PrivateRoute";
import { Suspense, lazy } from "react";
import Loading from "../components/Loading";

const Login = lazy(() => import("../pages/Login"));
const MyQuizzes = lazy(() => import("../pages/MyQuizzes"));
const Explore = lazy(() => import("../pages/Explore"));
const CreateQuiz = lazy(() => import("../pages/CreateQuiz"));
const PlayQuiz = lazy(() => import("../pages/PlayQuiz"));
const QuizDetails = lazy(() => import("../pages/QuizDetails"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRoutes() {
    const { user } = useAuth();

    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute user={user}><Explore /></PrivateRoute>} />
                <Route path="/my-quizzes" element={<PrivateRoute user={user}><MyQuizzes /></PrivateRoute>} />
                <Route path="/create-quiz" element={<PrivateRoute user={user}><CreateQuiz /></PrivateRoute>} />
                <Route path="/play-quiz/:quizId" element={<PrivateRoute user={user}><PlayQuiz /></PrivateRoute>} />
                <Route path="/quiz/details/:quizId" element={<PrivateRoute user={user}><QuizDetails /></PrivateRoute>} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}
