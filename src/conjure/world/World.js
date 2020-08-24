import { THREE, ExtendedGroup } from 'enable3d'
import Realm, { REALM_PROTOCOLS, GLOBAL_REALMS } from './realm/Realm'
import User from '../user/User'
import UserRemote from '../user/UserRemote'
import Platform from './Platform'
import { CONJURE_MODE } from '../Conjure';
import { INTERACT_TYPES } from '../screens/hud/HUDInteract';
import RealmData, { REALM_WORLD_GENERATORS } from './realm/RealmData'

export default class World
{  
    constructor(conjure)
    {
        this.conjure = conjure
        this.scene = this.conjure.scene

        this.group = new ExtendedGroup()
        this.scene.add(this.group)

        this.user = new User(conjure);
        this.users = [];

        this.lastUserUpdate = {};

        this.savePeriod = 5; // save every 5 seconds
        this.updatesPerSecond = 10; // update peers every 1/xth of a second 
        this.updateCount = 0;
        this.updateCountMax = 60 / this.updatesPerSecond;
        
        this.deltaThreshold = 0.1;

        this.vec3 = new THREE.Vector3();
        this.quat = new THREE.Quaternion();

        this.globalRealms = []
    }

    async getRealms()
    {
        let realms = []
        realms.push(...this.globalRealms)
        realms.push(...(await this.conjure.getDataHandler().getRealms()))
        return realms
    }

    async getRealm(id)
    {
        for(let realm of this.globalRealms)
            if(id === realm.id)
                return realm
        return await this.conjure.getDataHandler().getRealm(id)
    }

    async preloadGlobalRealms()
    {
        for(let realm of Object.keys(GLOBAL_REALMS))
        {
            this.globalRealms.push(GLOBAL_REALMS[realm])
        }
    }

    async joinRealm(realmData)
    {
        if(this.realm && realmData.getID() === this.realm.realmID) return
        if(this.platform) 
        {
            this.platform.destroy()
            this.platform = undefined
        }
        if(this.realm)
        {
            await this.realm.leave()
        }

        console.log('Joining realm', realmData)
        this.conjure.setConjureMode(CONJURE_MODE.LOADING)

        this.realm = new Realm(this, realmData)
        this.conjure.getProfile().setLastJoinedRealm(realmData.getID())
        await this.realm.connect()

        this.realm.sendData(REALM_PROTOCOLS.USER.JOIN, {
            username: this.conjure.getProfile().getUsername()
        })

        this.conjure.setConjureMode(CONJURE_MODE.EXPLORE)
    }

    async joinRealmByID(id)
    {
        if(!id) 
        {
            this.platform = new Platform(this.conjure, this.group)
            return
        }
        let realmData = new RealmData(await this.getRealm(id))
        await this.joinRealm(realmData)
    }

    // { delta, input, mouseRaycaster, worldRaycaster }

    update(updateArgs)
    {
        this.user.update(updateArgs);
        if(this.realm)
            this.realm.update(updateArgs)
        
        let interact = false;
        let interactDistance = this.interactMaxDistance;
        for(let user in this.users)
        {
            if(user.timedOut)
            {
                this.users.splice(user, 1)
                continue
            }
            this.users[user].update(updateArgs)
            if(this.users[user] && this.users[user].group) // make sure we havent destroyed user in update loop
                if(!interact && this.conjure.conjureMode === CONJURE_MODE.EXPLORE)
                {
                    let intersections = this.conjure.worldRaycaster.intersectObject(this.users[user].group, true);
                    if(intersections.length > 0 && intersections[0].distance < interactDistance)
                    {
                        interactDistance = intersections[0].distance;
                        interact = true;
                        this.conjure.screenManager.hudExplore.interact.setObject(this.users[user], INTERACT_TYPES.USER);
                    }
                }
        }
        // if(this.conjure.conjureMode === CONJURE_MODE.EXPLORE)
        // {
        //     let intersections = this.conjure.worldRaycaster.intersectObjects(this.objectManager.objects, true);
        //     if(intersections.length > 0 && intersections[0].distance < interactDistance)
        //     {
        //         interact = true;
        //         this.conjure.screenManager.hudExplore.interact.setObject(intersections[0].object, INTERACT_TYPES.OBJECT);
        //     }
        //     if(!interact)
        //         this.conjure.screenManager.hudExplore.interact.setObject();
        // }
        if(this.user.group && this.user.group.body)
            this.getWorldUpdates()
    }

