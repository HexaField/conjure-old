import { GLOBAL_PROTOCOLS } from './GlobalNetwork'

export default class RealmManager
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.knownRealms = [] // just a list of IDs - need to turn this into a list of RealmData or something - id, name, icon

        this.receiveRealms = this.receiveRealms.bind(this)

        this.dataHandler.getGlobalNetwork().setProtocolCallback(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.receiveRealms)
    }
    
    async initialise()
    {
        this.addRealms(await this.loadRealms())
        console.log('Found', this.knownRealms.length, 'realms stored locally.')
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
            for(let myRealm of this.knownRealms)
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
                this.knownRealms.unshift(realm)
            }
        }

        await this.saveRealms()
        // this.conjure.getScreens().screenRealms.updateRecentRealms(this.knownRealms)
        if(!ignoreBroadcast)
            this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms)
    }

    async addRealm(realmData)
    {
        if(!realmData || !realmData.id) return;
        let exists = false
        for(let myRealm of this.knownRealms)
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
            this.knownRealms.push(realmData)
            await this.saveRealms()
            this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms)
        }
    }

    async saveRealms()
    {
        try {
            await this.dataHandler.getFiles().writeFile('recent_realms.json', JSON.stringify(this.knownRealms))
        } catch (error) {
            console.log('ConjureDatabase: could not save recent realms', this.knownRealms, 'with error', error);
            // this.conjure.getGlobalHUD().log('Failed to read recent realms')
        }
    }

    async loadRealms()
    {
        try
        {
            const data = await this.dataHandler.getFiles().readFile('recent_realms.json')
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

    async createRealm(realmData)
    {
        this.knownRealms.push(realmData)
        await this.saveRealms()
        this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms)
    }

    async updateRealm(realmData)
    {
        await this.addRealm(realmData)
    }

    getRealm(id)
    {
        for(let realm of this.knownRealms)
            if(realm.id === id)
                return realm
    }

    getRealms()
    {
        return this.knownRealms
    }
}