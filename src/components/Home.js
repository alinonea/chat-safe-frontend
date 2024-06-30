import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { KeyHelper } from '@privacyresearch/libsignal-protocol-typescript';
import { SignalDirectory } from '../signal-directory';
import * as base64 from 'base64-js'

const Home = ({socket}) => {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['identity']);
    const [userName, setUserName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        localStorage.setItem('userName', userName);

        if(!cookies.identityKey){
            createID(userName, null)
        }else {
            console.log(cookies)
        }

        
        navigate('/rooms');
    };

    const storeIdentityKey = (key, value) =>{
      value = {
        privKey: base64.fromByteArray(new Uint8Array(value.privKey)),
        pubKey: base64.fromByteArray(new Uint8Array(value.pubKey))
      }
      setCookie(key, value)
    }

   const storeRegistrationId = (key, value) => {
      setCookie(key, value)
    }

    const makeKeyId = () => {
      return Math.floor(10000 * Math.random())
    }

    const createID = async (name, store) => {
        const directory = new SignalDirectory();
      
        const registrationId = KeyHelper.generateRegistrationId()
        storeRegistrationId(`registrationID`, registrationId)
    
        const identityKeyPair = await KeyHelper.generateIdentityKeyPair()
        storeIdentityKey('identityKey', identityKeyPair)
    
        const baseKeyId = makeKeyId()
        const preKey = await KeyHelper.generatePreKey(baseKeyId)
    
        const signedPreKeyId = makeKeyId()
        const signedPreKey = await KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId)
    
        // Now we register this with the server or other directory so all users can see them.
        // You might implement your directory differently, this is not part of the SDK.

        directory.storeKeyBundle(name, {
        registrationId,
        identityKey: identityKeyPair.pubKey,
        signedPreKey,
        preKeys: [preKey]
        })
    }

  return (
    <form className="home__container" onSubmit={handleSubmit}>
      <h2 className="home__header">Sign in to Chat Safe</h2>
      <label htmlFor="username">Username</label>
      <input
        type="text"
        minLength={3}
        name="username"
        id="username"
        className="username__input"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button className="home__cta">SIGN IN</button>
    </form>
  );
};

export default Home;