import React, { useEffect, useState } from 'react';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import axios from 'axios';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const getLastMessages = async() => {
        const dateNow = Date.now() - 24 * 60 * 60 * 1000
        const messages = await axios.get('http://localhost:3000/messages/' + localStorage.getItem('userName') + "?after=" + dateNow)
        setMessages(messages.data)
    }

    getLastMessages()

    }, [socket]);

  useEffect(() => {
    socket.on('send-message', (message) => setMessages([...messages, message]));
    console.log(messages)
  }, [socket, messages]);

  return (
    <div className="chat">
      <ChatBar socket={socket} />
      <div className="chat__main">
        <ChatBody messages={messages} />
        <ChatFooter socket={socket} />
      </div>
    </div>
  );
};

export default ChatPage;