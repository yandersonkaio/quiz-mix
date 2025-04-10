import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { User } from "firebase/auth";

interface PrivateRouteProps {
    user: User | null;
    children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ user, children }) => {
    const location = useLocation();

    return user ? (
        children
    ) : (
        <Navigate to="/login" state={{ from: location.pathname }} replace />
    );
};

export default PrivateRoute;