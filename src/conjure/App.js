import { WEBSOCKET_PROTOCOLS } from "../data/DataHandler"

export class App
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.start = this.start.bind(this)
    }

    start()
    {
        let requestTimestamp = Date.now()
        this.dataHandler.addDataListener(requestTimestamp, () => {    
            console.log('Starting conjure...')
            const { startConjure } = require('./Conjure')
            startConjure(this.dataHandler)
        })
        this.dataHandler.sendWebsocketData({ protocol: 'ping', requestTimestamp: requestTimestamp })
    }
}