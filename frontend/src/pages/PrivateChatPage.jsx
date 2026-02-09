import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatWindow from "../components/ChatWindow.jsx";
import "./PrivateChatPage.css";

const PrivateChatPage = ({ user }) => {
    const { chatId } = useParams();
    const navigate = useNavigate();

    const [chat, setChat] = useState(null);
    const [profilePictures, setProfilePictures] = useState({});

    const getOtherUsername = () => {
        if (!chat || !user) return '';
        return chat.creatorUsername === user.username
            ? chat.invitedUsername
            : chat.creatorUsername;
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

    const handleDeleteChat = async () => {
        if (!window.confirm('Are you sure you want to delete this chat?')) return;

        try {
            await axios.delete(`/api/private-chats/${chatId}`);
            navigate('/');
        } catch (e) {
            console.error("Error deleting chat:", e);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        axios.get(`/api/private-chats/${chatId}`)
            .then(res => {
                setChat(res.data);
                if (!res.data.invitedUsername && res.data.creatorUsername !== user.username) {
                    axios.post(`/api/private-chats/${chatId}/join?username=${user.username}`)
                        .then(joinRes => setChat(joinRes.data));
                }
            })
            .catch(err => {
                console.error("Error fetching chat:", err);
                navigate('/');
            });
    }, [chatId, user, navigate]);

    if (!user) return null;

    return (
        <div className="private-chat-wrapper">
            <div className="private-chat-header">
                <h2>Chat with {getOtherUsername()}</h2>
                <button className="delete-chat-btn" onClick={handleDeleteChat}>Delete Chat</button>
            </div>

            <ChatWindow
                user={user}
                messagesEndpoint={`/api/private-chats/${chatId}/messages`}
                sendEndpoint={`/api/private-chats/${chatId}/messages`}
                websocketTopic={`/topic/private/${chatId}`}
                profilePictures={profilePictures}
                onNewMessage={fetchProfilePictures}
            />
        </div>
    );
};

export default PrivateChatPage;
