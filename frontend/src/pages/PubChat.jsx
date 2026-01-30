import { useEffect, useState, useRef } from "react";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from "axios";
import "./PubChat.css"


const PubChat = ({ user, setUser }) => {

    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState('');
    const [profilePictures, setProfilePictures] = useState({});
    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [updateError, setUpdateError] = useState('');

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth"});
    };

    const fetchProfilePictures = async (usernames) => {
        const unknownUsers = usernames.filter(u => !profilePictures[u]);
        if (unknownUsers.length === 0) return;

        try {
            const res = await axios.get('/api/users/profile-pictures', {
                params: { usernames: unknownUsers }
            });
            setProfilePictures(prev => ({ ...prev, ...res.data }));
        } catch (e) {
            console.error("Error fetching profile pictures:", e);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        const messageData = {
            userId: user.username,
            messageContent: messageInput
        };

        try {
            await axios.post('/api/messages', messageData)
            setMessageInput("")
        } catch (e) {
            console.error("Error sending message:", e)
        }
    }

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await axios.put(`/api/users/${user.id}`, {
                    profilePicture: reader.result
                });
                setUser(res.data);
                setUpdateError('');
            } catch (e) {
                setUpdateError(e.response?.data || 'Failed to update profile picture');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUsernameUpdate = async () => {
        if (!newUsername.trim()) {
            setEditingUsername(false);
            return;
        }

        try {
            const res = await axios.put(`/api/users/${user.id}`, {
                username: newUsername
            });
            setUser(res.data);
            setEditingUsername(false);
            setUpdateError('');
        } catch (e) {
            setUpdateError(e.response?.data || 'Failed to update username');
        }
    };

    const startEditingUsername = () => {
        setNewUsername(user.username);
        setEditingUsername(true);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    useEffect(() => {
        axios.get('/api/messages').then(res => {
            setMessages(res.data);
            const usernames = [...new Set(res.data.map(m => m.userId))];
            fetchProfilePictures(usernames);
        }).catch(err => console.error("Could not load history", err));

        const socket = new SockJS('/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            stompClient.subscribe('/topic/messages', (payload) => {


                const newMessage = JSON.parse(payload.body); // Returned messages after new message in db.

                console.log("new message", newMessage)

                setMessages((prev) => {
                    if (prev.find(m => m.id === newMessage.id)) return prev;
                    const updated = [...prev, newMessage];
                    return updated.slice(-25);
                })

                fetchProfilePictures([newMessage.userId]);
            })
        })

        return () => {
            if (stompClient && socket.readyState === SockJS.OPEN) {
                stompClient.disconnect();
            }
        };
    }, [])

    return (
        <>
            <div className="main-layout-wrapper">
                {!user && <div className="login-overlay"><h1>Please sign up or log in to access the chat.</h1></div>}
                <div className={`main-layout ${!user ? 'chat-blurred' : ''}`}>
                <div className="chat-container">
                    <div className="chat-window">
                        {messages.map((m) => {
                            const isMine = user && m.userId === user.username
                            const pic = isMine ? user?.profilePicture : profilePictures[m.userId];

                            return (
                                <div key={m.id} className={`message-row ${isMine ? 'message-row-right' : 'message-row-left'}`}>
                                    {!isMine && (
                                        <div className="profile-pic">
                                            {pic ? <img src={pic} alt={m.userId}/> : <span>{m.userId.charAt(0).toUpperCase()}</span>}
                                        </div>
                                    )}
                                    <div className={`message-bubble ${isMine ? 'message-right' : 'message-left'}`}>
                                        <small> {m.userId}: </small>
                                        {m.messageContent}
                                    </div>
                                    {isMine && (
                                        <div className="profile-pic">
                                            {pic ? <img src={pic} alt={m.userId}/> : <span>{m.userId.charAt(0).toUpperCase()}</span>}
                                        </div>
                                    )}
                                </div> )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {user && (
                        <form className="chat-form" onSubmit={sendMessage}>
                            <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                                   placeholder="Type a message..."
                            />
                            <button type="submit"> Send </button>
                        </form>
                    )
                    }
                </div>

                {user && (
                    <div className="profile-section">
                        <h3>My Profile</h3>

                        <div className="profile-picture-container">
                            <div className="profile-picture-large">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.username}/>
                                ) : (
                                    <span>{user.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleProfilePictureChange}
                                style={{ display: 'none' }}
                            />
                            <button className="update-btn" onClick={() => fileInputRef.current.click()}>
                                Update Picture
                            </button>
                        </div>

                        <div className="username-container">
                            <label>Username:</label>
                            {editingUsername ? (
                                <div className="username-edit">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                    />
                                    <button onClick={handleUsernameUpdate}>Save</button>
                                    <button onClick={() => setEditingUsername(false)}>Cancel</button>
                                </div>
                            ) : (
                                <div className="username-display">
                                    <span>{user.username}</span>
                                    <button className="update-btn" onClick={startEditingUsername}>Update</button>
                                </div>
                            )}
                        </div>

                        {updateError && <p className="error-text">{updateError}</p>}
                    </div>
                )}
            </div>
            </div>
        </>
    )
}

export default PubChat;
