import { GLOBAL_PROTOCOLS } from './GlobalNetwork'
import FileStorageDHT from './FileStorageDHT'
import SyncedDatabase from './SyncedDatabase'

// TODO
/*
    split broacast realms into broadcast known realms and broadcast available data
    we really need a dht for this...
*/

export default class RealmHandler
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.pinnedRealms = [] // just a list of IDs - need to turn this into a list of RealmData or something - id, name, icon

        this.receiveRealms = this.receiveRealms.bind(this)

        this.dataHandler.getGlobalNetwork().setProtocolCallback(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.receiveRealms)

        // this is hardcoded to clean up old realms as we are in rapid development
        this.earliestRealmTime = 1599176386000
        this.databases = {}
    }

    async validateRealms()
    {
        let realmCountBeforeValidation = this.pinnedRealms.length
        for(let i in this.pinnedRealms)
            if(this.pinnedRealms[i].timestamp <= this.earliestRealmTime )
                {
                    this.pinnedRealms.splice(i, 1)
                    await this.removeDatabase(this.pinnedRealms[i].id)
                }
        
        if(realmCountBeforeValidation - this.pinnedRealms.length > 0)
            global.log('Invalidated ' + (realmCountBeforeValidation - this.pinnedRealms.length) + ' old realms')
    }
    
    async initialise()
    {
        await this.addRealms(await this.loadRealms())
        global.log('Found', this.pinnedRealms.length, 'realms stored locally.')
    }

    receiveRealms(realms)
    {
        this.addRealms(realms, true)
    }

    async addRealms(realms, ignoreBroadcast)
    {
        if(!realms) return;
        for(let realm of realms)
        {
            if(!realm.id) continue
            let exists = false
            for(let myRealm of this.pinnedRealms)
            {
                if(myRealm.id === realm.id)
                {
                    if(realm.timestamp > myRealm.timestamp)
                        myRealm = realm
                    exists = true
                }
            }
            if(!exists)
            {
                this.pinnedRealms.unshift(realm)
                await this.addDatabase(realm.id)
            }
        }
        await this.saveRealms()
        // this.conjure.getScreens().screenRealms.updateRecentRealms(this.knownRealms)
        if(!ignoreBroadcast)
            this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.pinnedRealms)
    }

    async addRealm(realmData)
    {
        if(!realmData || !realmData.id) return;
        let exists = false
        for(let myRealm of this.pinnedRealms)
        {
            if(myRealm.id === realmData.id)
            {
                if(realmData.timestamp > myRealm.timestamp)
                   myRealm = realmData
                exists = true
                break
            }
        }
        if(!exists)
        {
            this.pinnedRealms.unshift(realmData)
            await this.addDatabase(realmData.id)
        }
        await this.saveRealms()
        this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.pinnedRealms)
    }

    async saveRealms()
    {
        await this.validateRealms()
        try {
            await this.dataHandler.getLocalFiles().writeFile('recent_realms.json', JSON.stringify(this.pinnedRealms))
        } catch (error) {
            global.log('ConjureDatabase: could not save recent realms', this.pinnedRealms, 'with error', error);
            // this.conjure.getGlobalHUD().log('Failed to read recent realms')
        }
    }

    async loadRealms()
    {
        try
        {
            const data = await this.dataHandler.getLocalFiles().readFile('recent_realms.json')
            if(!data) 
                return []
            return JSON.parse(data)
        }
        catch (error) {
            global.log('ConjureDatabase: could not read recent realms with error', error);
            // this.conjure.getGlobalHUD().log('Failed to load recent realms list')
            return
        }
    }

    // API

    async pinRealm(realmData, pin)
    {
        let needsUpdate = false
        if(pin)
        {
            let exists = false
            for(let i in this.pinnedRealms)
                if(this.pinnedRealms[i].id === realmData.id)
                    exists = true
            if(!exists)
            {
                this.pinnedRealms.unshift(realmData)
                await this.addDatabase(realmData.id)
                needsUpdate = true
            }
        }
        else
        {
            for(let i in this.pinnedRealms)
                if(this.pinnedRealms[i].id === realmData.id)
                {
                    this.pinnedRealms.splice(i, 1)
                    await this.removeDatabase(this.pinnedRealms[i].id)
                    needsUpdate = true
                    break
                }
        }
        
        if(!needsUpdate) return

        await this.saveRealms()
        this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.pinnedRealms)
    }

    async updateRealm(realmData)
    {
        await this.addRealm(realmData)
    }

    getRealm(id)
    {
        for(let realm of this.pinnedRealms)
            if(realm.id === id)
                return realm
    }

    getRealms()
    {
        return this.pinnedRealms
    }

    async addDatabase(id)
    {
        if(this.databases[id]) return
        this.databases[id] = new SyncedDatabase(this.dataHandler.getNetworkManager(), 'realms/' + String(id), this.dataHandler.getLocalFiles())
        await this.databases[id].initialise()
    }

    async removeDatabase(id)
    {
        if(!this.databases[id]) return
        await this.databases[id].close()
        delete this.databases[id]
    }

    async createObject(realmID, uuid, data)
    {
        if(!this.databases[realmID]) return
        return await this.databases[realmID].addEntry(uuid, data)
    }

    async updateObject(realmID, uuid, data)
    {
        if(!this.databases[realmID]) return
        return await this.databases[realmID].addEntry(uuid, data)
    }

    async destroyObject(realmID, uuid)
    {
        if(!this.databases[realmID]) return
        return await this.databases[realmID].removeEntry(uuid)
    }

    async getObjects(realmID)
    {
        if(!this.databases[realmID]) return
        return await this.databases[realmID].getAllValues()
    }
}