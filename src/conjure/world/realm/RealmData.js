import { THREE, ExtendedGroup } from 'enable3d'

export const REALM_TERRAIN_GENERATORS = {
    NONE: 'None',
    INFINITE_TERRAIN: 'Infinite Terrain',
}

export const REALM_VISIBILITY = {
    PUBLIC: 'Public',
    PRIVATE: 'Private'
}

export default class RealmData
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
            name: params.name || this.getName() || 'New Realm',
            timestamp: now,
            iconURL: params.iconURL || this.getIconURL(),
            visibility: REALM_VISIBILITY.PUBLIC,
            architectures: params.architectures || [],
            worldSettings: params.worldSettings || {
                terrainGeneratorType: REALM_TERRAIN_GENERATORS.INFINITE_TERRAIN 
            },
        }
    }

    getInfo()
    {
        return this.info
    }

    getName()
    {
        if(this.info)
            return this.info.name
        return ''
    }

    getIconURL()
    {
        if(this.info)
            return this.info.iconURL
        return ''
    }
}