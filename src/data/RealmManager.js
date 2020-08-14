import { GLOBAL_PROTOCOLS } from './NetworkManager'

export default class RealmManager
{
    constructor(files, network)
    {
        this.network = network
        this.files = files
        this.knownRealms = [] // just a list of IDs - need to turn this into a list of RealmInfo or something - id, name, icon
    }
    
    async initialise()
    {
        this.addRecentRealms(await this.readRecentRealms())
    }


    addRecentRealms(realms, ignoreBroadcast)
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

        this.saveRecentRealms()
        // this.conjure.getScreens().screenRealms.updateRecentRealms(this.knownRealms)
        if(!ignoreBroadcast)
            this.network.sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms)
    }

    addRecentRealm(realm)
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
            this.saveRecentRealms()
            // this.conjure.getScreens().screenRealms.updateRecentRealms(this.knownRealms)
            this.network.sendData(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms)
        }
    }

    saveRecentRealms()
    {
        try {
            this.files.writeFile('recent_realms.json', JSON.stringify(this.knownRealms))
        } catch (error) {
            console.log('ConjureDatabase: could not save recent realms', this.knownRealms, 'with error', error);
            // this.conjure.getGlobalHUD().log('Failed to read recent realms')
        }
    }

    async readRecentRealms()
    {
        try
        {
            const data = await this.files.readFile('recent_realms.json')
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