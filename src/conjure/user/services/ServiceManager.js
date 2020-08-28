import ProfileServiceDiscord from "./ProfileServiceDiscord"
// import ProfileServicePayID from "./ProfileServicePayID" 

export default class ServiceManager
{  
    constructor(conjure)
    {
        this.conjure = conjure
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
        this.conjure.getScreens().screenServices.selectService()
    }

    async initialiseServices()
    {
        for(let service of Object.values(this.services))
        {
            await service.initialise()
        }
        this.conjure.getScreens().screenServices.addServices()
    }

    // TODO
    getRealmsFromConnectedServices(callback)
    {
        for(let service of this.services)
        {
            // service.getRealms()
        }
    }

    setServicesFromDatabase(data)
    {
        for(let service of Object.keys(data))
            this.getService(service).readFromJson(data[service])
    }
}