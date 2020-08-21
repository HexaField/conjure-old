import { THREE, ExtendedGroup } from 'enable3d'
import Realm from './Realm'

export const REALM_PROTOCOLS = {
    HEARTBEAT: 'heartbeat', // {}
    DATABASE: {
        REQUESTHASHS: 'database.requesthashs',
        GIVEHASHS: 'database.givehashs',
        REQUESTOBJECT: 'database.requestobject',
        GIVEOBJECT: 'database.giveobject',
    },
    USER: {
        JOIN: 'user.join',
        UPDATE: 'user.update',
        MOVE: 'user.move',
        LEAVE: 'user.leave',
        ANIMATION: 'user.animation',
    },
    PROFILE: {
        PROPAGATE: 'profile.propagate', // for storing data in the network
        REQUEST: 'profile.request', // for asking for profile data based on id
        GIVE: 'profile.give', // for giving profile data based on id
        SERVICE: {
            PAYID: {
                REQUESTID: 'profile.service.payid.requestid',
                GIVEID: 'profile.service.payid.getid',
            },
        }
    },
    REALM: {
        REQUESTSETTINGS: 'realm.requestsettings',
        GIVESETTINGS: 'realm.givesettings',
        LOADEDREALM: 'realm.loadedrealm',
        TRONIFY: 'realm.tronify',
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

export default class Realms
{  
    constructor(world)
    {
        this.world = world
        this.conjure = this.world.conjure

        this.currentRealm = undefined
    }

    getCurrentRealm()
    {
        return this.currentRealm
    }

    async loadRealm()
    {
        
    }

    async createRealm()
    {
        
    }

    // { delta, input, mouseRaycaster, worldRaycaster }
    update(args)
    {

    }
}