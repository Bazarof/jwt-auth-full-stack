import { useState } from 'react';
import { API_URL } from '../utils/Constants.jsx';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import '../styles/SignUp.css'
import { useAuth } from '../security/AuthProvider.jsx';

export default function SignUp(){

    // Input
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errorResponse, setErrorResponse] = useState([]);

    //const [errorsEmail, setErrorsEmail] = useState([]);
    //const [errorsPass, setErrorsPass] = useState([]);

    // Context and route
    const auth = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e){
        e.preventDefault();

        //check confirm password
        if (password !== confirmPassword) {
            console.log("Passwords do not match");
        } else {

            try {
                const response = await fetch(`${API_URL}/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                    }),
                });

                if (response.ok) {
                    // print positive message
                    console.log("User created successfully");
                    navigate("/login", {replace: true});

                } else {

                    //let errorList = [];
                    //errorList = (await response.json()).errors;

                    //console.log(errorList
                    //    .filter(error => error.code.includes('Password')));

                    //setErrorsEmail(errorList
                    //    .filter(error => error.code.includes('Password'))
                    //);

                    //setErrorsPass(errorList
                    //    .filter(error => error.code.includes('Email'))

                    //);
                    
                    //console.log((await response.json()).errors);
                    let errorlist = (await response.json()).errors;
                    setErrorResponse(errorlist);
                    console.log(errorlist);
                }

            } catch (error) {
                console.log(error);
            }
        }

    }

    // if the auth was checked in AuthProvder
    if(auth.isAuthenticated){
        return <Navigate to="/home"/>;
    }

    return(
        <>
            
        </>
    );
}