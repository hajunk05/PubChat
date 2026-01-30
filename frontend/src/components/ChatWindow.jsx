import { useEffect, useState, useRef } from "react";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from "axios";
import "./ChatWindow.css";

const ChatWindow = ({
    user,
    messagesEndpoint,
    sendEndpoint,
    websocketTopic,
    profilePictures = {},
    onNewMessage
}) => {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !user) return;

        try {
            await axios.post(sendEndpoint, {
                userId: user.username,
                messageContent: messageInput
            });
            setMessageInput("");
        } catch (e) {
            console.error("Error sending message:", e);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Fetch initial messages
        axios.get(messagesEndpoint)
            .then(res => {
                setMessages(res.data);
                if (onNewMessage) {
                    const usernames = [...new Set(res.data.map(m => m.userId))];
                    onNewMessage(usernames);
                }
            })
            .catch(err => console.error("Could not load messages:", err));

        // WebSocket connection
        const socket = new SockJS('/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, () => {
            stompClient.subscribe(websocketTopic, (payload) => {
                const newMessage = JSON.parse(payload.body);

                setMessages(prev => {
                    if (prev.find(m => m.id === newMessage.id)) return prev;
                    const updated = [...prev, newMessage];
                    return updated.slice(-25);
                });

                if (onNewMessage) {
                    onNewMessage([newMessage.userId]);
                }
            });
        });

        return () => {
            if (stompClient && socket.readyState === SockJS.OPEN) {
                stompClient.disconnect();
            }
        };
    }, [messagesEndpoint, websocketTopic]);

    return (
        <div className="chat-window-container">
            <div className="chat-window">
                {messages.map((m) => {
                    const isMine = user && m.userId === user.username;
                    const pic = isMine ? user?.profilePicture : profilePictures[m.userId];

                    return (
                        <div key={m.id} className={`message-row ${isMine ? 'message-row-right' : 'message-row-left'}`}>
                            {!isMine && (
                                <div className="profile-pic">
                                    {pic ? <img src={pic} alt={m.userId} /> : <span>{m.userId.charAt(0).toUpperCase()}</span>}
                                </div>
                            )}
                            <div className={`message-bubble ${isMine ? 'message-right' : 'message-left'}`}>
                                <small>{m.userId}:</small>
                                {m.messageContent}
                            </div>
                            {isMine && (
                                <div className="profile-pic">
                                    {pic ? <img src={pic} alt={m.userId} /> : <span>{m.userId.charAt(0).toUpperCase()}</span>}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {user && (
                <form className="chat-form" onSubmit={sendMessage}>
                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button type="submit">Send</button>
                </form>
            )}
        </div>
    );
};

export default ChatWindow;
