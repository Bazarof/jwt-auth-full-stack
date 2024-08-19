import { useContext, createContext, useState, useEffect} from "react";
import { API_URL } from "../utils/Constants";
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({
    isAuthenticated: false,
    setUserSessionData: (jwt) => {},
    getUserSession: () => {},
    logOut: () => {},
});

export default function AuthProvider({ children }) {
    // session state
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [userSession, setUserSession] = useState({id: "", email: "", username: "", accessToken: ""});

    async function logOut() {

        try {

            const response = await fetch(`${API_URL}/logout`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify(userSession.id),
                credentials: 'include'
            });

            if (response.ok) {
                setUserSession(null);
                setIsAuthenticated(false);
            }

        } catch (error) {
            console.log("Error: ", error);
        }

    }

    function setUserSessionData(jwt) {

        // decrypt claims to get email username and token
        const claims = jwtDecode(jwt.token);

        //console.log(claims);
        setUserSession({
            id: claims.id,
            email: claims.email,
            username: claims.name,
            accessToken: jwt.token
        });
        //console.log("email: ", claims.email, " username: ", claims.name, " token: ", jwt.token);
        setIsAuthenticated(true);
    }

    function getUserSession(){
        return userSession;
    }
    
    // when refreshing the page, checks if user has refreshToken
    useEffect(() => {
        const checkAuth = async () => {
            try {

                const response = await fetch(`${API_URL}/refresh`, {
                    method: 'POST',
                    headers: {
                        "Content-Type" : "application/json",
                    },
                    credentials: 'include',
                });
    
                if (!response.ok) {
    
                    logOut();
                    //console.log(response.status);
    
                } else {
    
                    setUserSessionData((await response.json()));
    
                }
            } catch (error) {
                console.log(error);
            }
        };
        checkAuth();
    },[]);

    // Check if refresh token is valid

    return <AuthContext.Provider value={{ isAuthenticated, setUserSessionData, getUserSession, logOut}}>{children}</AuthContext.Provider>;
}



export const useAuth = () => {
    return useContext(AuthContext);
}