import Network from './Network'

export default class NetworkManager
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.networks = {}
    }

    joinNetwork(network, onMessage, onPeerJoin, onPeerLeave)
    {
        if(this.networks[network]) return
        this.networks[network] = new Network(this.dataHandler.getIPFS(), this.dataHandler.getPeerID(), network, onMessage, onPeerJoin, onPeerLeave, { showStats: true })
    }

    async leaveNetwork(network)
    {
        if(!this.networks[network]) return
        try { 
            await this.networks[network].leave() 
            delete this.networks[network]
            return true
        } catch (error) {
            return false
        }
    }

    async sendTo(network, protocol, content, peerID)
    {
        if(!this.networks[network]) return
        await this.networks[network].sendTo(protocol, content, peerID)
    }

    async sendData(network, protocol, content)
    {
        if(!this.networks[network]) return
        await this.networks[network].sendData(protocol, content)
    }
}