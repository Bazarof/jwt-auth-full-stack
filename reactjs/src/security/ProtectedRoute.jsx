import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from 'AuthProvider.jsx';

export default function ProtectedRoute() {

    const user = useAuth();

    return user.isAuthenticated ? <Outlet/> : <Navigate to={"/login"}/>
}