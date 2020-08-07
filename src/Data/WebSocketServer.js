import WebSocket from 'ws'

export default class WebSocketServer
{
    constructor()
    {
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
        this.sendData('Hello, browser!')
    }

    onDisconnect()
    {
        this.connection = undefined
    }

    onData(data)
    {
        console.log('got data from browser:', data)
    }

    sendData(data)
    {
        if(this.connection)
            this.connection.send(data)
    }
}