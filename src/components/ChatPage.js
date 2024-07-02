import React, { useEffect, useState } from 'react';
import ChatBar from './ChatBar';
import ChatBody from './ChatBody';
import ChatFooter from './ChatFooter';
import axios from 'axios';
import { SignalDirectory } from '../signal-directory';
import { SignalProtocolStore } from '../storage-type';
import * as base64 from 'base64-js'
import { useCookies } from 'react-cookie';
import { SessionBuilder, SessionCipher, SignalProtocolAddress } from '@privacyresearch/libsignal-protocol-typescript';

const ChatPage = ({ socket }) => {
  const [messages, setMessages] = useState([]);
  const [store, setStore] = useState(new SignalProtocolStore());
  const [session, setSession] = useState(Object)
  const [senderSession, setSenderSession] = useState(Object)

  const [cookies, setCookie] = useCookies(['identityKey','registrationId']);

  useEffect(() => {
    const getLastMessages = async() => {
        if(localStorage.getItem('roomId')){
            socket.emit('join', localStorage.getItem('roomId'));
        }
        
        const directory = new SignalDirectory();
        const personalPreKeysBundle =  await directory.getPreKeyBundle(localStorage.getItem('userName'))
        const otherPerson = localStorage.getItem('roomUsers').split(',').filter((user) => {
            return user != localStorage.getItem('userName');
        })[0]
        const otherUserPreKeysBundle = await directory.getPreKeyBundle(otherPerson)
        const registrationID = cookies.registrationID
        const identityKeyPair = {
            privKey: base64.toByteArray(cookies.identityKey.privKey).buffer,
            pubKey: base64.toByteArray(cookies.identityKey.pubKey).buffer
        }


        const signedPreKey = {
            keyId: personalPreKeysBundle.signedPreKey.keyId,
            keyPair: {
                pubKey: personalPreKeysBundle.signedPreKey.keyPair.pubKey.buffer,
                privKey: personalPreKeysBundle.signedPreKey.keyPair.privKey.buffer
            },
            signature: personalPreKeysBundle.signedPreKey.signature.buffer
        }

        const preKeys = personalPreKeysBundle.preKeys

        const otherUserSignedPreKey = otherUserPreKeysBundle.signedPreKey

        store.put('registrationID', registrationID)
        store.put('identityKey', identityKeyPair)
        for(const preKey of preKeys){
            preKey.keyPair.pubKey = preKey.keyPair.pubKey.buffer
            preKey.keyPair.privKey = preKey.keyPair.privKey.buffer
            await store.storePreKey(preKey.keyId, preKey.keyPair)
        }

        await store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair)

        const recipientAddress = new SignalProtocolAddress(otherPerson, 1)
        const sessionBuilder = new SessionBuilder(store, recipientAddress)

        await sessionBuilder.processPreKey({
            identityKey: otherUserPreKeysBundle.identityKey,
            signedPreKey: {
                signature: otherUserPreKeysBundle.signedPreKey.signature,
                publicKey: otherUserPreKeysBundle.signedPreKey.keyPair.pubKey,
                keyId: otherUserPreKeysBundle.signedPreKey.keyId
            },
            preKey: {
                publicKey: otherUserPreKeysBundle.preKeys[0].keyPair.pubKey,
                keyId: otherUserPreKeysBundle.preKeys[0].keyId
            },
            registrationId: otherUserPreKeysBundle.registrationId
        })

        const senderAddress = new SignalProtocolAddress(localStorage.getItem('userName'), 1)
        const senderSessionBuilder = new SessionBuilder(store, senderAddress)

        await senderSessionBuilder.processPreKey({
            identityKey: personalPreKeysBundle.identityKey,
            signedPreKey: {
                signature: personalPreKeysBundle.signedPreKey.signature,
                publicKey: personalPreKeysBundle.signedPreKey.keyPair.pubKey,
                keyId: personalPreKeysBundle.signedPreKey.keyId
            },
            preKey: {
                publicKey: personalPreKeysBundle.preKeys[0].keyPair.pubKey,
                keyId: personalPreKeysBundle.preKeys[0].keyId
            },
            registrationId: personalPreKeysBundle.registrationId
        })

        const sessionCipher = new SessionCipher(store, recipientAddress)
        const senderSessionCipher = new SessionCipher(store, senderAddress)
        setSession(sessionCipher)
        setSenderSession(senderSessionCipher)

        getMessagesHistory()

    }

    getLastMessages()

    const getMessagesHistory = async() => {
        const today = new Date()
        const last30Days = new Date().setDate(today.getDate() - 30)
        const messages = await axios.get(`http://localhost:3000/messages/${localStorage.getItem('roomId')}?after=${last30Days}`)
        
        const otherPerson = localStorage.getItem('roomUsers').split(',').filter((user) => {
            return user != localStorage.getItem('userName');
        })[0]
        const senderUsername = localStorage.getItem('userName');

        const recipientAddress = new SignalProtocolAddress(otherPerson, 1)
        const senderAddress = new SignalProtocolAddress(senderUsername, 1) 

        const recipientSessionCipher = new SessionCipher(store, recipientAddress)
        const senderSessionCipher = new SessionCipher(store, senderAddress)

        const messagesList = messages.data
        for(const message of messagesList){
            let ciphertext
            let sessionCipher
            if(message.address == senderUsername){
                ciphertext = message.ownMessage
                sessionCipher = senderSessionCipher
            } else{
                ciphertext = message.message
                sessionCipher = recipientSessionCipher
            }

            console.log(message)

            let plaintext
            if (ciphertext.type === 3) {
                try {
                    plaintext = await sessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
                    
                } catch (e) {
                    console.log(e)
                }
            } else if (ciphertext.type === 1) {
                plaintext = await sessionCipher.decryptWhisperMessage(ciphertext.body, 'binary')
                console.log(plaintext)
            }

            message.message = new TextDecoder().decode(new Uint8Array(plaintext))
                
        }

        setMessages((prevState) => ([...prevState, ...messagesList]))
    }

    // getMessagesHistory()

    }, []);

  useEffect(() => {
    

    const receivedMessage = async() => {
        socket.on('send-message', async (message, from) => {
            console.log('entered send message socket')
            if(from != localStorage.getItem('userName')){
                let plaintext
                let ciphertext = message.message
                console.log(ciphertext)

                const otherPerson = localStorage.getItem('roomUsers').split(',').filter((user) => {
                    return user != localStorage.getItem('userName');
                })[0]

                const recipientAddress = new SignalProtocolAddress(otherPerson, 1)

                const sessionCipher = new SessionCipher(store, recipientAddress)
                console.log('receiving cipher', sessionCipher)

                if (ciphertext.type === 3) {
                try {
                    plaintext = await sessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
                    
                } catch (e) {
                    console.log(e)
                }
                } else if (ciphertext.type === 1) {
                    plaintext = await sessionCipher.decryptWhisperMessage(ciphertext.body, 'binary')
                    console.log(plaintext)
                }
        
                message.message = new TextDecoder().decode(new Uint8Array(plaintext))
        
                setMessages((prevState) => ([...prevState, message]))
            }
        });
    }

    receivedMessage()
  }, []);

  const addPlainMessage = (message) => {
    setMessages([...messages, message])
  }

  console.log(messages)

  return (
    <div className="chat">
      <ChatBar socket={socket} />
      <div className="chat__main">
        <ChatBody messages={messages} />
        <ChatFooter socket={socket} session={session} senderSession={senderSession} addPlainMessage={ addPlainMessage }/>
      </div>
    </div>
  );
};

export default ChatPage;