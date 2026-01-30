import {BrowserRouter, Route, Routes, Link} from "react-router-dom";
import PubChat from "./pages/PubChat.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import {useState, useEffect} from "react";
import axios from "axios";
import "./Nav.css";

const App = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    })
    const [privateChats, setPrivateChats] = useState([])

    const handleSetUser = (newUser) => {
        setUser(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    }

    const fetchPrivateChats = async () => {
        if (!user) {
            setPrivateChats([]);
            return;
        }
        try {
            const res = await axios.get(`/api/private-chats/user/${user.username}`);
            setPrivateChats(res.data);
        } catch (e) {
            console.error("Error fetching private chats:", e);
        }
    };

    useEffect(() => {
        fetchPrivateChats();
    }, [user]);

    const handleSignOut = () => {
        handleSetUser(null);
    };

    return (
        <BrowserRouter>
            <nav>
                <Link style={{fontWeight: 'bold'}} to="/">PubChat</Link>

                {user && (
                    <>
                        <span className="nav-separator">|</span>
                        <Link to="/messages">Messages</Link>
                        <span className="nav-separator">|</span>
                        <Link to="/profile">My Profile</Link>
                        <span className="nav-separator">|</span>
                        <button onClick={handleSignOut}>Sign Out</button>
                    </>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<PubChat user={user} setUser={handleSetUser} />}/>
                <Route path="/login" element={<Login setUser={handleSetUser} />}/>
                <Route path="/signup" element={<Signup setUser={handleSetUser} />}/>
                <Route path="/profile" element={<ProfilePage user={user} setUser={handleSetUser} />}/>
                <Route path="/messages" element={
                    <MessagesPage
                        user={user}
                        privateChats={privateChats}
                        onChatCreated={fetchPrivateChats}
                    />
                }/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
