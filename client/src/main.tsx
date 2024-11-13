import ReactDom from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import App from './App.tsx'
import HomePage from './pages/homePage.tsx'
import CanvasPage from './pages/canvasPage.tsx'
import ProfilePage from './pages/profilePage.tsx'
import Error from './pages/errorPage.tsx'
import Login from './components/Login.tsx'
import Register from './components/Register.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <Error/>,
    children: [
      {
        index: true,
        element: <Register/>
      },
      {
        path: '/canvas',
        element: <CanvasPage/>
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: '/home',
        element: <HomePage />
      },
      {
        path: '/profile',
        element: <ProfilePage/>
      }
    ]
  }
]);

const rootElement = document.getElementById('root');
if(rootElement){
  ReactDom.createRoot(rootElement).render(<RouterProvider router={router}/>)
};
