export default class WebSocketClient
{
    constructor(callback)
    {
        this.onConnect = this.onConnect.bind(this)
        this.onDisconnect = this.onDisconnect.bind(this)
        this.onData = this.onData.bind(this)
        this.callback = callback

        this.webSocket = new WebSocket('ws://localhost:9700')

        this.webSocket.onopen = this.onConnect
        this.webSocket.onerror = function(error) { callback(error.message); }
        this.webSocket.onmessage = this.onData
        this.webSocket.onclose = this.onDisconnect
    }

    onConnect(event)
    {   
        this.callback()
        this.sendData('Hello, node!')
    }

    onDisconnect(event)
    {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
            this.callback(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
        } else {
            console.log('[close] Connection died')
            this.callback('[close] Connection died')
        }
    }

    onData(event)
    {
        console.log('got data from node:', event.data)
    }

    sendData(data)
    {
        this.webSocket.send(data)
    }
}