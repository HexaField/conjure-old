import platform from 'platform'

export const GLOBAL_PROTOCOLS = {
    BROADCAST_REALMS: 'broadcast_realms',
    BROADCAST_INFO: 'broadcast_info'
}

export default class GlobalNetwork
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler

        this.networkID = 'global'
        this.protocolCallbacks = {}
        
        this.parseReceiveData = this.parseReceiveData.bind(this)
        this.onPeerJoin = this.onPeerJoin.bind(this)
        this.onPeerLeave = this.onPeerLeave.bind(this)

        this.dataHandler.networkManager.joinNetwork(this.networkID, this.parseReceiveData, this.onPeerJoin, this.onPeerLeave)
        this.setProtocolCallback(GLOBAL_PROTOCOLS.BROADCAST_INFO, (data, from) => {
            console.log(from, ' has connected via ' + data.env + ' on ' + data.platform)
        })
    }

    // add callback for a certain protocol
    setProtocolCallback(protocol, callback)
    {
        this.protocolCallbacks[protocol] = callback
    }

    // remove callback for a certain protocol
    removeProtocolCallback(protocol)
    {
        delete this.protocolCallbacks[protocol]
    }

    parseReceiveData(data, from)
    {
        // console.log('GlobalNetwork: parseReceiveData: ', data.protocol)
        if(this.protocolCallbacks[data.protocol] !== undefined)
            this.protocolCallbacks[data.protocol](data.content, from);
    }

    onPeerJoin(peerID)
    {
        this.sendTo(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.dataHandler.getRealmManager().getRealms(), peerID)
        this.sendTo(GLOBAL_PROTOCOLS.BROADCAST_INFO, {
                env: global.isBrowser ? 'Browser' : 'Node',
                version: global.conjureVersion,
                platform: platform.description  
            }, peerID)
    }

    onPeerLeave(peerID)
    {
        console.log('User ', peerID, ' has left conjure.')
    }

    async leave()
    {
        await this.globalNetwork.leave()
    }

    async sendTo(protocol, content, peerID)
    {
        await this.dataHandler.networkManager.sendTo(this.networkID, protocol, content, peerID)
    }

    async sendData(protocol, content)
    {
        await this.dataHandler.networkManager.sendData(this.networkID, protocol, content)
    }
}