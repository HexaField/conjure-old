import WebSocket from 'ws'
import { WEBSOCKET_PROTOCOLS } from "./DataHandler"

export default class WebSocketServer
{
    constructor(dataHandler, disconnectCallback, heartbeatCallback)
    {
        this.dataHandler = dataHandler
        this.onConnect = this.onConnect.bind(this)
        this.onDisconnect = this.onDisconnect.bind(this)
        this.onData = this.onData.bind(this)
        this.heartbeatCallback = heartbeatCallback

        this.webSocket = new WebSocket.Server({ port: 9700 })

        this.webSocket.on('connection', (ws) => { this.onConnect(ws); })
        this.webSocket.on('error', (error) => { this.onDisconnect(disconnectCallback, error); })
        this.webSocket.on('close', () => { this.onDisconnect(disconnectCallback, false) })
    }

    onDisconnect(callback, error)
    {
        clearInterval(this.heartbeat);
        callback(error)
    }

    onConnect(ws)
    {
        ws.on('message', this.onData)
        this.connection = ws
        console.log('WebSocketServer: Successfully connected to client!')
        
        ws.isAlive = true;
        
        ws.on('pong', () => {
            ws.isAlive = true;
        });
    
        this.heartbeat = setInterval(() => {
            this.webSocket.clients.forEach((ws) => {
                if (ws.isAlive === false) return ws.close();
            
                ws.isAlive = false;
                ws.ping();
            });
        }, 1000);
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