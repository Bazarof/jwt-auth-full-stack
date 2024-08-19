//import { useState } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './security/ProtectedRoute.jsx';
import Login from './routes/Login.jsx';
import SignUp from './routes/SignUp.jsx';
import Home from './routes/Home.jsx';
import './App.css'
//import AuthProvider from './security/AuthProvider';
import AuthProvider from './security/AuthProvider.jsx';

//Route configuration

function App() {
  //const [count, setCount] = useState(0)

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login/>
    },
    {
      path: "/signup",
      element: <SignUp/>
    },
    {
      path: "/",
      element: <ProtectedRoute/>,
      children: [
        {
          path:"home",
          element: <Home/>
        }
      ]
    },
  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App;