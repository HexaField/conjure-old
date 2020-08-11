import { WEB_SOCKET_PROTOCOL } from "../data/WebSocketServer"

export default class Conjure
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.recieveWebsocketData = this.recieveWebsocketData.bind(this)
        this.dataHandler.addDataListener(this.recieveWebsocketData)
    }

    start()
    {
        console.log('Starting conjure...')
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