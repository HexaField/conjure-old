import WebSocketClient from './WebSocketClient'
import WebSocketServer from './WebSocketServer'
import IPFS from './IPFS'
import FileStorageBrowser from './FileStorageBrowser'
import FileStorageNode from './FileStorageNode'
import FileStorageDHT from './FileStorageDHT'
import NetworkManager from './NetworkManager'
import RealmManager from './RealmManager'
import ProfileManager from './ProfileManager'
import { GLOBAL_PROTOCOLS } from './NetworkManager'

export default class DataHandler
{
    constructor()
    {
    }

    async initialise()
    {
        await this.loadDataHandler()
        
        // TODO: figure out how to pipe IPFS directly from node to browser, if impossible then add protocols for all ipfs actions (networking etc)
        
        // if(global.isBrowser)
        // {
        //     await this.findNode()
        // }
        // else
        // {
        //     await this.loadDataHandler()
        //     this.createWebSocket()
        // }
    }

    // Try and connect to the node server
    async findNode()
    {
        let callback = ((error) => {
            if(error)
            {
                console.log(error)
                this.loadDataHandler()
            }
        })
        this.webSocket = new WebSocketClient(callback)
    }

    // Creates a web socket for the browser to communicate with
    createWebSocket()
    {
        this.webSocket = new WebSocketServer(this)
    }

    // Load all the data things
    async loadDataHandler()
    {
        this.ipfs = await IPFS.loadIPFS()
        this.peerID = await this.ipfs.id()
        console.log('IPFS ' + (await this.ipfs.version()).version + ' node ready with id ' + this.peerID.id)
        this.ipfsInfo = {}
        this.ipfsInfo.peersCount = 0;
        this.showStats();
     
        this.files = global.isBrowser ? new FileStorageBrowser() : new FileStorageNode()
        // this.files = new FileStorageDHT() // untested & not fully implemented
        await this.files.initialise()
        
        this.networkManager = new NetworkManager(this, this.ipfs, this.peerID)
        await this.networkManager.initialise()

        this.realmManager = new RealmManager(this.files, this.networkManager)
        await this.realmManager.initialise()

        this.profileManager = new ProfileManager(this.files, this.networkManager)
        await this.profileManager.initialise()
    }

    showStats()
    {
        setInterval(async () => {
            try {
                const peers = await this.ipfs.swarm.peers()
                this.ipfsInfo.peersCount = peers.length
            } catch (err) {
                console.log('An error occurred trying to check our peers:', err)
            }
        }, 1000)
    }

    parseNetworkData(data)
    {
        switch(data.protocol)
        {
            case GLOBAL_PROTOCOLS.BROADCAST_REALMS:
                this.realmManager.addRecentRealms(data.content, true)
            break;

            default:break;
        }
    }

    addDataListener(callback)
    {
        if(this.webSocket)
            this.webSocket.addDataListener(callback)
    }

    parseWebsocketData(data)
    {
        // convert back to function calls
    }

    sendWebsocketData(data)
    {
        this.webSocket.sendData(data)
    }

    getIPFS() { return this.ipfs }

    getGlobalNetwork() { return this.getNetworkManager().globalNetwork }

    getNetworkManager() { return this.networkManager }

    getProfileManager() { return this.profileManager }
}