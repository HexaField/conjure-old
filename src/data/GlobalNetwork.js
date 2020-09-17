import platform from 'platform'
import NetworkInterface from './NetworkInterface'

export const GLOBAL_PROTOCOLS = {
    BROADCAST_REALMS: 'broadcast_realms',
    BROADCAST_INFO: 'broadcast_info',
    ASSET: {
        REQUEST: 'asset.request',
        RECEIVE: 'asset.receive'
    }
}

export default class GlobalNetwork extends NetworkInterface
{
    constructor(dataHandler)
    {
        super()
        this.dataHandler = dataHandler

        this.networkID = 'global'
        
        this.onPeerJoin = this.onPeerJoin.bind(this)
        this.onPeerLeave = this.onPeerLeave.bind(this)
    }

    async initialise()
    {
        this.network = await this.dataHandler.networkManager.joinNetwork(this.networkID, this.callProtocol, this.onPeerJoin, this.onPeerLeave, { isGlobalNetwork: true })
        this.setProtocolCallback(GLOBAL_PROTOCOLS.BROADCAST_INFO, (data, from) => {
            global.log((data.name || from) + ' has connected via ' + data.env + ' on ' + data.platform)
        })
    }

    onPeerJoin(peerID)
    {
        this.sendTo(GLOBAL_PROTOCOLS.BROADCAST_REALMS, this.dataHandler.getRealmManager().getRealms(), peerID)
        this.sendTo(GLOBAL_PROTOCOLS.BROADCAST_INFO, {
                env: global.isBrowser ? 'Browser' : 'Node',
                version: global.conjureVersion,
                platform: platform.description,
                // name: // todo: add client names (eg for bootstrap nodes etc)
            }, peerID)
    }

    onPeerLeave(peerID)
    {
        global.log(peerID, 'has disconnected.')
    }

    async leave()
    {
        await this.globalNetwork.leave()
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