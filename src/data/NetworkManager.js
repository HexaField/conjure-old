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

        this.globalNetwork = new Network(ipfs, peerID, 'global', this.parseNetworkData, { showStats:true })
        this.globalNetwork.addPeerJoinCallback(this.peerJoin)
        this.globalNetwork.addPeerLeftCallback(this.peerLeave)
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
        this.globalNetwork.sendTo(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.knownRealms, peerID)
    }

    peerLeave(peerID)
    {
        console.log('User ', peerID, ' has left conjure.')
    }

    async leave()
    {
        await this.globalNetwork.leave()
    }

    async sendTo(protocol, content, peerID)
    {
        await this.globalNetwork.sendTo(protocol, content, peerID)
    }

    async sendData(protocol, content)
    {
        await this.globalNetwork.sendData(protocol, content)
    }
}