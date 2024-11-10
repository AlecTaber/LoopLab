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

        <div>
          <Outlet/>
        </div>
      </main>
    </>
  )
}

export default App;