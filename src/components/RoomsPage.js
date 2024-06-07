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
                    <CButton color='primary' className='button'>Create a room</CButton>
                    <CButton color='secondary' className='button'>Join a room</CButton>
                </div>
                
            </div>
            <div className='rooms-page-before-rooms-container'>
                <h5>Connect to one of your rooms: </h5>
            </div>
            <div className='rooms-list-container'>
                {
                    rooms ? rooms.map(room => <RoomCard key={room._id} room={room} socket={socket}/>) : ''
                }
                {/* <CCard className="room-card">
                    <CCardHeader>Room 1</CCardHeader>
                    <CCardBody>
                        <CCardTitle>Room 1 name</CCardTitle>
                        <CButton color="primary" href="#">Open chat room</CButton>
                    </CCardBody>
                </CCard>
                <CCard className="room-card">
                    <CCardHeader>Room 2</CCardHeader>
                    <CCardBody>
                        <CCardTitle>Room 2 name</CCardTitle>
                        <CButton color="primary" href="#">Open chat room</CButton>
                    </CCardBody>
                </CCard>
                <CCard className="room-card">
                    <CCardHeader>Room 3</CCardHeader>
                    <CCardBody>
                        <CCardTitle>Room 3 name</CCardTitle>
                        <CButton color="primary" href="#">Open chat room</CButton>
                    </CCardBody>
                </CCard>
                <CCard className="room-card">
                    <CCardHeader>Room 4</CCardHeader>
                    <CCardBody>
                        <CCardTitle>Room 4 name</CCardTitle>
                        <CButton color="primary" href="#">Open chat room</CButton>
                    </CCardBody>
                </CCard>
                <CCard className="room-card">
                    <CCardHeader>Room 5</CCardHeader>
                    <CCardBody>
                        <CCardTitle>Room 5 name</CCardTitle>
                        <CButton color="primary" href="#">Open chat room</CButton>
                    </CCardBody>
                </CCard>
                <CCard className="room-card">
                    <CCardHeader>Room 6</CCardHeader>
                    <CCardBody>
                        <CCardTitle>Room 6 name</CCardTitle>
                        <CButton color="primary" href="#">Open chat room</CButton>
                    </CCardBody>
                </CCard> */}
            </div>
        </div>
    );
};

export default RoomsPage;