import { useState } from 'react'
import './App.css'

import NavBar from './components/navbar'
import { Outlet } from 'react-router-dom'

function App() {

  return (
    <>
      <main>
        <div>
          <NavBar/>
        </div>

        <body>
          <Outlet/>
        </body>
      </main>
    </>
  )
}

export default App
