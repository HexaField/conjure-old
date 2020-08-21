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
    constructor(data)
    {
        this.setData(data)
    }

    setData(params = {})
    {
        const now = Date.now()
        this.data = {
            id: params.id || now, // requiring a realm to be made adds extra security - network layer should only ever deal with data, not realms directly
            name: params.name || this.getName() || 'New Realm',
            timestamp: now,
            iconURL: params.iconURL || this.getIconURL(),
            visibility: REALM_VISIBILITY.PUBLIC,
            architectures: params.architectures || [],
            terrainSettings: params.terrainSettings || {
                terrainGeneratorType: REALM_TERRAIN_GENERATORS.INFINITE_TERRAIN 
            },
        }
    }

    getTerrainSettings()
    {
        return this.data.terrainSettings
    }

    getData()
    {
        return this.data
    }

    getID()
    {
        return this.data.id
    }

    getName()
    {
        if(this.data)
            return this.data.name
        return ''
    }

    getIconURL()
    {
        if(this.data)
            return this.data.iconURL
        return ''
    }
}