import WebSocketClient from './WebSocketClient'
import WebSocketServer from './WebSocketServer'
import IPFS from './IPFS'
import NetworkManager from './NetworkManager'
import GlobalNetwork from './GlobalNetwork'
import RealmHandler from './RealmHandler'
import ProfileHandler from './ProfileHandler'
import AssetHandler from './AssetHandler'


// import FileStorageDHT from './FileStorageDHT'
// import OrbitDB from 'orbit-db'

export default class DataHandler
{
    constructor()
    {
        // this is temporary and bad since webrtc seems to have a tantrum for no clear reason
        // process.on('unhandledRejection', (reason, promise) => {
        //     console.log('Unhandled Rejection at:', reason.stack || reason)
        // })
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
            this.callbacks = {}
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
        this.addProtocolFunctions()
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
                await this.loadDataHandler()
                this.runningClient = true
            }
            else
            {
                global.log('Data Module: Successfully connected to local node!')
                this.callbacks = {}
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
     
        this.localStorage = new (await (global.isBrowser ? (await import('./FileStorageBrowser')) : (await import('./FileStorageNode'))).default)()
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

    async receiveRequest(data, callbackFunction) 
    {
        // console.log(data)
        if(data.protocol && this.protocolFunctions[data.protocol] && callbackFunction)
            callbackFunction({ data: await this.protocolFunctions[data.protocol](data.data), requestTimestamp: data.requestTimestamp })
        else
            console.warn('ERROR: Unrecognizable server request: ', data)
    }

    addProtocolFunctions()
    {
        this.protocolFunctions = {
            [SERVER_PROTOCOLS.LOAD_PROFILE]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.LOAD_PROFILE)
                else 
                    return await this.getProfileManager().loadProfile()
            },
            [SERVER_PROTOCOLS.SAVE_PROFILE]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.SAVE_PROFILE, data)
                else
                    return await this.getProfileManager().saveProfile(data)
            },
            [SERVER_PROTOCOLS.LOAD_ASSET]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.LOAD_ASSET)
                else 
                    return await this.getAssetManager().loadAsset(data)
            },
            [SERVER_PROTOCOLS.REQUEST_ASSET]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.REQUEST_ASSET)
                else 
                    return await this.getAssetManager().requestAsset(data)
            },
            [SERVER_PROTOCOLS.SAVE_ASSET]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.SAVE_ASSET, data)
                else
                    return await this.getAssetManager().saveAsset(data)
            },
            [SERVER_PROTOCOLS.PIN_REALM]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.PIN_REALM, data)
                else 
                    return await this.getRealmManager().pinRealm(data.data, data.pin)
            },
            [SERVER_PROTOCOLS.UPDATE_REALM]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.UPDATE_REALM, data)
                else
                    return await this.getRealmManager().updateRealm(data)
            },
            [SERVER_PROTOCOLS.GET_REALM]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.GET_REALM, data)
                else
                    return await this.getRealmManager().getRealm(data)
            },
            [SERVER_PROTOCOLS.GET_REALMS]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.GET_REALMS)
                else
                    return await this.getRealmManager().getRealms()
            },
            [SERVER_PROTOCOLS.NETWORK_JOIN]: async (data) => {
                if(this.runningNode)
                {
                    // if(this.callbacks['network_' + data.network]) return true // we have already joined this network

                    this.callbacks['network_' + data.network] = {
                        onMessage: data.onMessage,
                        onPeerJoin: data.onPeerJoin,
                        onPeerLeave: data.onPeerLeave,
                    }
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.NETWORK_JOIN, { network: data.network })
                }
                else
                    return Boolean(await this.getNetworkManager().joinNetwork(data.network, data.onMessage, data.onPeerJoin, data.onPeerLeave))
            },
            [SERVER_PROTOCOLS.NETWORK_SEND_DATA]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.NETWORK_SEND_DATA, data)
                else
                    return await this.getNetworkManager().sendData(data.network, data.protocol, data.content)
            },
            [SERVER_PROTOCOLS.NETWORK_SEND_TO]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.NETWORK_SEND_TO, data)
                else
                    return await this.getNetworkManager().sendTo(data.network, data.protocol, data.content, data.peerID)
            },
            [SERVER_PROTOCOLS.NETWORK_LEAVE]: async (data) => {
                if(this.runningNode)
                {
                    if(await this.awaitNodeResponse(SERVER_PROTOCOLS.NETWORK_LEAVE, data))
                    {
                        if(this.callbacks['network_' + data.network]) 
                            delete this.callbacks['network_' + data.network]
                        return true
                    }
                    return false
                }
                else
                    return await this.getNetworkManager().leaveNetwork(data.network)
            },
            [SERVER_PROTOCOLS.IPFS_GET]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.IPFS_GET, cid)
                else
                {
                    const chunks = []
                    for await (const chunk of this.getIPFS().cat(cid)) {
                        chunks.push(chunk)
                        global.log(chunk)
                    }

                    return Buffer.concat(chunks).toString()
                }
            },
            [SERVER_PROTOCOLS.IPFS_ADD]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.IPFS_ADD, data)
                else
                {
                    return await this.getIPFS().add(data)
                }
            },
            [SERVER_PROTOCOLS.CREATE_OBJECT]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.CREATE_OBJECT, data)
                else
                    return await this.getRealmManager().createObject(data.realmID, data.uuid, data.data)
            },
            [SERVER_PROTOCOLS.UPDATE_OBJECT]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.UPDATE_OBJECT, data)
                else
                    return await this.getRealmManager().updateObject(data.realmID, data.uuid, data.data)
            },
            [SERVER_PROTOCOLS.DESTROY_OBJECT]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.DESTROY_OBJECT, data)
                else
                    return await this.getRealmManager().destroyObject(data.realmID, data.uuid)
            },
            [SERVER_PROTOCOLS.GET_OBJECTS]: async (data) => {
                if(this.runningNode)
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.GET_OBJECTS, data)
                else
                    return await this.getRealmManager().getObjects(data.realmID)
            },
            [SERVER_PROTOCOLS.REALM_SUBSCRIBE]: async (data) => {
                if(this.runningNode)
                {
                    this.callbacks['realm_' + data.realmID] = {
                        onEntryAddition: data.onEntryAddition,
                        onEntryRemoval: data.onEntryRemoval,
                    }
                    return await this.awaitNodeResponse(SERVER_PROTOCOLS.REALM_SUBSCRIBE, { realmID: data.realmID })
                }
                else
                    return await this.getRealmManager().subscribe(data.realmID, data.onEntryAddition, data.onEntryRemoval)
            },
            [SERVER_PROTOCOLS.REALM_UNSUBSCRIBE]: async (data) => {
                if(this.runningNode)
                {
                    if(await this.awaitNodeResponse(SERVER_PROTOCOLS.REALM_UNSUBSCRIBE, data))
                    {
                        if(this.callbacks['realm_' + data.realmID]) 
                        delete this.callbacks['realm_' + data.realmID]
                        return true
                    }
                    return false
                }
                else
                    return await this.getRealmManager().unsubscribe(data.realmID)
            }
        }
    }

    // ===  only on the client - receiving from the server === //
    
    // { data, callback, event }

    receiveWebsocketData(data)
    {
        if(data.callback && this.callbacks[data.callback] && this.callbacks[data.callback][data.event])
            this.callbacks[data.callback][data.event](data.data)
    }

    // ===  only on the server - receiving from the client === //

    // { protocol, requestTimestamp, data }

    async parseWebsocketData(data)
    {
        switch(data.protocol)
        {   
            case SERVER_PROTOCOLS.PING: this.sendWebsocketData({ data: 'pong', requestTimestamp: data.requestTimestamp}); break;

            case SERVER_PROTOCOLS.LOAD_PROFILE: this.sendWebsocketData({ data: await this.loadProfile(), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.SAVE_PROFILE: this.sendWebsocketData({ data: await this.saveProfile(data.data), requestTimestamp: data.requestTimestamp}); break;

            case SERVER_PROTOCOLS.LOAD_ASSET: this.sendWebsocketData({ data: await this.loadAsset(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.SAVE_ASSET: this.sendWebsocketData({ data: await this.saveAsset(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.REQUEST_ASSET: this.sendWebsocketData({ data: await this.requestAsset(data.data), requestTimestamp: data.requestTimestamp}); break;

            case SERVER_PROTOCOLS.PIN_REALM: this.sendWebsocketData({ data: await this.pinRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.UPDATE_REALM: this.sendWebsocketData({ data: await this.updateRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.GET_REALM: this.sendWebsocketData({ data: await this.getRealm(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.GET_REALMS: this.sendWebsocketData({ data: await this.getRealms(), requestTimestamp: data.requestTimestamp}); break;
            
            case SERVER_PROTOCOLS.CREATE_OBJECT: this.sendWebsocketData({ data: await this.createObject(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.UPDATE_OBJECT: this.sendWebsocketData({ data: await this.updateObject(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.DESTROY_OBJECT: this.sendWebsocketData({ data: await this.destroyObject(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.GET_OBJECTS: this.sendWebsocketData({ data: await this.getObjects(data.data), requestTimestamp: data.requestTimestamp}); break;

            case SERVER_PROTOCOLS.NETWORK_JOIN: this.sendWebsocketData({ data: await this.joinNetwork({
                network: data.data.network,
                onMessage: (_data) => this.sendWebsocketData({ data: _data, callback: data.data.network, event: 'onMessage' }),
                onPeerJoin: (_data) => this.sendWebsocketData({ data: _data, callback: data.data.network, event: 'onPeerJoin' }),
                onPeerLeave: (_data) => this.sendWebsocketData({ data: _data, callback: data.data.network, event: 'onPeerLeave' }),
            }), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.NETWORK_SEND_DATA: this.sendWebsocketData({ data: await this.sendDataNetwork(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.NETWORK_SEND_TO: this.sendWebsocketData({ data: await this.sendToNetwork(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.NETWORK_LEAVE: this.sendWebsocketData({ data: await this.leaveNetwork(data.data), requestTimestamp: data.requestTimestamp}); break;
            
            case SERVER_PROTOCOLS.IPFS_GET: this.sendWebsocketData({ data: await this.ipfsGet(data.data), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.IPFS_ADD: this.sendWebsocketData({ data: await this.ipfsAdd(data.data), requestTimestamp: data.requestTimestamp}); break;
            
            case SERVER_PROTOCOLS.REALM_SUBSCRIBE: this.sendWebsocketData({ data: await this.realmSubscribe({
                realmID: data.data.realmID,
                onEntryAddition: (_data) => this.sendWebsocketData({ data: _data, callback: data.data.realmID, event: 'onEntryAddition' }),
                onEntryRemoval: (_data) => this.sendWebsocketData({ data: _data, callback: data.data.realmID, event: 'onEntryRemoval' }),
            }), requestTimestamp: data.requestTimestamp}); break;
            case SERVER_PROTOCOLS.REALM_UNSUBSCRIBE: this.sendWebsocketData({ data: await this.realmUnsubscribe(data.data), requestTimestamp: data.requestTimestamp}); break;

            default: global.log('ERROR: DataHandler: Received unknown protocol: ' + String(data.protocol)); return;
        }
    }

}

export const SERVER_PROTOCOLS = {
    PING: 'ping',
    LOAD_PROFILE: 'loadProfile',
    SAVE_PROFILE: 'saveProfile',

    LOAD_ASSET:   'loadAsset',
    SAVE_ASSET:   'saveAsset',
    REQUEST_ASSET: 'requestAsset',

    PIN_REALM: 'pinRealm',
    UPDATE_REALM: 'updateRealm',
    GET_REALM: 'getRealm',
    GET_REALMS: 'getRealms',

    CREATE_OBJECT: 'createObject',
    UPDATE_OBJECT: 'updateObject',
    DESTROY_OBJECT: 'destroyObject',
    GET_OBJECTS: 'getObjects',

    NETWORK_JOIN: 'joinNetwork',
    NETWORK_SEND_DATA: 'sendDataNetwork',
    NETWORK_SEND_TO: 'sendToNetwork',
    NETWORK_LEAVE: 'networkLeave',

    IPFS_GET: 'ipfsGet',
    IPFS_ADD: 'ipfsAdd',

    REALM_SUBSCRIBE: 'realmSubscribe',
    REALM_UNSUBSCRIBE: 'realmUnsubscribe'
}