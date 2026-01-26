import {BrowserRouter, Route, Routes, Link} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import {useState} from "react";

const App = () => {

    const [user, setUser] = useState(null)

    return (
        <BrowserRouter>
            <nav>
                <Link to="/"> Home </Link> |
                {!user && <Link to="/login"> Login </Link> } |
                {!user && <Link to={"/signup"}> Sign Up </Link>} |
                {user && <button onClick={()=> setUser(null)}> Sign Out </button> }
            </nav>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/login" element={<Login setUser={setUser} />}/>
                <Route path="/signup" element={<Signup setUser={setUser} />}/>
            </Routes>
        </BrowserRouter>

    )
}

export default App
