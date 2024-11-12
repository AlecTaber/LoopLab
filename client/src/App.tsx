import './App.css';
import NavBar from './components/navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      <NavBar />
      <Outlet /> {/* This will render child routes, like HomePage and CanvasPage */}
    </div>
  );
}

export default App;
