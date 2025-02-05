import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, MessageList, Window } from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

import './GamingChat.scss';

import { useChecklist } from '../../ChecklistTasks';
import { GamingChatHeader } from './GamingChatHeader';
import { GamingMessage } from '../GamingMessage/GamingMessage';
import { GamingMessageInput } from '../GamingMessageInput/GamingMessageInput';
import { GamingParticipants } from '../GamingParticipants/GamingParticipants';
import { GamingThread } from '../GamingThread/GamingThread';

import { getColor, getRandomUserRole, participants } from '../../assets/data';

const urlParams = new URLSearchParams(window.location.search);
const apiKey = urlParams.get('apikey') || process.env.REACT_APP_STREAM_KEY;
const userId = urlParams.get('user') || process.env.REACT_APP_USER_ID;
const userToken = urlParams.get('user_token') || process.env.REACT_APP_USER_TOKEN;
const targetOrigin = urlParams.get('target_origin') || process.env.REACT_APP_TARGET_ORIGIN;

const chatClient = StreamChat.getInstance(apiKey);

export const GamingChat = (props) => {
  const {
    isFullScreen,
    setPopUpText,
    setShowPopUp,
    setShowMembers,
    setShowUpgrade,
    showMembers,
    showUpgrade,
  } = props;

  const [channel, setChannel] = useState(null);
  const [timestamp, setTimestamp] = useState(false);

  useEffect(() => {
    const loadChat = async () => {
      await chatClient.connectUser(
        {
          id: userId,
          color: getColor(),
          userRole: getRandomUserRole(),
        },
        userToken,
      );

      const channel = await chatClient.channel('gaming', 'gaming-demo', { name: 'Gaming Demo' });

      if (!channel.state.members[userId]) await channel.addMembers([userId]);

      await channel.watch();
      setChannel(channel);
    };

    loadChat();
  }, []);

  useChecklist(chatClient, targetOrigin);

  return (
    <section
      className={`chat-members-container ${showMembers ? 'show-members' : 'hide-members'} ${
        isFullScreen ? 'full-screen' : 'in-screen'
      } ${showUpgrade ? 'show-upgrade' : ''}`}
    >
      {channel && (
        <div className='chat-container'>
          <Chat client={chatClient}>
            <Channel channel={channel}>
              <Window>
                <GamingChatHeader {...props} {...{ timestamp, setTimestamp }} />
                <MessageList Message={(props) => <GamingMessage {...props} {...{ timestamp }} />} />
                <GamingMessageInput focus {...{ setPopUpText, setShowPopUp, setShowUpgrade }} />
              </Window>
              <GamingThread />
            </Channel>
          </Chat>
        </div>
      )}
      <GamingParticipants {...{ participants, showMembers, setShowMembers }} />
    </section>
  );
};
