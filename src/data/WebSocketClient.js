export default class WebSocketClient
{
    constructor(connectCallback, dataCallback)
    {
        this.onConnect = this.onConnect.bind(this)
        this.onDisconnect = this.onDisconnect.bind(this)
        this.onData = this.onData.bind(this)
        this.connectCallback = connectCallback
        this.dataCallback = dataCallback

        this.dataCallbacks = {}

        try {
            this.webSocket = new WebSocket('ws://localhost:9700')

            this.webSocket.onopen = this.onConnect
            this.webSocket.onerror = function(error) { connectCallback(error); }
            this.webSocket.onmessage = this.onData
            this.webSocket.onclose = this.onDisconnect

        } catch(error) {}

        window.addEventListener("beforeunload", (e) => {
            e.preventDefault();
            // e.returnValue = '';
            console.log('Shutting down!')
            this.connectCallback(true)
        });
    }

    onConnect(event)
    {   
        this.connectCallback()
    }

    onDisconnect(event)
    {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
            // this.connectCallback(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`)
        } else {
            console.log('[close] Connection died')
            // this.connectCallback('[close] Connection died')
        }
    }

    onData(event)
    {
        let data = JSON.parse(event.data)
        try{

            if(data.requestTimestamp) // if this is a valid request
            {
                // call the callback function
                this.dataCallbacks[data.requestTimestamp](data)
                
                // remove it from our list
                delete this.dataCallbacks[data.requestTimestamp]
            }
            else // this might be a one way event from
            {
                this.dataCallback(data)
            }
        }
        catch(error)
        {
            console.log(error, event, this.dataCallbacks)
        }
    }
    
    addDataListener(requestTimestamp, callback)
    {
        // right now this creates a memory leak where unfulfilled requests pile up
        // TODO: add interval callback, check if entry exists, then delete and return undefined to reject promise
        this.dataCallbacks[requestTimestamp] = callback
    }

    sendData(data)
    {
        this.webSocket.send(JSON.stringify(data))
    }
}