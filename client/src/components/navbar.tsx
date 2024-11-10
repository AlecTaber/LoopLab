import { Link } from "react-router-dom"


const navBar = () => {
    return (
        <div>
            <nav>
                <Link to='/' className="link">home</Link>
                <Link to='/canvas' className="link">Canvas</Link>
            </nav>
            <h3>Loop Lab NavBar</h3>
        </div>
    )
}

export default navBar