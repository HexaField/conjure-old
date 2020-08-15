export class App
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.start = this.start.bind(this)
    }

    start()
    {
        console.log('Starting conjure...')
        const { startConjure } = require('./Conjure')
        startConjure(this.dataHandler)
    }
}