import {BrowserRouter, Route, Routes, Link} from "react-router-dom";
import PubChat from "./pages/PubChat.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MessagesPage from "./pages/MessagesPage.jsx";
import {useState, useEffect} from "react";
import axios from "axios";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import "./Nav.css";

const App = () => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    })
    const [privateChats, setPrivateChats] = useState([])
    const [pendingInvites, setPendingInvites] = useState([])

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

    const fetchPendingInvites = async () => {
        if (!user) {
            setPendingInvites([]);
            return;
        }
        try {
            const res = await axios.get(`/api/private-chats/user/${user.username}/pending`);
            setPendingInvites(res.data);
        } catch (e) {
            console.error("Error fetching pending invites:", e);
        }
    };

    useEffect(() => {
        fetchPrivateChats();
        fetchPendingInvites();
    }, [user]);

    // Subscribe to WebSocket for new chat and invite notifications
    useEffect(() => {
        if (!user) return;

        const socket = new SockJS('/ws');
        const stompClient = Stomp.over(socket);
        stompClient.debug = null; // Disable debug logs

        stompClient.connect({}, () => {
            // Listen for accepted chats (when someone accepts your invite)
            stompClient.subscribe(`/topic/user/${user.username}/chats`, (payload) => {
                const newChat = JSON.parse(payload.body);
                setPrivateChats(prev => {
                    if (prev.find(c => c.id === newChat.id)) return prev;
                    return [...prev, newChat];
                });
            });

            // Listen for new invites
            stompClient.subscribe(`/topic/user/${user.username}/invites`, (payload) => {
                const newInvite = JSON.parse(payload.body);
                setPendingInvites(prev => {
                    if (prev.find(c => c.id === newInvite.id)) return prev;
                    return [...prev, newInvite];
                });
            });

            // Listen for chat deletions
            stompClient.subscribe(`/topic/user/${user.username}/chat-deleted`, (payload) => {
                const deletedChatId = JSON.parse(payload.body);
                setPrivateChats(prev => prev.filter(c => c.id !== deletedChatId));
                setPendingInvites(prev => prev.filter(c => c.id !== deletedChatId));
            });
        }, (error) => {
            console.error('WebSocket connection error:', error);
        });

        return () => {
            if (stompClient && stompClient.connected) {
                stompClient.disconnect();
            }
        };
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
                        <Link to="/messages" className="messages-link">
                            Messages
                            {pendingInvites.length > 0 && (
                                <span className="invite-badge">{pendingInvites.length}</span>
                            )}
                        </Link>
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
                        pendingInvites={pendingInvites}
                        onChatCreated={fetchPrivateChats}
                        onInviteHandled={() => { fetchPrivateChats(); fetchPendingInvites(); }}
                    />
                }/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
