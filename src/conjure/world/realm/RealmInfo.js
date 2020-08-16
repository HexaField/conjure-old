import { THREE, ExtendedGroup } from 'enable3d'

export const REALM_TERRAIN_GENERATORS = {
    NONE: 'None',
    INFINITE_TERRAIN: 'Infinite Terrain',
    PAYID_DEMO: 'PayID Demo',
}

export const REALM_VISIBILITY = {
    PUBLIC: 'Public',
    PRIVATE: 'Private'
}

export default class RealmInfo
{  
    constructor(info)
    {
        this.setInfo(info)
    }

    setInfo(params = {})
    {
        const now = Date.now()
        this.info = {
            id: params.id || now, // requiring a realm to be made adds extra security - network layer should only ever deal with data, not realms directly
            name: params.name || this.getInfo() || 'Realm ' + now,
            timestamp: now,
            iconURL: params.iconURL || this.getIconURL(),
            visibility: REALM_VISIBILITY.PUBLIC,
            architectures: params.architectures || [],
            worldSettings: params.worldSettings || {
                terrainGeneratorType: REALM_TERRAIN_GENERATORS.PAYID_DEMO 
            },
        }
    }

    getInfo()
    {
        if(this.info)
            return this.info
        return undefined
    }

    getName()
    {
        if(this.info)
            return this.info.name
        return undefined
    }

    getIconURL()
    {
        if(this.info)
            return this.info.iconURL
        return undefined
    }
}