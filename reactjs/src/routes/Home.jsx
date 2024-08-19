//import { useNavigate } from "react-router-dom";
import { useAuth } from "../security/AuthProvider";
import NavBar from "../utils/NavBar";

export default function Home(){

    const auth = useAuth();
    
    console.log('is auth: ', auth.isAuthenticated);

    return (
        <>
            <NavBar />
            <h1>Welcome {auth.getUserSession().username}</h1>
        </>
    );
}