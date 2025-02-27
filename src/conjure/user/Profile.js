import { REALM_PROTOCOLS } from "../world/realm/Realm"
import ServiceManager from './services/ServiceManager'

export default class Profile
{  
    constructor(conjure)
    {
        this.conjure = conjure
        this.isLoaded = false
        this.lastUpdated = 0

        // data
        this.profileData = {}
        this.makeDefaultProfile()
     
        this.serviceManager = new ServiceManager(conjure)
    }

    makeDefaultProfile()
    {
        this.profileData = {
            id: Date.now(),
            username: 'New User ' + Math.round(Math.random() * 10000)
        }
    }

    getServiceManager() { return this.serviceManager }
    getProfile() { return this.profileData }
    getID() { return this.profileData.id }
    getUsername() { return this.profileData.username }
    
    setUsername(newName)
    {
        this.profileData.username = newName
        this.conjure.getWorld().sendData(REALM_PROTOCOLS.USER.UPDATE, { username: this.getUsername() })
    }

    createProfile()
    {
        if(this.isLoaded) return
        this.saveProfile()
        this.sendToPeers()
        this.setProfileLoaded(true)
    }

    removeProfile()
    {
        if(!this.isLoaded) return
        this.makeDefaultProfile()
        this.setProfileLoaded(false)
    }

    sendToPeers()
    {
        // this.conjure.getWorld().sendData(REALM_PROTOCOLS.PROFILE.PROPAGATE, this.getProfile())
    }

    loadFromPeer(data)
    {
        if(data.timestamp < this.lastUpdated) return
        this.lastUpdated = data.timestamp
        console.log(data.data)
        if(data.data.profile)
            this.setProfileFromDatabase(data.data.profile)
        if(data.data.services)
            this.getServiceManager().setServicesFromDatabase(data.data.services)
    }

    // requestFromPeer(id)
    // {
    //     this.conjure.getWorld().sendData(REALM_PROTOCOLS.PROFILE.REQUEST, id)
    // }

    async loadFromDatabase()
    {
        let data = await this.conjure.getDataHandler().loadProfile()
        
        if(!data || data.timestamp < this.lastUpdated || !data.data) return
        this.lastUpdated = data.timestamp

        console.log('loadFromDatabase', data)
        if(data.data.profile)
            this.setProfileFromDatabase(data.data.profile)
        if(data.data.services)
            this.getServiceManager().setServicesFromDatabase(data.data.services)
    }

    saveProfile()
    {
        this.conjure.getDataHandler().saveProfile({ profile: this.profileData, services: this.getServiceManager().getServiceAsJson() })
    }

    setProfileFromDatabase(data)
    {
        this.profileData = data
        this.setProfileLoaded(true)

        this.conjure.getGlobalHUD().log('Successfully loaded profile!')
    }

    setProfileLoaded(loaded)
    {
        this.conjure.getScreens().screenProfile.setProfileLoaded(loaded)
        this.isLoaded = loaded
        if(loaded)
        {
            this.conjure.getScreens().screenProfile.setProfileName(this.getUsername()) // eventually change this to update all profile info on screen
        }
    }
}