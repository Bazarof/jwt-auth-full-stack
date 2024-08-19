import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../security/AuthProvider';
import { API_URL } from '../utils/Constants';

import '../styles/Login.css'

export default function Login(){

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [errorResponse, setErrorResponse] = useState("");

    const auth = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e){
        e.preventDefault();

        try {

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
                credentials: 'include', // Important to send and receive cookies correctly
            });

            if(response.ok){

                auth.setUserSessionData((await response.json()));
                navigate("/home");

            }else{

            }

        }catch(error){

            console.log(error);

        }

    }

    // if the auth was checked in AuthProvder
    if(auth.isAuthenticated){
        return <Navigate to="/home"/>;
    }

    return (
        <form className='form-login' >

        </form>
    );
}