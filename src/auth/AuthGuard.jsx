import { Navigate, Outlet } from "react-router-dom";
import { AuthStatus, useAuth } from "../context/AuthContext";

const AuthGuard = () => {
    const { authStatus } = useAuth();

    if (authStatus === AuthStatus.LOADING) {
        return <p>Loading...</p>; // Show a loader while checking auth status
    }

    return authStatus === AuthStatus.AUTHENTICATED ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthGuard;
