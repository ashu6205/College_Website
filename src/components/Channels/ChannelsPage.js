import React, { useState } from 'react';
import ChannelsList from './ChannelsList';
import Chat from './Chat';
import './Channels.css';

const ChannelsPage = ({ user }) => {
    const [selectedChannel, setSelectedChannel] = useState(null);

    return (
        <div className="channels-page">
            <div className="channels-sidebar">
                <ChannelsList 
                    onSelectChannel={setSelectedChannel}
                    selectedChannelId={selectedChannel?._id}
                    user={user}
                />
            </div>
            <div className="chat-main">
                {selectedChannel ? (
                    <Chat channel={selectedChannel} user={user} />
                ) : (
                    <div className="select-channel-prompt">
                        <div className="prompt-card">
                            <h2 className="prompt-title">👋 Welcome to Channels</h2>
                            <p className="prompt-text">Select a channel from the sidebar to start chatting with your community.</p>
                             
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChannelsPage;
