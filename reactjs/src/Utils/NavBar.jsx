import { useAuth } from "../security/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function NavBar(){

    const auth = useAuth();
    const goTo = useNavigate();

    function handleLogOut(e) {
        e.preventDefault();

        auth.logOut();
        goTo("/login");
    }

    return(
        <nav className="navLayout">
            <button onClick={handleLogOut}>Log out</button>
        </nav>
    );
}