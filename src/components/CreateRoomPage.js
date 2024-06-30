import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateRoomPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const room = {
            username: localStorage.getItem('userName'),
            name: name,
            password: password
        }

        await axios.post(`http://localhost:3000/rooms`, room)

        navigate('/rooms');
    };

  return (
    <form className="home__container" onSubmit={handleSubmit}>
      <h2 className="home__header">Create a room</h2>
      <label htmlFor="name">Room name</label>
      <input
        type="text"
        name="name"
        id="name"
        className="username__input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="name">Password</label>
      <input
        type="password"
        name="password"
        id="password"
        className="username__input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="home__cta">Create room</button>
    </form>
  );
};

export default CreateRoomPage;