    getWorldUpdates()
    {
        let deltaUpdate = true;
        this.updateCount++;
        if(this.updateCount > this.savePeriod * 60)
        {
            this.updateCount = 0; 
            deltaUpdate = false;
        }
        if(this.updateCount % this.updateCountMax === 0) // TODO: add delta updating
        {
            if(!deltaUpdate)
                this.sendData(REALM_PROTOCOLS.HEARTBEAT, {})
            let payload = {
                physics: {
                    position:this.user.group.getWorldPosition(this.vec3),
                    quaternion:this.user.group.getWorldQuaternion(this.quat),
                    velocity:this.user.group.body.velocity,
                    angularVelocity:this.user.group.body.angularVelocity
                }
            }
            // if(this.lastUserUpdate !== payload)
            // {
                this.lastUserUpdate = payload;
                this.sendData(REALM_PROTOCOLS.USER.MOVE, payload);
            // }
        }
    }


    receiveDataFromPeer(data, peerID)
    {
        /// send through a list of objects that are your copy
        // if(data.protocol !== REALM_PROTOCOLS.USER.MOVE) console.log('parsing data from user', data)
        switch(data.protocol) {
            case REALM_PROTOCOLS.HEARTBEAT: this.onUserUpdate({}, peerID); break;
            case REALM_PROTOCOLS.USER.JOIN: this.onUserJoin(data.content, peerID); break;
            case REALM_PROTOCOLS.USER.UPDATE: this.onUserUpdate(data.content, peerID); break;
            case REALM_PROTOCOLS.USER.MOVE: this.onUserMove(data.content, peerID); break;
            case REALM_PROTOCOLS.USER.LEAVE: this.onUserLeave(peerID); break;
            case REALM_PROTOCOLS.USER.ANIMATION: this.onUserAnimation(data.content, peerID); break;
            // case REALM_PROTOCOLS.OBJECT.CREATE: this.onObjectCreate(data.content, peerID); break;
            // case REALM_PROTOCOLS.OBJECT.UPDATE: this.onObjectUpdate(data.content, peerID); break;
            // case REALM_PROTOCOLS.OBJECT.GROUP: this.onObjectGroup(data.content, peerID); break;
            // case REALM_PROTOCOLS.OBJECT.MOVE: this.onObjectMove(data.content, peerID); break;
            // case REALM_PROTOCOLS.OBJECT.DESTROY: this.onObjectDestroy(data.content, peerID); break;
            default: break;
        }
    }

    async sendData(protocol, data)
    {
        if(this.realm)
            await this.realm.sendData(protocol, data);
    }

    async sendTo(protocol, data, peerID)
    {
        if(this.realm)
            await this.realm.sendTo(protocol, data, peerID);
    }

    // TODO: if user joins with same discordID and diff peerID, need to figure out implications

    onUserJoin(data, peerID)
    {
        let exists = false;
        for(let user of this.users)
            if(peerID === user.peerID)
                exists = user;
        if(exists)
        {
            this.onUserLeave(peerID)
        }
        else
        {
            this.sendTo(REALM_PROTOCOLS.USER.JOIN, {
                username: this.conjure.getProfile().getUsername()
            }, peerID)
        }
        this.users.push(new UserRemote(this.conjure, data.username, peerID))
        global.CONSOLE.log('User ', data.username, ' has joined')
    }
    
    destroyAllRemoteUsers()
    {
        for(let u = 0; u < this.users.length; u++)
        {
            this.users[u].timedOut = true;
            this.conjure.physics.destroy(this.users[u].group.body)
            this.scene.remove(this.users[u].group)
            this.users.splice(u, 1);
        }
    }

    onUserLeave(peerID)
    {
        for(let u = 0; u < this.users.length; u++)
            if(peerID === this.users[u].peerID)
                {
                    global.CONSOLE.log('User ', this.users[u].username, ' has left')
                    this.users[u].timedOut = true;
                    this.conjure.physics.destroy(this.users[u].group.body)
                    this.scene.remove(this.users[u].group)
                    this.users.splice(u, 1);
                    return
                }
    }
    
    onUserUpdate(data, peerID)
    {
        for(let u = 0; u < this.users.length; u++)
            if(peerID === this.users[u].peerID)
                {
                    this.users[u].updateInfo(data);
                    return
                }
    }

    onUserAnimation(data, peerID)
    {
        for(let u of this.users)
            if(peerID === u.peerID)
                {
                    u.setAction(data.name, data.fadeTime, data.once, data.startTime)
                    return
                }
    }
    // TODO: figure out the role of peerID since we use discord id to auth for now - we really need a user UUID
    onUserMove(data, peerID)
    {
        // this.onUserJoin(data, peerID); // need to retire this eventually
        for(let u of this.users)
            if(peerID === u.peerID)
                {
                    u.setPhysics(data.physics);
                    return
                }
    }
}