import { THREE, ExtendedGroup } from 'enable3d'
import Terrain from './Terrain'

export const REALM_PROTOCOLS = {
    HEARTBEAT: 'heartbeat', // {}
    // DATABASE: {
    //     REQUESTHASHS: 'database.requesthashs',
    //     GIVEHASHS: 'database.givehashs',
    //     REQUESTOBJECT: 'database.requestobject',
    //     GIVEOBJECT: 'database.giveobject',
    // },
    USER: {
        JOIN: 'user.join',
        UPDATE: 'user.update',
        MOVE: 'user.move',
        LEAVE: 'user.leave',
        ANIMATION: 'user.animation',
    },
    // PROFILE: {
    //     PROPAGATE: 'profile.propagate', // for storing data in the network
    //     REQUEST: 'profile.request', // for asking for profile data based on id
    //     GIVE: 'profile.give', // for giving profile data based on id
    //     SERVICE: {
    //         PAYID: {
    //             REQUESTID: 'profile.service.payid.requestid',
    //             GIVEID: 'profile.service.payid.getid',
    //         },
    //     }
    // },
    // REALM: {
    //     REQUESTSETTINGS: 'realm.requestsettings',
    //     GIVESETTINGS: 'realm.givesettings',
    //     LOADEDREALM: 'realm.loadedrealm',
    // },
    // OBJECT: {
    //     CREATE: 'object.create',
    //     UPDATE: 'object.update',
    //     GROUP: 'object.group',
    //     MOVE: 'object.move',
    //     DESTROY: 'object.destroy',
    //     REQUESTPRIMARY: 'object.requestprimary',
    //     ACCEPTPRIMARY: 'object.acceptprimary',
    //     TRANSFORM: {
    //         START: 'object.transform.start',
    //         UPDATE: 'object.transform.update',
    //         END: 'object.transform.end',
    //     },
    // },
}

export default class Realm
{  
    constructor(world, realmData)
    {   
        this.world = world
        this.conjure = this.world.conjure

        this.realmData = realmData
        this.realmID = realmData.getID()
        this.receiveDataFromPeer = this.receiveDataFromPeer.bind(this)
        this.onPeerJoin = this.onPeerJoin.bind(this)
        this.onPeerLeave = this.onPeerLeave.bind(this)
    }

    async connect()
    {
        this.conjure.getDataHandler().joinNetwork({ network: this.realmID, onMessage: this.receiveDataFromPeer, onPeerJoin: this.onPeerJoin, onPeerLeave: this.onPeerLeave })
        this.terrain = new Terrain(this.conjure, this.world.group, this.realmData.getTerrainSettings())
        // global.CONSOLE.addWatchItem('Users in ' + this.realmFolder, this.network.roomStats, 'peersCount')
    }
    
    
    getData()
    {
        return this.realmData.getData()
    }

    // { delta, input, mouseRaycaster, worldRaycaster }
    update(args)
    {

    }

    // networking

    receiveDataFromPeer(message)
    {
        console.log('Realm: receiveDataFromPeer', message)
        this.world.receiveDataFromPeer(message.data, message.from)
    }

    
    onPeerJoin(peerID)
    {
        if(this.loaded)
        {
            console.log('User ', peerID, ' has connected to the realm')
        }
        else
        {
            this.sendTo(REALM_PROTOCOLS.USER.JOIN, {}, peerID)
        }
    }

    onPeerLeave(peerID)
    {
        console.log('User ', peerID, ' has disconnected from the realm')
        this.world.onUserLeave(peerID)
    }

    sendData(protocol, content)
    {
        this.conjure.getDataHandler().sendDataNetwork({ network: this.realmID, protocol, content });
    }

    sendTo(protocol, content, peerID)
    {
        this.conjure.getDataHandler().sendToNetwork({ network: this.realmID, protocol, content, peerID });
    }
}