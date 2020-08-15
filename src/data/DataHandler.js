import WebSocketClient from './WebSocketClient'
import WebSocketServer, { WEB_SOCKET_PROTOCOL } from './WebSocketServer'
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

    async initialise(runAppCallback)
    {
        // await this.loadDataHandler()
        
        // TODO: figure out how to pipe IPFS directly from node to browser, if impossible then add protocols for all ipfs actions (networking etc)
        
        if(global.isBrowser)
        {
            await this.findNode(runAppCallback)
        }
        else
        {
            await this.loadDataHandler()
            this.createWebSocket()
        }
    }

    // Try and connect to the node server
    async findNode(runAppCallback)
    {
        let callback = (async function(error) {
            if(error)
            {
                console.log(error)
                this.runningNode = false
                await this.loadDataHandler()
            }
            runAppCallback()
        })
        this.runningNode = true
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

    // Adds data callback for the client from the server
    // { protocol, requestTimestamp, data }
    addDataListener(requestTimestamp, callback)
    {
        if(this.webSocket)
            this.webSocket.addDataListener(requestTimestamp, callback)
    }

    sendWebsocketData(data)
    {
        this.webSocket.sendData(data)
    }

    getGlobalNetwork() { return this.getNetworkManager().globalNetwork }

    getNetworkManager() { return this.networkManager }

    getProfileManager() { return this.profileManager }

    // creates a promise and waits for 
    async awaitNodeResponse(protocol, data)
    {
        if(!data) data = ''
        return await new Promise((resolve, reject) => {

            // create timestamp that acts as an identifier for the request
            const requestTimestamp = Date.now()
            
            // create callback to listen for node server responses
            this.addDataListener(requestTimestamp, (_returnedData) => { 
                
                _returnedData === undefined 
                    ? reject('DATAHANDLER: WebSocket request timed out')
                    : resolve(_returnedData.data) 
            })

            // send a request to node server
            this.sendWebsocketData({ protocol: protocol, requestTimestamp: requestTimestamp, data: data })
        })
    }

    async loadProfile()
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('loadProfile')
        else 
            return await this.getProfileManager().loadProfile()
    }
    
    async saveProfile(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('saveProfile', data)
        else
            return await this.getProfileManager().saveProfile(data)
    }

    // Runs only on the server - receiving from the client
    // { protocol, requestTimestamp, data }
    async parseWebsocketData(data)
    {
        switch(data.protocol)
        {   
            case 'ping': this.sendWebsocketData({ data: 'pong', requestTimestamp: data.requestTimestamp}); break;
            case 'loadProfile': this.sendWebsocketData({ data: await this.loadProfile(), requestTimestamp: data.requestTimestamp}); break;
            case 'saveProfile': this.sendWebsocketData({ data: await this.saveProfile(data.data), requestTimestamp: data.requestTimestamp}); break;
            default: return;
        }
    }

}