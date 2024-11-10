import ReactDom from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import App from './App.tsx'
import HomePage from './pages/homePage.tsx'
import CanvasPage from './pages/canvasPage.tsx'
import Error from './pages/errorPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    errorElement: <Error/>,
    children: [
      {
        index: true,
        element: <HomePage/>
      },
      {
        path: '/canvas',
        element: <CanvasPage/>
      }
    ]
  }
]);

const rootElement = document.getElementById('root');
if(rootElement){
  ReactDom.createRoot(rootElement).render(<RouterProvider router={router}/>)
};
