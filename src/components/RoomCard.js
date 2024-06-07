import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CCard, CCardHeader, CCardBody, CCardText, CButton, CCardTitle } from '@coreui/react';

const RoomCard = ({room, socket}) => {
    const navigate = useNavigate();

    const handleChooseRoom = (e) => {
        e.preventDefault();
        
        localStorage.setItem('roomId', room._id);
        localStorage.setItem('roomUsers', room.users)

        navigate('/chat');
    };

    return (
        <CCard className="room-card">
            <CCardHeader>{room._id.split('-')[0]}</CCardHeader>
            <CCardBody>
                <CCardTitle>{room._id.split('-')[0]}</CCardTitle>
                <CButton color="primary" onClick={handleChooseRoom}>Open chat room</CButton>
            </CCardBody>
        </CCard>
  );
};

export default RoomCard;