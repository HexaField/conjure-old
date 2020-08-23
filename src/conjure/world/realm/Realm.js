import { THREE, ExtendedGroup } from 'enable3d'
import Terrain from './Terrain'
import Feature from '../features/Feature'
import FeatureArtGallery from '../features/FeatureArtGallery'

export const GLOBAL_REALMS = {
    GALLERY: {
        id: 'Gallery',
        name: 'Gallery',
        timestamp: 0,
        worldSettings: {
            features: ['Gallery']
        }
    },
    EDEN: {
        id: 'Eden',
        name: 'Eden',
        timestamp: 0,
    },
}

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

        this.group = new THREE.Group()
        this.world.group.add(this.group)

        this.realmData = realmData
        this.realmID = realmData.getID()
        this.receiveDataFromPeer = this.receiveDataFromPeer.bind(this)
        this.onPeerJoin = this.onPeerJoin.bind(this)
        this.onPeerLeave = this.onPeerLeave.bind(this)

        this.features = []
    }

    async preload()
    {
        // this is where we load background things for global realms if we need to
    }

    async connect()
    {
        await this.conjure.getDataHandler().joinNetwork({ network: this.realmID, onMessage: this.receiveDataFromPeer, onPeerJoin: this.onPeerJoin, onPeerLeave: this.onPeerLeave })
        this.terrain = new Terrain(this.conjure, this.world.group, this.realmData.getWorldSettings())
        this.sendData(REALM_PROTOCOLS.USER.JOIN, this.conjure.getProfile().getUsername())

        await this.loadFeatures()
    }

    async loadFeatures()
    {
        for(let feature of this.realmData.getData().worldSettings.features)
            switch(feature)
            {
                case 'Gallery': 
                    let f = new FeatureArtGallery(this)
                    await f.load()
                    this.features.push(f)
                    break

                default: break
            }
    }

    async leave()
    {
        await this.conjure.getDataHandler().leaveNetwork({ network: this.realmID })
        if(this.terrain)
        {
            this.terrain.destroy()
        }
        this.world.group.remove(this.group)
        console.log('successfully left realm')
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

    receiveDataFromPeer(data, from)
    {
        this.world.receiveDataFromPeer(data, from)
    }

    
    onPeerJoin(peerID)
    {
        global.CONSOLE.log('User ', peerID, ' has join the realm')
        this.sendTo(REALM_PROTOCOLS.USER.JOIN, this.conjure.getProfile().getUsername() || '', peerID)
    }

    onPeerLeave(peerID)
    {
        global.CONSOLE.log('User ', peerID, ' has left the realm')
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