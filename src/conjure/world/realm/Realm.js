import { THREE, ExtendedGroup } from 'enable3d'
import Terrain from './Terrain'
import FeatureArtGallery from '../features/FeatureArtGallery'
import FeatureLookingGlass from '../features/FeatureLookingGlass'
import { REALM_WORLD_GENERATORS, REALM_VISIBILITY, REALM_WHITELIST } from './RealmData'
import Platform from '../Platform'
// import FeatureParser from './FeatureParser'

export const GLOBAL_REALMS = {
    GALLERY: {
        id: 'Gallery',
        name: 'SuperRare Ethereum Gallery',
        timestamp: 0,
        visibility: REALM_VISIBILITY.PUBLIC,
        worldSettings: {
            features: ['Gallery'],
            worldGeneratorType: REALM_WORLD_GENERATORS.NONE
        }
    },
    EDEN: {
        id: 'Eden',
        name: 'Eden',
        timestamp: 0,
        visibility: REALM_VISIBILITY.PUBLIC,
    },
}

export const REALM_PROTOCOLS = {
    HEARTBEAT: 'heartbeat',
    USER: {
        JOIN: 'user.join',
        UPDATE: 'user.update',
        MOVE: 'user.move',
        LEAVE: 'user.leave',
        ANIMATION: 'user.animation',
    },
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

        this.networkProtocolCallbacks = {}
    }

    async preload()
    {
        await this.conjure.getDataHandler().joinNetwork({ network: this.realmID, onMessage: this.receiveDataFromPeer, onPeerJoin: this.onPeerJoin, onPeerLeave: this.onPeerLeave })
        
        if(this.realmData.getData().worldSettings.worldGeneratorType === REALM_WORLD_GENERATORS.INFINITE_WORLD)
            this.terrain = new Terrain(this.conjure, this.world.group, this.realmData.getWorldSettings())
        else
            this.terrain = new Platform(this.conjure, this.world.group)
        
        if(this.realmData.getData().worldData.playsAudio)
        {
           await this.conjure.getAudioManager().create(true)
        }

        await this.preloadFeatures()
    }

    async preloadFeatures()
    {
        for(let feature of this.realmData.getData().worldSettings.features)
        {
            // if(typeof feature === 'object')
            // {
            //     let f = new FeatureParser(this, feature)
            //     await f.parse()
            //     await f.preload()
            //     this.features.push(f)
            //     continue
            // }
            switch(feature)
            {
                case 'Gallery': {
                    let f = new FeatureArtGallery(this)
                    await f.preload()
                    this.features.push(f)
                    break
                }

                case 'Looking Glass': {
                    let f = new FeatureLookingGlass(this)
                    await f.preload()
                    this.features.push(f)
                    break
                }

                default: break
            }
        }
    }

    addNetworkProtocolCallback(protocol, callback)
    {
        this.networkProtocolCallbacks[protocol] = callback
    }

    removeNetworkProtocolCallback(protocol)
    {
        if(this.networkProtocolCallbacks[protocol])
            delete this.networkProtocolCallbacks[protocol]
    }

    async load()
    {
        for(let feature of this.features)
            await feature.load()
    }

    async leave()
    {
        await this.conjure.getDataHandler().leaveNetwork({ network: this.realmID })
        if(this.terrain)
        {
            this.terrain.destroy()
        }
        for(let feature of this.features)
            feature.unload()
        this.world.group.remove(this.group)
        console.log('successfully left realm')
    }
    
    
    getData()
    {
        return this.realmData.getData()
    }

    // { delta, input, mouseRaycaster, worldRaycaster, conjure }
    update(args)
    {
        for(let i of this.features)
            i.update(args)
    }

    // networking

    receiveDataFromPeer(data, from)
    {
        if(this.networkProtocolCallbacks[data.protocol])
            this.networkProtocolCallbacks[data.protocol](data.content, from) 
        else
            this.world.receiveDataFromPeer(data, from)
    }

    
    onPeerJoin(peerID)
    {
        console.log('User ', peerID, ' has join the realm')
        this.sendData(REALM_PROTOCOLS.USER.JOIN, { username: this.conjure.getProfile().getUsername() || '' }, peerID)
    }

    onPeerLeave(peerID)
    {
        console.log('User ', peerID, ' has left the realm')
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