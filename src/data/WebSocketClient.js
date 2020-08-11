import { WEB_SOCKET_PROTOCOL } from "./WebSocketServer"

export default class WebSocketClient
{
    constructor(connectCallback)
    {
        this.onConnect = this.onConnect.bind(this)
        this.onDisconnect = this.onDisconnect.bind(this)
        this.onData = this.onData.bind(this)
        this.connectCallback = connectCallback

        try {
            
            this.webSocket = new WebSocket('ws://localhost:9700')

            this.webSocket.onopen = this.onConnect
            this.webSocket.onerror = function(error) { connectCallback(error.message); }
            this.webSocket.onmessage = this.onData
            this.webSocket.onclose = this.onDisconnect
            
        } catch(error) {}
    }

    onConnect(event)
    {   
        this.connectCallback()
        this.sendData(WEB_SOCKET_PROTOCOL.CLIENT_CONNECT)
    }

    onDisconnect(event)
    {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
            this.connectCallback(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
        } else {
            console.log('[close] Connection died')
            this.connectCallback('[close] Connection died')
        }
    }

    onData(event)
    {
        if(this.dataCallback)
            this.dataCallback(event.data)
    }
    
    addDataListener(callback)
    {
        this.dataCallback = callback
    }

    sendData(data)
    {
        this.webSocket.send(data)
    }
}