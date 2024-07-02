import React, { useState } from 'react';

const ChatFooter = ({ socket, session, senderSession, addPlainMessage}) => {
    const [message, setMessage] = useState('');
  
    const handleSendMessage = async(e) => {
        e.preventDefault();
        
        const roomId = localStorage.getItem('roomId')
        const address = localStorage.getItem('userName')

        const buffer = new TextEncoder().encode(message.trim()).buffer
        const encrytpedMessage = await session.encrypt(buffer)
        const encryptedOwnMessage = await senderSession.encrypt(buffer)
        console.log('sending cipher', session)
        if (buffer && address) {
          socket.emit('accept-message', address, encrytpedMessage, encryptedOwnMessage, roomId);
        }
        addPlainMessage({
            roomId,
            address,
            message,
            timestamp: Date.now()
        })
        setMessage('');
    };

    return (
      <div className="chat__footer">
        <form className="form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Write message"
            className="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button className="sendBtn">Send</button>
        </form>
      </div>
    );
  };
  
  export default ChatFooter;