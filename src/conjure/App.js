import { WEB_SOCKET_PROTOCOL } from "../data/WebSocketServer"

export class App
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.recieveWebsocketData = this.recieveWebsocketData.bind(this)
        this.dataHandler.addDataListener(this.recieveWebsocketData)
        this.start()
    }

    start()
    {
        console.log('Starting conjure...')
        const { startConjure } = require('./Conjure')
        startConjure(this.dataHandler)
    }

    recieveWebsocketData(data)
    {
        console.log('recieveWebsocketData', data)
        switch(data.protocol)
        {
            case WEB_SOCKET_PROTOCOL.SERVER_CONNECT: this.start()
        }
    }
}