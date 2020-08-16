export const GLOBAL_PROTOCOLS = {
    BROADCAST_REALMS: 'broadcast_realms',
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

    parseReceiveData(data)
    {
        if(this.protocolCallbacks[data.protocol] !== undefined)
            this.protocolCallbacks[data.protocol](data, message.from);
    }

    onPeerJoin(peerID)
    {
        console.log('User ', peerID, ' has logged into conjure!')
        this.sendTo(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms, peerID)
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
        await this.dataHandler.networkManager.sendData(protocol, content)
    }
}