import { useEffect, useState, useRef } from "react";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from "axios";
import "./PubChat.css"


const PubChat = ({ user }) => {

    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth"});
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

    useEffect(() => {
        scrollToBottom();
    }, [messages])

    useEffect(() => {
        axios.get('/api/messages').then(res => {
            setMessages(res.data);
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
            <h1> Welcome, {user ? user.username : "please sign up or log in to access the chat"}. </h1>

            <div className={`chat-container ${!user ? 'chat-blurred' : ''}`} >
                <div className="chat-window">
                    {messages.map((m) => {
                        const isMine = user && m.userId === user.username

                        return (
                            <div key={m.id} className={`message-bubble ${isMine ? 'message-right' : 'message-left'}`}>
                                <small> {m.userId}: </small>
                                {m.messageContent}
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
        </>
    )
}

export default PubChat;