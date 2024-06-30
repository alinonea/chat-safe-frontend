import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CCard, CCardHeader, CCardBody, CCardText, CButton, CCardTitle } from '@coreui/react';
import axios from 'axios';
import RoomCard from './RoomCard';

const RoomsPage = ({socket}) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [rooms, setRooms] = useState([])

    useEffect(() => {
        axios.get(`http://localhost:3000/rooms/${localStorage.getItem('userName')}`)
            .then((result) => {
                setRooms([...result.data])
            })
            .catch((error) => {
                console.log(error)
            })
    }, [])

    console.log(rooms)
    return (
        <div className='rooms-page-container'>
            <div className='rooms-page-header'>
                <h2>Welcome to the Rooms Page</h2>
                <div className='rooms-page-buttons-container'>
                    <CButton color='primary' className='button' onClick={() => { navigate('/create-room') }}>Create a room</CButton>
                    <CButton color='secondary' className='button' onClick={() => { navigate('/join-room') }}>Join a room</CButton>
                </div>
                
            </div>
            <div className='rooms-page-before-rooms-container'>
                <h5>Connect to one of your rooms: </h5>
            </div>
            <div className='rooms-list-container'>
                {
                    rooms ? rooms.map(room => <RoomCard key={room._id} room={room} socket={socket}/>) : ''
                }
            </div>
        </div>
    );
};

export default RoomsPage;