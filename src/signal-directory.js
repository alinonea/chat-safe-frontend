import { SignedPublicPreKeyType, DeviceType, PreKeyType } from "@privacyresearch/libsignal-protocol-typescript";
import axios from "axios";
import * as base64 from 'base64-js'


// export interface PublicDirectoryEntry {
//     identityPubKey: ArrayBuffer
//     signedPreKey: SignedPublicPreKeyType
//     oneTimePreKey?: ArrayBuffer
// }

// interface FullDirectoryEntry {
//     registrationId: number
//     identityPubKey: ArrayBuffer
//     signedPreKey: SignedPublicPreKeyType
//     oneTimePreKeys: PreKeyType[]
// }

export class SignalDirectory{
    constructor() {}

    storeKeyBundle(address, bundle) {
        axios.post(`http://localhost:3000/keys/${address}`,serializeKeyRegistrationBundle(bundle))
        .then(result => console.log(result))
        .catch(error => console.log(error))
    }

    async getPreKeyBundle(address) {
        const bundle = await axios.get(`http://localhost:3000/keys/${address}`)
        
        return deserializeKeyBundle(bundle.data)
    }
}

export function serializeKeyRegistrationBundle(dv) {
    const signedPreKey = {
        keyId: dv.signedPreKey.keyId,
        publicKey: base64.fromByteArray(new Uint8Array(dv.signedPreKey.keyPair.pubKey)),
        privateKey: base64.fromByteArray(new Uint8Array(dv.signedPreKey.keyPair.privKey)),
        signature: base64.fromByteArray(new Uint8Array(dv.signedPreKey.signature)),
    }

    const oneTimePreKeys = dv.preKeys.map((pk) => ({
        keyId: pk.keyId,
        publicKey: base64.fromByteArray(new Uint8Array(pk.keyPair.pubKey)),
        privateKey: base64.fromByteArray(new Uint8Array(pk.keyPair.privKey))
    }))

    const identityKey = base64.fromByteArray(new Uint8Array(dv.identityKey))

    const registrationId = dv.registrationId

    return {
        signedPreKey,
        oneTimePreKeys,
        identityKey,
        registrationId
    }
}

export function serializeKeyBundle(dv) {
    const identityKey = base64.fromByteArray(new Uint8Array(dv.identityKey))
    const signedPreKey = {
        keyId: dv.signedPreKey.keyId,
        publicKey: base64.fromByteArray(new Uint8Array(dv.signedPreKey.publicKey)),
        signature: base64.fromByteArray(new Uint8Array(dv.signedPreKey.signature)),
    }

    const preKey = {
        keyId: dv.preKey.keyId,
        publicKey: base64.fromByteArray(new Uint8Array(dv.preKey.publicKey)),
    }

    return {
        identityKey,
        signedPreKey,
        preKey,
        registrationId: dv.registrationId,
    }
}

export function deserializeKeyBundle(kb) {
    const signedPreKey = {
        keyId: kb.signedPreKey.keyId,
        keyPair:{
            pubKey: base64.toByteArray(kb.signedPreKey.publicKey),
            privKey: base64.toByteArray(kb.signedPreKey.privateKey)
        },
        signature: base64.toByteArray(kb.signedPreKey.signature),
    }

    const preKeys = kb.oneTimePreKeys.map(key => {
        return {
            keyId: key.keyId,
            keyPair: {
                pubKey: base64.toByteArray(key.publicKey),
                privKey: base64.toByteArray(key.privateKey)
            }
        }

    })

    const identityKey = base64.toByteArray(kb.identityKey).buffer

    const registrationId = kb.registrationId

    return {
        signedPreKey,
        preKeys,
        registrationId,
        identityKey
    }
}