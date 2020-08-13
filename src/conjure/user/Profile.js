import { REALM_PROTOCOLS } from "../world/realm/RealmManager"
import ProfileServiceDiscord from "./services/ProfileServiceDiscord"
// import ProfileServicePayID from "./services/ProfileServicePayID"

export default class Profile
{  
    constructor(conjure)
    {
        this.conjure = conjure
        this.isLoaded = false
        this.lastUpdated = 0

        // data
        this.profileData = {
            //username: 'New User ' + Math.round(Math.random() * 10000)
        }
     
        this.services = {}

        this.addService(new ProfileServiceDiscord(this))
        // this.addService(new ProfileServicePayID(this))
    }

    getServiceAsJson()
    {
        let servicesJson = {}
        for(let service of Object.keys(this.services))
            servicesJson[service] = this.services[service].toJson()
        return servicesJson
    }

    addService(service)
    {
        this.services[service.getName()] = service
    }

    linkService(serviceName)
    {
        this.services[serviceName].link()
    }

    unlinkService(serviceName)
    {
        this.services[serviceName].unlink()
    }

    getServiceLinked(serviceName)
    {
        return this.services[serviceName].getIsLinked()
    }

    getService(serviceName)
    {
        return this.services[serviceName]
    }

    refreshServices()
    {
        this.conjure.screenManager.screenServices.selectService()
    }

    async initialiseServices()
    {
        for(let service of Object.values(this.services))
        {
            await service.initialise()
        }
        this.conjure.screenManager.screenServices.addServices()
    }

    getProfile()
    {
        return this.profileData
    }

    getID()
    {
        return this.profileData.id
    }

    getUsername()
    {
        return this.profileData.username
    }

    setUsername(newName)
    {
        this.profileData.username = newName
    }

    // addService(service)
    // {
    //     let serviceExists = false
    //     for(let s of this.services)
    //     {
    //         if(s === service)
    //             serviceExists = true
    //     }
    //     if(!serviceExists)
    //         this.services.push(service)
    // }

    createProfile()
    {
        if(this.isLoaded) return
        this.profileData.id = Date.now()
        this.profileData.username = 'New User ' + Math.round(Math.random() * 10000)
        this.saveProfile()
        this.sendToPeers()
        this.setProfileLoaded(true)
    }

    removeProfile()
    {
        if(!this.isLoaded) return
        this.profileData = {}
        this.setProfileLoaded(false)
    }

    sendToPeers()
    {
        // this.conjure.world.sendData(REALM_PROTOCOLS.PROFILE.PROPAGATE, this.getProfile())
    }

    loadFromPeer(data)
    {
        if(data.timestamp < this.lastUpdated) return
        this.lastUpdated = data.timestamp
        console.log(data.data)
        if(data.data.profile)
            this.setProfileFromDatabase(data.data.profile)
        if(data.data.services)
            this.setServicesFromDatabase(data.data.services)
    }

    requestFromPeer(id)
    {
        this.conjure.world.sendData(REALM_PROTOCOLS.PROFILE.REQUEST, id)
    }

    async loadFromDatabase()
    {
        let data = await this.conjure.conjureDatabase.loadProfile()
        
        if(!data || data.timestamp < this.lastUpdated || !data.data) return
        this.lastUpdated = data.timestamp

        console.log('loadFromDatabase', data)
        if(data.data.profile)
            this.setProfileFromDatabase(data.data.profile)
        if(data.data.services)
            this.setServicesFromDatabase(data.data.services)
    }

    saveProfile()
    {
        this.conjure.conjureDatabase.saveProfile({ profile:this.profileData, services:this.getServiceAsJson() })
        this.conjure.world.sendData(REALM_PROTOCOLS.USER.UPDATE, { username: this.getUsername() })
    }

    setServicesFromDatabase(data)
    {
        for(let service of Object.keys(data))
            this.getService(service).readFromJson(data[service])
    }

    setProfileFromDatabase(data)
    {
        this.setUsername(data.username)
        this.setProfileLoaded(true)

        global.CONSOLE.log('Successfully loaded profile!')
    }

    setProfileLoaded(loaded)
    {
        this.conjure.screenManager.screenProfile.setProfileLoaded(loaded)
        this.isLoaded = loaded
        if(loaded)
        {
            this.conjure.screenManager.screenProfile.setProfileName(this.getUsername()) // eventually change this to update all profile info on screen
        }
    }

    // TODO
    getRealmsFromConnectedServices(callback)
    {
        for(let service of this.services)
        {
            // service.getRealms()
        }
    }
}