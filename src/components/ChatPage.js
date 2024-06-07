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

  const [cookies, setCookie] = useCookies(['identityKey','registrationId']);

  useEffect(() => {
    const getLastMessages = async() => {
        // const dateNow = Date.now() - 24 * 60 * 60 * 1000
        // const messages = await axios.get('http://localhost:3000/messages/' + localStorage.getItem('roomId') + "?after=" + dateNow)
        // setMessages([...messages.data])
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
        // for(const preKey of otherUserPreKeys){
        //     await store.storePreKey(preKey.keyId, preKey.keyPair);
        // }
        await store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair)
        // await store.storeSignedPreKey(otherUserSignedPreKey.keyId, otherUserSignedPreKey.keyPair)

        const recipientAddress = new SignalProtocolAddress(otherPerson, 1)
        const sessionBuilder = new SessionBuilder(store, recipientAddress)

        console.log(store)

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

        const sessionCipher = new SessionCipher(store, recipientAddress)
        setSession(sessionCipher)

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
        
                const secretMessage = new TextDecoder().decode(new Uint8Array(plaintext))
                console.log(secretMessage)
        
                // setMessages([...messages, secretMessage])
            }
        });
    }

    getLastMessages()

    }, []);

//   useEffect(() => {
//     const receivedMessage = async() => {
//         socket.on('send-message', async (message, from) => {
//             console.log('entered send message socket')
//             if(from != localStorage.getItem('userName')){
//                 let plaintext
//                 let ciphertext = message.message
//                 console.log(ciphertext)

//                 const otherPerson = localStorage.getItem('roomUsers').split(',').filter((user) => {
//                     return user != localStorage.getItem('userName');
//                 })[0]

//                 const recipientAddress = new SignalProtocolAddress(otherPerson, 1)

//                 const sessionCipher = new SessionCipher(store, recipientAddress)
//                 console.log('receiving cipher', sessionCipher)

//                 if (ciphertext.type === 3) {
//                 try {
//                     plaintext = await sessionCipher.decryptPreKeyWhisperMessage(ciphertext.body, 'binary')
                    
//                 } catch (e) {
//                     console.log(e)
//                 }
//                 } else if (ciphertext.type === 1) {
//                     plaintext = await sessionCipher.decryptWhisperMessage(ciphertext.body, 'binary')
//                     console.log(plaintext)
//                 }
        
//                 const secretMessage = new TextDecoder().decode(new Uint8Array(plaintext))
//                 console.log(secretMessage)
        
//                 // setMessages([...messages, secretMessage])
//             }
//         });
//     }

//     receivedMessage()
//   }, []);

  const addPlainMessage = (message) => {
    setMessages([...messages, message])
  }

  return (
    <div className="chat">
      <ChatBar socket={socket} />
      <div className="chat__main">
        <ChatBody messages={messages} />
        <ChatFooter socket={socket} session={session} addPlainMessage={ addPlainMessage }/>
      </div>
    </div>
  );
};

export default ChatPage;