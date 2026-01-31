import { useState } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow.jsx";
import "./PubChat.css";

const PubChat = ({ user, setUser }) => {
    const [profilePictures, setProfilePictures] = useState({});

    // Auth form states
    const [authMode, setAuthMode] = useState('login');
    const [authName, setAuthName] = useState('');
    const [authEmail, setAuthEmail] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authProfilePicture, setAuthProfilePicture] = useState('');
    const [authPreviewUrl, setAuthPreviewUrl] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

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

    const handleAuthFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAuthProfilePicture(reader.result);
                setAuthPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        axios.post(`/api/login?username=${authName}&password=${authPassword}`).then(res => {
            setUser(res.data);
            setAuthLoading(false);
        }).catch(e => {
            setAuthError(e.response?.data || 'Login failed');
            setAuthLoading(false);
        });
    };

    const handleSignup = (e) => {
        e.preventDefault();
        setAuthLoading(true);
        setAuthError('');
        const newUser = {
            username: authName,
            email: authEmail,
            isBanned: false,
            password: authPassword,
            profilePicture: authProfilePicture
        };
        axios.post('/api/signup', newUser).then(res => {
            setUser(res.data);
            setAuthLoading(false);
        }).catch(e => {
            setAuthError(e.response?.data || 'Signup failed');
            setAuthLoading(false);
        });
    };

    return (
        <div className="pubchat-wrapper">
            <div className={`pubchat-layout ${user ? 'full-width' : ''}`}>
                <ChatWindow
                    user={user}
                    messagesEndpoint="/api/messages"
                    sendEndpoint="/api/messages"
                    websocketTopic="/topic/messages"
                    profilePictures={profilePictures}
                    onNewMessage={fetchProfilePictures}
                />

                {!user && (
                    <div className="auth-section">
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                                onClick={() => setAuthMode('login')}
                            >
                                Log In
                            </button>
                            <button
                                className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
                                onClick={() => setAuthMode('signup')}
                            >
                                Sign Up
                            </button>
                        </div>

                        {authLoading ? (
                            <div className="auth-loading">Loading...</div>
                        ) : authMode === 'login' ? (
                            <form className="inline-auth-form" onSubmit={handleLogin}>
                                <label>Username:<span className="required">*</span>
                                    <input
                                        type="text"
                                        value={authName}
                                        onChange={(e) => setAuthName(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>Password:<span className="required">*</span>
                                    <input
                                        type="password"
                                        value={authPassword}
                                        onChange={(e) => setAuthPassword(e.target.value)}
                                        required
                                    />
                                </label>
                                <button className="auth-submit-btn" type="submit">Log In</button>
                            </form>
                        ) : (
                            <form className="inline-auth-form" onSubmit={handleSignup}>
                                <label>Username:<span className="required">*</span>
                                    <input
                                        type="text"
                                        value={authName}
                                        onChange={(e) => setAuthName(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>Email:<span className="required">*</span>
                                    <input
                                        type="email"
                                        value={authEmail}
                                        onChange={(e) => setAuthEmail(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>Password:<span className="required">*</span>
                                    <input
                                        type="password"
                                        value={authPassword}
                                        onChange={(e) => setAuthPassword(e.target.value)}
                                        required
                                    />
                                </label>
                                <label>Profile Picture:
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAuthFileChange}
                                    />
                                </label>
                                {authPreviewUrl && (
                                    <div className="auth-preview">
                                        <img src={authPreviewUrl} alt="Preview" />
                                    </div>
                                )}
                                <button className="auth-submit-btn" type="submit">Sign Up</button>
                                <small className="auth-note">(Please do not use your real password)</small>
                            </form>
                        )}

                        {authError && <p className="auth-error">{authError}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PubChat;
