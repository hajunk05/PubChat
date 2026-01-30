import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatWindow from "../components/ChatWindow.jsx";
import "./MessagesPage.css";

const MessagesPage = ({ user, privateChats, pendingInvites = [], onChatCreated, onInviteHandled }) => {
    const navigate = useNavigate();
    const [selectedChatId, setSelectedChatId] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [profilePictures, setProfilePictures] = useState({});
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!user) return;

        if (selectedChatId) {
            axios.get(`/api/private-chats/${selectedChatId}`)
                .then(res => {
                    setSelectedChat(res.data);
                    // Join chat if needed
                    if (!res.data.invitedUsername && res.data.creatorUsername !== user.username) {
                        axios.post(`/api/private-chats/${selectedChatId}/join?username=${user.username}`)
                            .then(joinRes => setSelectedChat(joinRes.data));
                    }
                })
                .catch(err => {
                    console.error("Error fetching chat:", err);
                    setSelectedChatId(null);
                    setSelectedChat(null);
                });
        } else {
            setSelectedChat(null);
        }
    }, [selectedChatId, user]);

    // Fetch profile pictures for chat list
    useEffect(() => {
        if (!user) return;

        if (privateChats.length > 0) {
            const usernames = privateChats.map(chat =>
                chat.creatorUsername === user.username
                    ? chat.invitedUsername
                    : chat.creatorUsername
            ).filter(Boolean);

            const unknownUsers = usernames.filter(u => !profilePictures[u]);
            if (unknownUsers.length > 0) {
                axios.get('/api/users/profile-pictures', {
                    params: { usernames: unknownUsers }
                }).then(res => {
                    setProfilePictures(prev => ({ ...prev, ...res.data }));
                }).catch(e => {
                    console.error("Error fetching profile pictures:", e);
                });
            }
        }
    }, [privateChats, user]);

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

    const handleDeleteChat = async () => {
        if (!selectedChatId) return;
        if (!window.confirm('Are you sure you want to delete this chat?')) return;

        try {
            await axios.delete(`/api/private-chats/${selectedChatId}`);
            setSelectedChatId(null);
            setSelectedChat(null);
            if (onChatCreated) onChatCreated();
        } catch (e) {
            console.error("Error deleting chat:", e);
        }
    };

    const handleAcceptInvite = async (chatId) => {
        try {
            await axios.post(`/api/private-chats/${chatId}/accept?username=${user.username}`);
            if (onInviteHandled) onInviteHandled();
        } catch (e) {
            console.error("Error accepting invite:", e);
        }
    };

    const handleDeclineInvite = async (chatId) => {
        try {
            await axios.post(`/api/private-chats/${chatId}/decline?username=${user.username}`);
            if (onInviteHandled) onInviteHandled();
        } catch (e) {
            console.error("Error declining invite:", e);
        }
    };

    const getOtherUsername = (chat) => {
        if (!chat) return '';
        return chat.creatorUsername === user.username
            ? (chat.invitedUsername || chat.invitedEmail)
            : chat.creatorUsername;
    };

    if (!user) return null;

    return (
        <div className="messages-page-wrapper">
            <div className="messages-layout">
                {/* Left side - Chat list */}
                <div className="chat-list-section">
                    {/* Invite form at top */}
                    <div className="invite-section">
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

                    {/* Pending invites */}
                    {pendingInvites.length > 0 && (
                        <div className="pending-invites">
                            <div className="pending-invites-header">Pending Invites</div>
                            {pendingInvites.map(invite => (
                                <div key={invite.id} className="invite-item">
                                    <span className="invite-from">From: {invite.creatorUsername}</span>
                                    <div className="invite-actions">
                                        <button
                                            className="accept-btn"
                                            onClick={() => handleAcceptInvite(invite.id)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="decline-btn"
                                            onClick={() => handleDeclineInvite(invite.id)}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Chat list */}
                    <div className="chat-list">
                        {privateChats.length === 0 && pendingInvites.length === 0 ? (
                            <div className="no-chats">No conversations yet</div>
                        ) : privateChats.length === 0 ? null : (
                            privateChats.map(chat => {
                                const otherUsername = getOtherUsername(chat);
                                const otherProfilePic = profilePictures[otherUsername];

                                return (
                                    <div
                                        key={chat.id}
                                        className={`chat-item ${selectedChatId === chat.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedChatId(chat.id)}
                                    >
                                        <div className="chat-item-pic">
                                            {otherProfilePic ? (
                                                <img src={otherProfilePic} alt={otherUsername} />
                                            ) : (
                                                <span>{otherUsername.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="chat-item-name">{otherUsername}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right side - Chat window */}
                <div className="chat-window-section">
                    {selectedChat ? (
                        <>
                            <div className="chat-header">
                                <span>Chat with {getOtherUsername(selectedChat)}</span>
                                <button className="delete-chat-btn" onClick={handleDeleteChat}>
                                    Delete Chat
                                </button>
                            </div>
                            <ChatWindow
                                user={user}
                                messagesEndpoint={`/api/private-chats/${selectedChatId}/messages`}
                                sendEndpoint={`/api/private-chats/${selectedChatId}/messages`}
                                websocketTopic={`/topic/private/${selectedChatId}`}
                                profilePictures={profilePictures}
                                onNewMessage={fetchProfilePictures}
                            />
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
