import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "../components/Loading";
import PrivateRoute from "./PrivateRoute";
import { useAuth } from "../contexts/AuthContext";
import PublicLayout from "../layouts/PublicLayout";
import PrivateLayout from "../layouts/PrivateLayout";

const Login = lazy(() => import("../pages/Login"));
const Explore = lazy(() => import("../pages/Explore"));
const MyQuizzes = lazy(() => import("../pages/MyQuizzes"));
const CreateQuiz = lazy(() => import("../pages/CreateQuiz"));
const PlayQuiz = lazy(() => import("../pages/PlayQuiz"));
const QuizDetails = lazy(() => import("../pages/QuizDetails"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRoutes() {
    const { user } = useAuth();

    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/login" element={<Login />} />
                </Route>
                <Route
                    element={
                        <PrivateRoute user={user}>
                            <PrivateLayout />
                        </PrivateRoute>
                    }
                >
                    <Route path="/" element={<Explore />} />
                    <Route path="/my-quizzes" element={<MyQuizzes />} />
                    <Route path="/create-quiz" element={<CreateQuiz />} />
                    <Route path="/play-quiz/:quizId" element={<PlayQuiz />} />
                    <Route path="/quiz/details/:quizId" element={<QuizDetails />} />
                </Route>
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
}