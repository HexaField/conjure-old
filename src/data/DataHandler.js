import WebSocketClient from './WebSocketClient'
import WebSocketServer from './WebSocketServer'
import IPFS from './IPFS'
import FileStorageBrowser from './FileStorageBrowser'
import FileStorageNode from './FileStorageNode'
// import FileStorageDHT from './FileStorageDHT'
import NetworkManager from './NetworkManager'
import RealmHandler from './RealmHandler'
import AssetHandler from './AssetHandler'
import ProfileHandler from './ProfileHandler'
import GlobalNetwork from './GlobalNetwork'
import { getParams } from './util/urldecoder'  
// import OrbitDB from 'orbit-db'
import os from 'os'

export default class DataHandler
{
    constructor()
    {
        // this is temporary and bad since webrtc seems to have a tantrum for no clear reason
        process.on('unhandledRejection', (reason, promise) => {
            console.log('Unhandled Rejection at:', reason.stack || reason)
        })
        global.log = (...msg) => {
            let now = new Date()
            console.log(now.toTimeString().substring(0, 8) + ":", ...msg)
            // global.log(now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + ": ", ...msg)
        }
    }

    async cleanupClient(browser)
    {
        if(browser) // clean up browser client
        {
            global.log('Leaving networks...')
            await this.networkManager.exit()
            // this.networkStorage.exit()
            if(this.webSocket)
            {
                global.log('Closing connection to server...')
                this.webSocket.webSocket.terminate()
            }
        }
        else // clean up node server
        {
            global.log('Leaving client networks...')
            await this.networkManager.leaveAllClientNetworks()    
            this.networkCallbacks = {}
        }
    }

    // async cleanupServer()
    // {
    //     // global.log('Closing websocket server...')
    //     // this.webSocket.webSocket.close()
    // }

    async initialise(runAppCallback)
    {
        this.runningClient = false
        if(global.isBrowser)
        {
            await this.initialiseClient(runAppCallback)
        }
        else
        {
            await this.loadDataHandler()
            this.initialiseServer()
        }
    }

    // Try and connect to the node server
    async initialiseClient(runAppCallback)
    {
        this.runningNode = false
        let callback = async (error) => {
            if(error)
            {
                if(this.runningClient) 
                {
                    await this.cleanupClient(true)
                    this.runningClient = false
                    return
                }
                global.log('Data Module: Could not find local node', error)
                const params = getParams(window.location.href)
                global.isDevelopment = params.dev === 'true' || params.dev === true
                global.log('Launching browser on ' + (global.isDevelopment ? 'development' : 'production' ) + ' network')   
                await this.loadDataHandler()
                this.runningClient = true
            }
            else
            {
                global.log('Data Module: Successfully connected to local node!')
                this.networkCallbacks = {}
                this.runningNode = true
            }
            runAppCallback()
        }
        this.receiveWebsocketData = this.receiveWebsocketData.bind(this)
        this.webSocket = new WebSocketClient(callback, this.receiveWebsocketData)
    }

    // Creates a web socket for the browser to communicate with
    initialiseServer()
    {
        let callback = async (error) => {
            global.log('Lost connection with client' + (error ? ' with error ' + error : ''))
            await this.cleanupClient()
        }
        this.webSocket = new WebSocketServer(this, callback)
    }

