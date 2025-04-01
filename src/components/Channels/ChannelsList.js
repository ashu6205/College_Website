import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Channels.css';

const ChannelsList = ({ onSelectChannel, selectedChannelId, user }) => {
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [selectedChannelForMember, setSelectedChannelForMember] = useState(null);
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelDescription, setNewChannelDescription] = useState('');
    const [newChannelType, setNewChannelType] = useState('general');
    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/channels', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setChannels(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching channels:', error);
            setError('Failed to load channels');
            setLoading(false);
        }
    };

    const createChannel = async () => {
        if (!newChannelName.trim()) {
            alert('Channel name is required');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:5000/api/channels', 
                { 
                    name: newChannelName, 
                    description: newChannelDescription, 
                    type: newChannelType 
                }, 
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );
    
            setChannels([...channels, response.data.data]); // Ensure correct data structure
            setNewChannelName('');
            setNewChannelDescription('');
            setNewChannelType('general');
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    };

    const deleteChannel = async (channelId) => {
        try {
            await axios.delete(`http://localhost:5000/api/channels/${channelId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            setChannels(channels.filter(channel => channel._id !== channelId));
        } catch (error) {
            console.error('Error deleting channel:', error);
        }
    };



    const joinChannel = async (channelId) => {
        try {
            await axios.post(
                `http://localhost:5000/api/channels/${channelId}/join`,
                {},
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );

            fetchChannels();
        } catch (error) {
            console.error('Error joining channel:', error);
        }
    };

    const leaveChannel = async (channelId) => {
        try {
            await axios.post(
                `http://localhost:5000/api/channels/${channelId}/leave`,
                {},
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
            );

            fetchChannels();
        } catch (error) {
            console.error('Error leaving channel:', error);
        }
    };

    if (loading) return <p>Loading channels...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="channels-list">
            <div className="channels-header">
                <h2>Channels</h2>

                {/* Show "Add Channel" only for Admin */}
                {user?.role === "admin" && (
                    <div className="channel-actions">
                        <h3>Create a New Channel</h3>
                        <div className="channel-form">
                            <input 
                                type="text" 
                                placeholder="Channel Name" 
                                value={newChannelName} 
                                onChange={(e) => setNewChannelName(e.target.value)} 
                                className="channel-input"
                            />
                            <input 
                                type="text" 
                                placeholder="Channel Description" 
                                value={newChannelDescription} 
                                onChange={(e) => setNewChannelDescription(e.target.value)} 
                                className="channel-input"
                            />
                            <select 
                                value={newChannelType} 
                                onChange={(e) => setNewChannelType(e.target.value)}
                                className="channel-select"
                            >
                                <option value="general">General</option>
                                <option value="private">Private</option>
                            </select>
                            <button onClick={createChannel} className="create-btn">Create</button>
                        </div>
                    </div>
                )}


            </div>

            {channels.map(channel => {
                const isMember = channel.members.some(member => 
                    (typeof member.user === "string" ? member.user : member.user?._id) === user?.id
                );
                

                return (
                    <div
                        key={channel._id}
                        className={`channel-item ${channel._id === selectedChannelId ? 'selected' : ''}`}
                        onClick={() => onSelectChannel(channel, isMember)}
                    >
                        <div className="channel-info">
                            <h3>{channel.name}</h3>
                        </div>
                        <div className="channel-options">
                            {user?.role !== "admin" && ( // Show join/leave only for non-admins
                                !isMember ? (
                                    <button onClick={() => joinChannel(channel._id)} className="join-btn">Join</button>
                                ) : (
                                    <button onClick={() => leaveChannel(channel._id)} className="leave-btn">Leave</button>
                                )
                            )}

                            {user?.role === "admin" && (
                                <button onClick={() => deleteChannel(channel._id)} className="delete-btn">Delete</button>
                            )}
                        </div>


                    </div>
                );
            })}
        </div>
    );
};

export default ChannelsList;
