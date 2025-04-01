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
                        <h2>Welcome to Channels</h2>
                        <p>Select a channel to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChannelsPage;
