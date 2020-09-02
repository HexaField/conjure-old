import DataHandler from '../data/DataHandler'

global.isBrowser = true
global.conjureVersion = '0.0.0'

async function start()
{
    const dataHandler = new DataHandler()
    
    const App = require('./App').App
    const conjure = new App(dataHandler)

    await dataHandler.initialise(conjure.start)
}

start()