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
        this.disconnectCallback = disconnectCallback
        this.heartbeatCallback = heartbeatCallback

        this.webSocket = new WebSocket.Server({ port: 9700 })

        this.webSocket.on('connection', (ws) => { this.onConnect(ws); })
        this.webSocket.on('error', (error) => { this.onDisconnect(error); })
        this.webSocket.on('close', () => { this.onDisconnect(false) })
    }

    onDisconnect(error)
    {
        clearInterval(this.heartbeat);
        this.disconnectCallback(error)
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
            if(!this.webSocket.clients.has(ws))
                this.onDisconnect()
            this.webSocket.clients.forEach((ws) => {
                if (ws.isAlive === false) 
                {
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping('ping!');
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