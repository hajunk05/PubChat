import {BrowserRouter, Route, Routes, Link} from "react-router-dom";
import PubChat from "./pages/PubChat.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import {useState} from "react";
import "./Nav.css";

const App = () => {
    const [user, setUser] = useState(null)

    return (
        <BrowserRouter>
            <nav>
                <Link style={{fontWeight: 'bold'}} to="/">PubChat</Link>
                <span className="nav-separator">|</span>

                {!user ? (
                    <>
                        <Link to="/login">Login</Link>
                        <span className="nav-separator">|</span>
                        <Link to="/signup">Sign Up</Link>
                    </>
                ) : (
                    <>
                        <span style={{marginRight: '10px'}}>User: {user.username}</span>
                        <button onClick={() => setUser(null)}>Sign Out</button>
                    </>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<PubChat user={user} setUser={setUser}/>}/>
                <Route path="/login" element={<Login setUser={setUser} />}/>
                <Route path="/signup" element={<Signup setUser={setUser} />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
