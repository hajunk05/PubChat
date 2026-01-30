import {BrowserRouter, Route, Routes, Link} from "react-router-dom";
import PubChat from "./pages/PubChat.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import PrivateChatPage from "./pages/PrivateChatPage.jsx";
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

    return (
        <BrowserRouter>
            <nav>
                <Link style={{fontWeight: 'bold'}} to="/">PubChat</Link>

                {!user ? (
                    <>
                        <span className="nav-separator">|</span>
                        <Link to="/login">Login</Link>
                        <span className="nav-separator">|</span>
                        <Link to="/signup">Sign Up</Link>
                    </>
                ) : (
                    <>
                        {privateChats.map(chat => (
                            <span key={chat.id}>
                                <span className="nav-separator">|</span>
                                <Link to={`/chat/${chat.id}`}>
                                    {chat.creatorUsername === user.username
                                        ? (chat.invitedUsername || chat.invitedEmail)
                                        : chat.creatorUsername}
                                </Link>
                            </span>
                        ))}
                    </>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<PubChat user={user} setUser={handleSetUser} onChatCreated={fetchPrivateChats}/>}/>
                <Route path="/login" element={<Login setUser={handleSetUser} />}/>
                <Route path="/signup" element={<Signup setUser={handleSetUser} />}/>
                <Route path="/chat/:chatId" element={<PrivateChatPage user={user} />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
