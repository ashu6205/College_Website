import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const Chat = ({ channel, user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // Check if user is a member of the channel
    const isMember = channel.members.some(member => 
        (typeof member.user === "string" ? member.user : member.user?._id) === user?.id
    );

    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.emit('join_channel', channel._id);

        newSocket.on('new_message', (message) => {
            setMessages(prev => [...prev, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        });

        setSocket(newSocket);
        fetchMessages();

        return () => {
            newSocket.emit('leave_channel', channel._id);
            newSocket.disconnect();
        };
    }, [channel._id]);

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/chat/${channel._id}/messages`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const data = await response.json();
            const sortedMessages = data.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setMessages(sortedMessages);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isMember) return;

        try {
            await fetch(`http://localhost:5000/api/chat/${channel._id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newMessage })
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleFileUpload = async (e) => {
        if (!isMember) return;

        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await fetch(`http://localhost:5000/api/chat/${channel._id}/messages/file`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isLoading) return <div className="chat-loading">Loading messages...</div>;

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{channel.name}</h2>
                <p>{channel.description}</p>
            </div>

            <div className="messages-container">
                {messages.map(message => {
                    const imageUrl = message.attachments?.[0]?.fileUrl?.startsWith('http') 
                    ? message.attachments[0]?.fileUrl 
                    : `http://localhost:5000/${message.attachments?.[0]?.fileUrl.replace(/^\/+/, '')}`;
                
                

                    return (
                        <div
                            key={message._id}
                            className={`message ${message.sender._id === user.id ? 'own-message' : 'other-message'}`}
                        >
                            <div className="message-header">
                                <span className="sender-name">{message.sender.fullName}</span>
                            </div>

                            {message.messageType === 'text' ? (
                                <p className="message-content">{message.content}</p>
                            ) : (
                                <div className="message-attachment">
                                    {message.messageType === 'image' ? (
                                        <img 
                                            src={imageUrl} 
                                            alt="attachment" 
                                            className="message-image"
                                            onError={(e) => {
                                                console.error("Image failed to load:", imageUrl);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <a 
                                            href={imageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-attachment"
                                        >
                                            <i className="fas fa-file"></i>
                                            {message.attachments[0]?.fileName}
                                        </a>
                                    )}
                                </div>
                            )}

                            <span className="timestamp">
                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {isMember ? (
                <form onSubmit={handleSendMessage} className="message-input-form">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="message-input"
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="attach-button"
                    >
                        <i className="fas fa-paperclip"></i>
                    </button>
                    <button type="submit" className="send-button">
                        Send
                    </button>
                </form>
            ) : (
                <div className="non-member-message">
                    <p>Only members can send messages in this channel.</p>
                </div>
            )}
        </div>
    );
};

export default Chat;
 