    async waitForIPFSPeers(minPeersCount)
    {
        global.log('Connecting to the network...')
        return await new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                // global.log('Found', this.ipfsInfo.peersCount, 'peers')
                if(this.ipfsInfo.peersCount >= minPeersCount) 
                {
                    resolve(true)
                    clearInterval(interval);
                }
            }, 1000)
        })
    }

    // Load all the data things
    async loadDataHandler()
    {
        this.ipfs = await IPFS.loadIPFS()
        this.peerIDstring = await(await this.ipfs.id()).id
        global.log('Libp2p node ready with id ' + this.peerIDstring)
        this.ipfsInfo = {}
        this.ipfsInfo.peersCount = 0;
        this.showStats();

        // this.orbitdb = await OrbitDB.createInstance(this.ipfs, { directory: os.homedir() + '/.orbitdb'})

        const minPeersCount = 0//global.isBrowser ? 1 : 0 // refactor this into a config eventually
        await this.waitForIPFSPeers(minPeersCount)
     
        this.localStorage = global.isBrowser ? new FileStorageBrowser() : new FileStorageNode()
        await this.localStorage.initialise()
        
        this.networkManager = new NetworkManager(this)

        this.globalNetwork = new GlobalNetwork(this)
        await this.globalNetwork.initialise()

        // this.networkStorage = new FileStorageDHT()
        // await this.networkStorage.initialise(this.orbitdb)

        this.realmHandler = new RealmHandler(this)
        await this.realmHandler.initialise()

        this.profileHandler = new ProfileHandler(this)
        await this.profileHandler.initialise()

        this.assetHandler = new AssetHandler(this)
        await this.assetHandler.initialise()

        global.log('Data Module: Successfully loaded data module!')
    }

    showStats()
    {
        setInterval(async () => {
            try {
                const peers = await this.ipfs.swarm.peers()
                this.ipfsInfo.peersCount = peers.length
            } catch (err) {
                global.log('An error occurred trying to check our peers:', err)
            }
        }, 1000)
    }

    // Adds data callback for the client from the server
    // { protocol, requestTimestamp, data }
    addDataListener(requestTimestamp, callback)
    {
        this.webSocket.addDataListener(requestTimestamp, callback)
    }

    sendWebsocketData(data)
    {
        this.webSocket.sendData(data)
    }

    getLocalFiles() { return this.localStorage }

    getNetworkFiles() { return this.networkStorage }

    getGlobalNetwork() { return this.globalNetwork }

    getNetworkManager() { return this.networkManager }

    getProfileManager() { return this.profileHandler }

    getRealmManager() { return this.realmHandler }

    getAssetManager() { return this.assetHandler }

    getIPFS() { return this.ipfs }

    getPeerID() { return this.peerIDstring }

    // creates a promise and waits for 
    async awaitNodeResponse(protocol, data)
    {
        if(!data) data = ''
        return await new Promise((resolve, reject) => {

            // create timestamp that acts as an identifier for the request
            const requestTimestamp = Date.now() + '-' + Math.round(Math.random() * 1000)
            
            // create callback to listen for node server responses
            this.addDataListener(requestTimestamp, (_returnedData) => { 
                
                _returnedData === undefined 
                    ? reject('Data Module: WebSocket request timed out')
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

    async loadAsset(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('loadAsset')
        else 
            return await this.getAssetManager().loadAsset(data)
    }
    
    async requestAsset(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('requestAsset')
        else 
            return await this.getAssetManager().requestAsset(data)
    }
    
    async saveAsset(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('saveAsset', data)
        else
            return await this.getAssetManager().saveAsset(data)
    }

    async pinRealm(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('pinRealm', data)
        else 
            return await this.getRealmManager().pinRealm(data.data, data.pin)
    }
    
    async updateRealm(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('updateRealm', data)
        else
            return await this.getRealmManager().updateRealm(data)
    }
    
    async getRealm(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('getRealm', data)
        else
            return await this.getRealmManager().getRealm(data)
    }

    async getRealms()
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('getRealms')
        else
            return await this.getRealmManager().getRealms()
    }

    async joinNetwork(data)
    {
        if(this.runningNode)
        {
            // if(this.networkCallbacks[data.network]) return true // we have already joined this network

            this.networkCallbacks[data.network] = {
                onMessage: data.onMessage,
                onPeerJoin: data.onPeerJoin,
                onPeerLeave: data.onPeerLeave,
            }
            return await this.awaitNodeResponse('joinNetwork', { network: data.network })
        }
        else
            return Boolean(await this.getNetworkManager().joinNetwork(data.network, data.onMessage, data.onPeerJoin, data.onPeerLeave))
    }

    async sendDataNetwork(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('sendDataNetwork', data)
        else
            return await this.getNetworkManager().sendData(data.network, data.protocol, data.content)
    }

    async sendToNetwork(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('sendToNetwork', data)
        else
            return await this.getNetworkManager().sendTo(data.network, data.protocol, data.content, data.peerID)
    }

    async leaveNetwork(data)
    {
        if(this.runningNode)
        {
            if(await this.awaitNodeResponse('leaveNetwork', data))
            {
                if(this.networkCallbacks[data.network]) 
                    delete this.networkCallbacks[data.network]
                return true
            }
            return false
        }
        else
            return await this.getNetworkManager().leaveNetwork(data.network)
    }

    async ipfsGet(cid)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('ipfsGet', cid)
        else
        {
            const chunks = []
            for await (const chunk of this.getIPFS().cat(cid)) {
                chunks.push(chunk)
                global.log(chunk)
            }

            return Buffer.concat(chunks).toString()
        }
    }

    async ipfsAdd(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('ipfsAdd', data)
        else
        {
            return await this.getIPFS().add(data)
        }
    }

    async createObject(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('createObject', data)
        else
            return await this.getRealmManager().createObject(data.realmID, data.uuid, data.data)
    }

    async updateObject(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('updateObject', data)
        else
            return await this.getRealmManager().updateObject(data.realmID, data.uuid, data.data)
    }

    async destroyObject(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('destroyObject', data)
        else
            return await this.getRealmManager().destroyObject(data.realmID, data.uuid)
    }

    async getObjects(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('getObjects', data)
        else
            return await this.getRealmManager().getObjects(data.realmID)
    }

    // ===  only on the client - receiving from the server === //
    
    // { data, network }

    receiveWebsocketData(data)
    {
        if(data.network && this.networkCallbacks[data.network] && this.networkCallbacks[data.network][data.event])
            this.networkCallbacks[data.network][data.event](data.data)
    }

    // ===  only on the server - receiving from the client === //

    // { protocol, requestTimestamp, data }
    
    async parseWebsocketData(data)
    {
        switch(data.protocol)
        {   
            case 'ping': this.sendWebsocketData({ data: 'pong', requestTimestamp: data.requestTimestamp}); break;

            case 'loadProfile': this.sendWebsocketData({ data: await this.loadProfile(), requestTimestamp: data.requestTimestamp}); break;
            case 'saveProfile': this.sendWebsocketData({ data: await this.saveProfile(data.data), requestTimestamp: data.requestTimestamp}); break;

            case 'loadAsset': this.sendWebsocketData({ data: await this.loadAsset(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'saveAsset': this.sendWebsocketData({ data: await this.saveAsset(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'requestAsset': this.sendWebsocketData({ data: await this.requestAsset(data.data), requestTimestamp: data.requestTimestamp}); break;

            case 'pinRealm': this.sendWebsocketData({ data: await this.pinRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'updateRealm': this.sendWebsocketData({ data: await this.updateRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'getRealm': this.sendWebsocketData({ data: await this.getRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'getRealms': this.sendWebsocketData({ data: await this.getRealms(), requestTimestamp: data.requestTimestamp}); break;
            
            case 'createObject': this.sendWebsocketData({ data: await this.createObject(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'updateObject': this.sendWebsocketData({ data: await this.updateObject(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'destroyObject': this.sendWebsocketData({ data: await this.destroyObject(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'getObjects': this.sendWebsocketData({ data: await this.getObjects(data.data), requestTimestamp: data.requestTimestamp}); break;

            case 'joinNetwork': this.sendWebsocketData({ data: await this.joinNetwork({
                network: data.data.network,
                onMessage: (_data) => this.sendWebsocketData({ data: _data, network: data.data.network, event: 'onMessage' }),
                onPeerJoin: (_data) => this.sendWebsocketData({ data: _data, network: data.data.network, event: 'onPeerJoin' }),
                onPeerLeave: (_data) => this.sendWebsocketData({ data: _data, network: data.data.network, event: 'onPeerLeave' }),
            }), requestTimestamp: data.requestTimestamp}); break;
            case 'sendDataNetwork': this.sendWebsocketData({ data: await this.sendDataNetwork(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'sendToNetwork': this.sendWebsocketData({ data: await this.sendToNetwork(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'leaveNetwork': this.sendWebsocketData({ data: await this.leaveNetwork(data.data), requestTimestamp: data.requestTimestamp}); break;
            
            case 'ipfsGet': this.sendWebsocketData({ data: await this.ipfsGet(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'ipfsAdd': this.sendWebsocketData({ data: await this.ipfsAdd(data.data), requestTimestamp: data.requestTimestamp}); break;

            default: global.log('ERROR: DataHandler: Received unknown protocol: ' + String(data.protocol)); return;
        }
    }

}