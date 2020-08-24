import WebSocket from 'ws'
import { WEBSOCKET_PROTOCOLS } from "./DataHandler"

export default class WebSocketServer
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.onConnect = this.onConnect.bind(this)
        this.onDisconnect = this.onDisconnect.bind(this)
        this.onData = this.onData.bind(this)

        this.webSocket = new WebSocket.Server({ port: 9700 })

        this.webSocket.on('connection', (ws) => { this.onConnect(ws); })
        this.webSocket.on('error', (error) => { console.log(error); })
        this.webSocket.on('close', () => { this.onDisconnect() })
    }

    onConnect(ws)
    {
        ws.on('message', this.onData)
        this.connection = ws
        console.log('WebSocketServer: Successfully connected to client!')
    }

    onDisconnect()
    {
        this.connection = undefined
    }

    onData(data)
    {   
        this.dataHandler.parseWebsocketData(JSON.parse(data))
    }

    sendData(data)
    {
        if(this.connection)
            this.connection.send(JSON.stringify(data))
    }
}