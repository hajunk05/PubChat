import {useEffect, useState} from "react";
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import axios from "axios";


const PubChat = ({ user }) => {

    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState('');

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
                    const exists = prev.find(m => m.id === newMessage.id);
                    return exists ? prev : [...prev, newMessage];
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
            <div style={{ border: '2px solid black', padding: '10px' }}>
                {user && messages && messages.map((m) => {
                    const isMine = user && m.userId === user.username

                    return (
                        <div key={m.id} style={{
                            alignSelf: isMine ? 'flex-end' : 'flex-start'
                        }}>
                            <small> {m.userId}: </small>
                            {m.messageContent}
                        </div> )
                })}
            </div>
            {user && (
                <form onSubmit={sendMessage}>
                    <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                    />
                    <button type="submit"> Send </button>
                </form>
                )
            }
        </>
    )
}

export default PubChat;