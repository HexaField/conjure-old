import { GLOBAL_PROTOCOLS } from './GlobalNetwork'

export default class RealmManager
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.knownRealms = [] // just a list of IDs - need to turn this into a list of RealmInfo or something - id, name, icon

        this.receiveRealms = this.receiveRealms.bind(this)

        this.dataHandler.getGlobalNetwork().setProtocolCallback(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.receiveRealms)
    }
    
    async initialise()
    {
        this.addRealms(await this.loadRealms())
    }

    receiveRealms(realms)
    {
        this.addRealms(realms, true)
    }

    addRealms(realms, ignoreBroadcast)
    {
        if(!realms) return;
        for(let realm of realms)
        {
            if(!realm.id) continue
            let exists = false
            for(let myRealm of this.knownRealms)
            {
                if(Number(myRealm.id) === Number(realm.id))
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

        this.saveRealms()
        // this.conjure.getScreens().screenRealms.updateRecentRealms(this.knownRealms)
        if(!ignoreBroadcast)
            this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms)
    }

    addRealm(realm)
    {
        if(!realm || !realm.id) return;
        let exists = false
        for(let myRealm of this.knownRealms)
        {
            if(Number(myRealm.id) === Number(realm.id))
            {
                if(Number(realm.timestamp) > Number(myRealm.timestamp))
                   myRealm = realm
                exists = true
                break
            }
        }
        if(!exists)
        {
            this.knownRealms.push(realm)
            // this.knownRealms.sort()
            this.saveRealms()
            // this.conjure.getScreens().screenRealms.updateRecentRealms(this.knownRealms)
            this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms)
        }
    }

    saveRealms()
    {
        try {
            this.dataHandler.getFiles().writeFile('recent_realms.json', JSON.stringify(this.knownRealms))
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
}