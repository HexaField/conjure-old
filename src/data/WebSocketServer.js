import WebSocket from 'ws'

export const WEB_SOCKET_PROTOCOL = {
    SERVER_CONNECT: 'server_connect',
    CLIENT_CONNECT: 'client_connect',
}

export default class WebSocketServer
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.onConnect = this.onConnect.bind(this)
        this.onDisconnect = this.onDisconnect.bind(this)
        this.onData = this.onData.bind(this)

        this.webSocketServer = new WebSocket.Server({ port: 9700 })

        this.webSocketServer.on('connection', (ws) => { this.onConnect(ws); })
        this.webSocketServer.on('error', (error) => { console.log(error); })
        this.webSocketServer.on('close', () => { this.onDisconnect() })
    }

    onConnect(ws)
    {
        ws.on('message', this.onData)
        this.connection = ws
        this.sendData(WEB_SOCKET_PROTOCOL.SERVER_CONNECT)
    }

    onDisconnect()
    {
        this.connection = undefined
    }

    onData(data)
    {
        this.dataHandler.parseWebsocketData(data)
    }

    sendData(data)
    {
        if(this.connection)
            this.connection.send(data)
    }
}