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

                //const error = (await response.json()).message;

                setErrorResponse((await response.json()).message);

                //console.log(error);

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
        <form className='form-login' onSubmit={handleSubmit}>
            <h1>WELCOME</h1>

            {!!errorResponse && <div className='error-response'>{errorResponse}</div>}

            <div className='container-input'>
                <div>
                    <label className='label-email'>Email</label>
                    <input className='input-login-email' onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div>
                    <label className='label-password'>Password</label>
                    <input type='password' className='input-login-password' onChange={(e) => setPassword(e.target.value)}/>
                </div>
            </div>
            <div>
                <button type='submit' className='form-button' >Login</button>
            </div>
            <div>
                <Link className="link-signup" to="/signup">Sign-Up</Link>
            </div>
        </form>
    );
}