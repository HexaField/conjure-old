import { GLOBAL_PROTOCOLS } from './GlobalNetwork'

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
    }

    validateRealms()
    {
        let realmCountBeforeValidation = this.pinnedRealms.length
        for(let i in this.pinnedRealms)
            if(this.pinnedRealms[i].timestamp <= this.earliestRealmTime )
                this.pinnedRealms.splice(i, 1)
        
        if(realmCountBeforeValidation - this.pinnedRealms.length > 0)
            console.log('Invalidated ' + (realmCountBeforeValidation - this.pinnedRealms.length) + ' old realms')
    }
    
    async initialise()
    {
        this.addRealms(await this.loadRealms())
        console.log('Found', this.pinnedRealms.length, 'realms stored locally.')
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
            this.pinnedRealms.push(realmData)
        }
        await this.saveRealms()
        this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.pinnedRealms)
    }

    async saveRealms()
    {
        this.validateRealms()
        try {
            await this.dataHandler.getLocalFiles().writeFile('recent_realms.json', JSON.stringify(this.pinnedRealms))
        } catch (error) {
            console.log('ConjureDatabase: could not save recent realms', this.pinnedRealms, 'with error', error);
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
            console.log('ConjureDatabase: could not read recent realms with error', error);
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
            this.pinnedRealms.push(realmData)
            needsUpdate = true
        }
        else
        {
            for(let i in this.pinnedRealms)
                if(this.pinnedRealms[i].id === realmData.id)
                {
                    this.pinnedRealms.splice(i, 1)
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
}