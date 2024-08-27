import { useState } from 'react';
import { API_URL } from '../utils/Constants.jsx';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../security/AuthProvider.jsx';

import '../styles/SignUp.css'

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
        <form className='form-signup' onSubmit={''}>
            <h1 className='header-welcome'>WELCOME</h1>
            <div className='container-input'>
                <div>
                    <label className='label-username' htmlFor='username'>Email</label>
                    <input className='input-username' name='username' onChange={(e) => setUsername(e.target.value)}/>
                </div>
                <div>
                    <label className='label-email' htmlFor='email'>Email</label>
                    <input className='input-email' name='email' onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div>
                    <label className='label-password' htmlFor='password'>Password</label>
                    <input type='password' className='input-password' name='password' onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div>
                    <label className='label-confirm-password' htmlFor='confirm-password'>Confirm your password</label>
                    <input type='password' className='input-confirm-password' name='confirm-password' onChange={(e) => setConfirmPassword(e.target.value)}/>
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