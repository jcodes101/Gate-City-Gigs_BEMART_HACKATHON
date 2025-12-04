import { Navigate } from "react-router-dom";
import { useUser } from "./context_provider";



const ProtectedRoute = ({ children }) => {
    const { user, isLoading } = useUser();
    // change when we figure out a proper reroute location
    const reroute_location = "/";
    // Show loading while checking authentication
    if (isLoading) {
        return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="text-lg">Loading...</div>
        </div>
        );
    }

    // If no user, send to login
    if (!user) {
        return <Navigate to={reroute_location} replace />;
    }

    return children;
    };

export default ProtectedRoute;
