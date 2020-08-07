import WebSocketClient from './WebSocketClient'
import WebSocketServer from './WebSocketServer'
import IPFS from './IPFS'

export default class DataHandler
{
    constructor()
    {
        this.hasIPFS = true
    }

    async initialise()
    {
        if(global.isBrowser)
        {
            await this.findNode()
        }
        else
        {
            this.createWebSocket()
            await this.loadDataHandler()
        }
    }

    // Try and connect to the node server
    async findNode()
    {
        this.webSocketClient = new WebSocketClient()
        // send socket
    }

    // Creates a web socket for the browser to communicate with
    createWebSocket()
    {
        this.webSocketServer = new WebSocketServer()
    }

    // Load all the data things
    async loadDataHandler()
    {
        if(isBrowser)
        {
            // try and connect to local node
            // if it fails, load IPFS

        }
        else
        {
                
        }

        // === load IPFS === //
        if(this.hasIPFS)
        {
            this.ipfs = await IPFS.loadIPFS()        
        }

        // === connect to conjure network === //

        // const network = require('./network')
        // network.connect()

        // === load local database === //

        // browser: IndexedDB (simple-fs)
        // node: fs

        // ===  === //
    }
}