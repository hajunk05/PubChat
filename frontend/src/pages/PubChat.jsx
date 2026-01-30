import { useState, useRef } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow.jsx";
import "./PubChat.css";

const PubChat = ({ user, setUser, onChatCreated }) => {
    const [profilePictures, setProfilePictures] = useState({});
    const [editingUsername, setEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');

    const fileInputRef = useRef(null);

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

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        try {
            await axios.post('/api/private-chats', {
                creatorUsername: user.username,
                invitedEmail: inviteEmail
            });
            setInviteEmail('');
            setInviteStatus('Invite sent!');
            setTimeout(() => setInviteStatus(''), 2000);
            if (onChatCreated) onChatCreated();
        } catch (e) {
            setInviteStatus('Failed to create chat');
            setTimeout(() => setInviteStatus(''), 2000);
        }
    };

    const handleSignOut = () => {
        setUser(null);
    };

    return (
        <>
            <div className="main-layout-wrapper">
                {!user && <div className="login-overlay"><h1>Please sign up or log in to access the chat.</h1></div>}
                <div className={`main-layout ${!user ? 'chat-blurred' : ''}`}>
                    <ChatWindow
                        user={user}
                        messagesEndpoint="/api/messages"
                        sendEndpoint="/api/messages"
                        websocketTopic="/topic/messages"
                        profilePictures={profilePictures}
                        onNewMessage={fetchProfilePictures}
                    />

                    {user && (
                        <div className="profile-section">
                            <h3>My Profile</h3>

                            <div className="profile-picture-container">
                                <div className="profile-picture-large">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.username} />
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

                            <div className="invite-container">
                                <label>Start 1:1 Chat:</label>
                                <form className="invite-form" onSubmit={handleInvite}>
                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                    <button type="submit">Invite</button>
                                </form>
                                {inviteStatus && <small className="invite-status">{inviteStatus}</small>}
                            </div>

                            <button className="signout-btn" onClick={handleSignOut}>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PubChat;
