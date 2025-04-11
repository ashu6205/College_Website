import React, { useState, useEffect } from 'react';
import ChannelsList from './ChannelsList';
import Chat from './Chat';
import './Channels.css';

const ChannelsPage = ({ user }) => {
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showSidebar, setShowSidebar] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (!mobile) setShowSidebar(true); // show both in desktop
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleToggle = () => setShowSidebar(!showSidebar);

    return (
        <div className="channels-page">
            {isMobile && (
                <button className="toggle-sidebar-btn" onClick={handleToggle}>
                    {showSidebar ? '📩 Chat' : '📋 Channels'}
                </button>
            )}

            <div className="channels-container">
                {(!isMobile || showSidebar) && (
                    <div className="channels-sidebar">
                        <ChannelsList 
                            onSelectChannel={(channel) => {
                                setSelectedChannel(channel);
                                if (isMobile) setShowSidebar(false);
                            }}
                            selectedChannelId={selectedChannel?._id}
                            user={user}
                        />
                    </div>
                )}

                {(!isMobile || !showSidebar) && (
                    <div className="chat-main">
                        {selectedChannel ? (
                            <Chat channel={selectedChannel} user={user} />
                        ) : (
                            <div className="select-channel-prompt">
                                <div className="prompt-card">
                                    <h2 className="prompt-title">👋 Welcome to Channels</h2>
                                    <p className="prompt-text">
                                        Select a channel from the sidebar to start chatting with your community.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChannelsPage;
