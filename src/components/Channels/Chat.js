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

    const isMember = channel.members.some(member =>
        (typeof member.user === "string" ? member.user : member.user?._id) === user?.id
    );

    useEffect(() => {
        const newSocket = io('https://college-website-backend.onrender.com', {
            auth: { token: localStorage.getItem('token') }
        });

        newSocket.emit('join_channel', channel._id);
        console.log('[Socket] Joined channel:', channel._id);

        newSocket.on('new_message', (message) => {
            console.log('[Socket] Received new message:', message);
            setMessages(prev => [...prev, message].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
        });

        setSocket(newSocket);
        fetchMessages();

        return () => {
            newSocket.emit('leave_channel', channel._id);
            newSocket.disconnect();
            console.log('[Socket] Left channel and disconnected');
        };
    }, [channel._id]);

    const fetchMessages = async () => {
        try {
            console.log('[Fetch] Fetching messages for channel:', channel._id);
            const response = await fetch(`https://college-website-backend.onrender.com/api/chat/${channel._id}/messages`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const data = await response.json();
            console.log('[Fetch] Fetched messages:', data.messages);

            const sortedMessages = data.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            setMessages(sortedMessages);
            setIsLoading(false);
        } catch (error) {
            console.error('[Fetch] Error fetching messages:', error);
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !isMember) return;

        try {
            console.log('[Send] Sending message:', newMessage);
            await fetch(`https://college-website-backend.onrender.com/api/chat/${channel._id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newMessage })
            });

            setNewMessage('');
        } catch (error) {
            console.error('[Send] Error sending message:', error);
        }
    };

    const handleFileUpload = async (e) => {
        if (!isMember) return;

        const file = e.target.files[0];
        if (!file) return;

        console.log('[Upload] Uploading file:', file.name);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`https://college-website-backend.onrender.com/api/chat/${channel._id}/messages/file`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });

            const data = await res.json();
            console.log('[Upload] File upload response:', data);
        } catch (error) {
            console.error('[Upload] Error uploading file:', error);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isLoading) return <div className="chat-loading">Loading messages...</div>;

    const getAttachmentUrl = (fileUrl) => {
        if (!fileUrl) return '';

        const isFile = /\.(pdf|docx?|xlsx?|pptx?|zip|rar)$/i.test(fileUrl);
        const baseName = fileUrl.split('/').pop();

        const finalUrl = fileUrl.startsWith('http')
            ? fileUrl
            : `https://college-website-backend.onrender.com/uploads/chat/${isFile ? 'files' : 'images'}/${baseName}`;

        return finalUrl;
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>{channel.name}</h2>
                <p>{channel.description}</p>
            </div>

            <div className="messages-container">
                {messages.map(message => {
                    const attachment = message.attachments?.[0];
                    const fileUrl = getAttachmentUrl(attachment?.fileUrl);

                    console.log('[Render] File URL used:', fileUrl);

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
                                            src={fileUrl}
                                            alt="attachment"
                                            className="message-image"
                                            onError={(e) => {
                                                console.error('[Image] Failed to load:', fileUrl);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <a
                                            href={fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-attachment"
                                        >
                                            <i className="fas fa-file"></i>
                                            {attachment?.fileName}
                                        </a>
                                    )}
                                </div>
                            )}

                            <span className="timestamp">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
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
