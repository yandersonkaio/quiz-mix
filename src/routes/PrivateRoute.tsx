import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User } from 'firebase/auth';

interface PrivateRouteProps {
    user: User | null;
    children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ user, children }) => {
    const location = useLocation();

    const navigateTo = useMemo(() => {
        if (user) return null;
        const redirectTo = encodeURIComponent(location.pathname + location.search);
        const loginUrl = redirectTo === '%2F' ? '/login' : `/login?redirectTo=${redirectTo}`;
        return loginUrl;
    }, [user, location.pathname, location.search]);

    if (navigateTo) {
        return <Navigate to={navigateTo} replace />;
    }

    return children;
};

export default PrivateRoute;