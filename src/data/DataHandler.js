import WebSocketClient from './WebSocketClient'
import WebSocketServer, { WEB_SOCKET_PROTOCOL } from './WebSocketServer'
import IPFS from './IPFS'
import FileStorageBrowser from './FileStorageBrowser'
import FileStorageNode from './FileStorageNode'
import FileStorageLibp2p from './FileStorageLibp2p'
import NetworkManager from './NetworkManager'
import RealmManager from './RealmManager'
import ProfileManager from './ProfileManager'
import { GLOBAL_PROTOCOLS } from './NetworkManager'
import GlobalNetwork from './GlobalNetwork'

export default class DataHandler
{
    constructor()
    {
    }

    async cleanup()
    {
        console.log('\nClosing websockets...')
        this.webSocket.webSocket.close()
        // console.log('Leaving networks...')
        // await this.networkManager.exit()
        // console.log('Closing IPFS...')
        // await this.ipfs.stop()
    }

    async initialise(runAppCallback)
    {        
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
        this.runningNode = false
        let callback = async (error) => {
            if(error)
            {
                console.log('Data Module: Could not find local node', error)
                await this.loadDataHandler()
            }
            else
            {
                console.log('Data Module: Successfully connected to local node!')
                this.networkCallbacks = {}
                this.runningNode = true
            }
            runAppCallback()
        }
        this.receiveWebsocketData = this.receiveWebsocketData.bind(this)
        this.webSocket = new WebSocketClient(callback, this.receiveWebsocketData)
    }

    // Creates a web socket for the browser to communicate with
    createWebSocket()
    {
        this.webSocket = new WebSocketServer(this)
    }

    async waitForIPFSPeers(minPeersCount)
    {
        console.log('Trying to connect to the network...')
        return await new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                console.log('Found', this.ipfsInfo.peersCount, 'peers')
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
        this._peerID = await this.ipfs.id()
        this.peerIDstring = this._peerID.id
        console.log('IPFS ' + (await this.ipfs.version()).version + ' node ready with id ' + this.peerIDstring)
        this.ipfsInfo = {}
        this.ipfsInfo.peersCount = 0;
        this.showStats();

        const minPeersCount = global.isBrowser ? 3 : 0 // refactor this into a config eventually
        await this.waitForIPFSPeers(minPeersCount)
     
        this.localStorage = global.isBrowser ? new FileStorageBrowser() : new FileStorageNode()
        await this.localStorage.initialise()
        // this.files = new FileStorageLibp2p(this.ipfs.libp2p)
        
        this.networkManager = new NetworkManager(this)

        this.globalNetwork = new GlobalNetwork(this)

        this.realmManager = new RealmManager(this)
        await this.realmManager.initialise()

        this.profileManager = new ProfileManager(this)
        await this.profileManager.initialise()

        console.log('Data Module: Successfully loaded data module!')
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

    getFiles() { return this.localStorage }

    getGlobalNetwork() { return this.globalNetwork }

    getNetworkManager() { return this.networkManager }

    getProfileManager() { return this.profileManager }

    getRealmManager() { return this.realmManager }

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

    // technically this could be genericified

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

    async createRealm(data)
    {
        if(this.runningNode)
            return await this.awaitNodeResponse('createRealm', data)
        else 
            return await this.getRealmManager().createRealm(data)
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
            if(this.networkCallbacks[data.network]) return true // we have already joined this network

            this.networkCallbacks[data.network] = {
                onMessage: data.onMessage,
                onPeerJoin: data.onPeerJoin,
                onPeerLeave: data.onPeerLeave,
            }
            return await this.awaitNodeResponse('joinNetwork', { network: data.network })
        }
        else
            return await this.getNetworkManager().joinNetwork(data.network, data.onMessage, data.onPeerJoin, data.onPeerLeave)
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
        console.log('ipfsGet', cid)
        if(this.runningNode)
            return await this.awaitNodeResponse('ipfsGet', cid)
        else
        {
            const chunks = []
            for await (const chunk of this.getIPFS().cat(cid)) {
                chunks.push(chunk)
                console.log(chunk)
            }

            return Buffer.concat(chunks).toString()
        }
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

            case 'createRealm': this.sendWebsocketData({ data: await this.createRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'updateRealm': this.sendWebsocketData({ data: await this.updateRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'getRealm': this.sendWebsocketData({ data: await this.getRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case 'getRealms': this.sendWebsocketData({ data: await this.getRealms(), requestTimestamp: data.requestTimestamp}); break;

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

            default: return;
        }
    }

}