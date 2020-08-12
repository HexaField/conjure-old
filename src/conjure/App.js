import { WEB_SOCKET_PROTOCOL } from "../data/WebSocketServer"
import Conjure from "./Conjure"

export default class App
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
        this.conjure = new Conjure()
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