import { THREE, ExtendedGroup } from 'enable3d'
import Terrain from './Terrain'
import FeatureArtGallery from '../features/FeatureArtGallery'
import FeatureLookingGlass from '../features/FeatureLookingGlass'
import { REALM_WORLD_GENERATORS, REALM_VISIBILITY, REALM_WHITELIST } from './RealmData'
import Platform from '../Platform'
import ObjectManager from './ObjectManager'
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
    OBJECT: {
        CREATE: 'object.create',
        UPDATE: 'object.update',
        GROUP: 'object.group',
        MOVE: 'object.move',
        DESTROY: 'object.destroy',
        REQUESTPRIMARY: 'object.requestprimary',
        ACCEPTPRIMARY: 'object.acceptprimary',
        TRANSFORM: {
            START: 'object.transform.start',
            UPDATE: 'object.transform.update',
            END: 'object.transform.end',
        },
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

        this.objectLoader = new THREE.ObjectLoader();
        this.objectManager = new ObjectManager(this)

        this.realmData = realmData
        this.realmID = realmData.getID()
        this.receiveDataFromPeer = this.receiveDataFromPeer.bind(this)
        this.onPeerJoin = this.onPeerJoin.bind(this)
        this.onPeerLeave = this.onPeerLeave.bind(this)

        this.vec3 = new THREE.Vector3();
        this.quat = new THREE.Quaternion();

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
        this.getObjectManager().destroyAllObjects()
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

    update(args) // { delta, input, mouseRaycaster, worldRaycaster, conjure }
    {
        for(let i of this.features)
            i.update(args)
    }

    // ------- //
    // NETWORK //
    // ------- //

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

    getObjectManager()
    {
        return this.objectManager
    }
    
    // onObjectCreate(data, peerID)
    // {
    //     this.loadObjectFromPeer(data.hash, data.timestamp, data.object);
    // }
    
    // update to actual object properties
    onObjectUpdate(data, peerID)
    {
        console.log('onObjectUpdate', data)
    }

    // update to actual object properties
    onObjectGroup(data, peerID)
    {
        this.objectManager.groupObjects(this.objectManager.getObjectByUUID(data.newParentUUID), this.objectManager.getObjectByUUID(data.newChildUUID))
    }

    // update to object matrix
    onObjectMove(data, peerID)
    {
        for(let obj of data.objects)
        {
            // console.log('WORLD: onObjectMove got data', obj.data)
            this.objectManager.updateObjectFromClient(obj.uuid, obj.data);
        }
    }
    
    onObjectDestroy(hash, peerID)
    {
        this.destroyObject(hash)
        this.objectManager.destroyObjectByHash(hash);
    }

    // ------- //
    // OBJECTS //
    // ------- //

    async createObject(object)
    {
        object.userData.originatorID = this.conjure.getProfile().getID();
        object.position.copy(this.world.user.previewMeshPoint.getWorldPosition(this.vec3));
        object.quaternion.copy(this.world.user.previewMeshPoint.getWorldQuaternion(this.quat));
        object.updateMatrixWorld();
        this.restorePhysics(object);
        let json = await this.objectToJSON(object);
        let metaData = { 
            originatorID: this.conjure.getProfile().getID(),
            realm: this.realmID,
            timestamp: Date.now(), 
        }
        this.conjure.screenManager.hideScreen();
        let databaseObject = await this.conjure.getDataHandler().createObject(metaData, json)
        if(databaseObject) // if adding to IPFS failed, don't put it into our world
        {
            console.log('made object and giving it hash', databaseObject)
            object.userData.hash = databaseObject.hash;
            this.objectManager.addObject(object)
            json = await this.objectToJSON(object);
            this.sendData(REALM_PROTOCOLS.OBJECT.CREATE, { hash: databaseObject.hash, timestamp:databaseObject.timestamp, data:json });
        }
    }

    // TODO: replace geometries & materials with asset hashes too 
    // - do we need to do this before converting? (this will crash it bro...) 
    // so need to use before conversion and save after conversion hmm
    async objectToJSON(obj)
    {
        let json = obj.toJSON();
        
        if(json.images)
            for(let i = 0; i < json.images.length; i++)
            {
                 // if we previously failed to get the image, we don't want to save the missing texture data
                if(json.images[i].url === this.conjure.assetManager.missingTextureData) continue

                json.images[i].hash = await this.conjure.assetManager.createAsset(ASSET_TYPE.TEXTURE, json.images[i].url, json.images[i].uuid);
                let newUUID = this.conjure.assetManager.getByIPFSHash(ASSET_TYPE.TEXTURE, json.images[i].hash).data.uuid;
                if(newUUID !== json.images[i].uuid)  // if asset already exists, replace the uuid
                {
                    if(json.textures) // replace uuid reference in texture
                        for(let j = 0; j < json.textures.length; j++)
                            if(json.textures[j].image === json.images[i].uuid)
                                json.textures[j].image = newUUID;
                    json.images[i].uuid = newUUID;
                }
                json.images[i].url = '';
            }
        return json;
    }


    async loadObject(data, hash)
    {
        try
        {
            if(data.images)
                for(let i = 0; i < data.images.length; i++)
                {
                    if(!data.images[i].hash) continue;
                    data.images[i].url = await this.conjure.assetManager.loadImageAssetFromHash(data.images[i].hash);
                }
            let object = this.loadObjectAssets(data);
            await this.conjure.assetManager.saveAssets(object)
            // console.log(object)
            object.userData.hash = hash;
            this.restorePhysics(object);
            this.objectManager.addObject(object)
            if(data.object.userData.lastUpdate)
                this.objectManager.updateObjectFromClient(object.uuid, data.object.userData.lastUpdate)
            return true
        }
        catch(error)
        {
            console.log(error, data)
            return false;
        }
    }

    // TODO: this
    loadObjectAssets(json)
    {
        return this.objectLoader.parse(json);
    }

    restorePhysics(object)
    {
        if(object.userData.physics && !object.body && this.objectManager.getPhysicsType(object.userData.physics.type) >= 0)
        {
            this.conjure.physics.add.existing(object, {
                shape: this.objectManager.getPhysicsShape(object.userData.physics.shape),
                collisionFlags: this.objectManager.getPhysicsType(object.userData.physics.type),
                mass: object.userData.physics.mass,
                // breakable: object.userData.physics.destructable
            });
            object.body.setGravity(0, object.userData.physics.gravity * this.gravity, 0);
            object.body.setBounciness(object.userData.physics.bounciness);
        }
    }

    // TODO: fix this - hashs arent handled properly
    async updateObjectPosition(obj)
    {
        await this.updateObject(obj) // temp fix

        // await this.conjure.getDataHandler().updateObjectPosition(obj.userData.hash, obj.userData.lastUpdate);
        // if(!obj.userData.hash) return;
        // let json = await this.objectToJSON(obj)
        // await this.conjure.getDataHandler().updateObject(obj.userData.hash, json);
    }

    async updateObject(obj)
    {
        if(!obj) return;
        if(!obj.userData.hash) 
        {
            console.log('Tried to update object without a hash! Are you sure this object is a top parent?')
            return;
        }
        let json = await this.objectToJSON(obj)
        await this.conjure.getDataHandler().updateObject(obj.userData.hash, json);
    }

    async destroyObject(obj)
    {
        obj.userData.markedDestroyed = true;
        if(this.objectManager.getObject(obj))
        {
            let success = await this.conjure.getDataHandler().destroyObject(obj.userData.hash)
            if(success)
            {
                this.objectManager.destroyObject(obj);
                this.sendData(REALM_PROTOCOLS.OBJECT.DESTROY, obj.userData.hash, true);
            }
            else
            {
                obj.userData.markedDestroyed = false;
                console.log('failed to remove object', obj.uuid)
            }
        }
        else
        {
            let topParent = this.objectManager.getTopGroupObject(obj)
            this.sendData(REALM_PROTOCOLS.OBJECT.UPDATE, topParent, true);
            this.objectManager.destroyObject(obj, { isChild: true });
            await this.updateObject(topParent)
        }
    }
}