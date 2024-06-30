import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

const ChatBody = ({ messages }) => {
  const navigate = useNavigate();

  const handleLeaveChat = () => {
    localStorage.removeItem('roomId');
    localStorage.removeItem('roomUsers');
    navigate('/rooms');
    window.location.reload();
  };

  return (
    <>
      <header className="chat__mainHeader">
        <p></p>
        <button className="leaveChat__btn" onClick={handleLeaveChat}>
          LEAVE CHAT
        </button>
      </header>

      <div className="message__container">
        {messages.map((message) =>
          message.address === localStorage.getItem('userName') ? (
            <div className="message__chats" key={message.sortID}>
              <p className="sender__name">You</p>
              <div className="message__sender">
                <p>{message.message}</p>
              </div>
            </div>
          ) : (
            <div className="message__chats" key={message.sortID}>
              <p>{message.address}</p>
              <div className="message__recipient">
                <p>{message.message}</p>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};

export default ChatBody;