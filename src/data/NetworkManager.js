import Network from './Network'

export const GLOBAL_PROTOCOLS = {
    BROADCAST_REALMS: 'broadcast_realms',
}

export default class NetworkManager
{
    constructor(dataHandler, ipfs, peerID)
    {
        this.dataHandler = dataHandler
        this.parseNetworkData = this.parseNetworkData.bind(this)
        this.peerJoin = this.peerJoin.bind(this)
        this.peerLeave = this.peerLeave.bind(this)

        this.network = new Network(ipfs, peerID, 'global', this.parseNetworkData, { showStats:true })
        this.network.addPeerJoinCallback(this.peerJoin)
        this.network.addPeerLeftCallback(this.peerLeave)
    }

    async initialise()
    {
    }

    parseNetworkData(data)
    {
        this.dataHandler.parseNetworkData(data)
    }

    peerJoin(peerID)
    {
        console.log('User ', peerID, ' has logged into conjure!')
        this.network.sendTo(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms, peerID)
    }

    peerLeave(peerID)
    {
        console.log('User ', peerID, ' has left conjure.')
    }

    async leave()
    {
        await this.network.leave()
    }

    async sendTo(protocol, content, peerID)
    {
        await this.network.sendTo(protocol, content, peerID)
    }

    async sendData(protocol, content)
    {
        await this.network.sendData(protocol, content)
    }
}