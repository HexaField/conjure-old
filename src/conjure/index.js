import DataHandler from '../data/DataHandler'

global.isBrowser = true
global.isDevelopment = process.env.NODE_ENV === 'development'
global.conjureVersion = '0.0.0'

async function start()
{
    console.log('Launched browser on ' + process.env.NODE_ENV + ' network')

    const dataHandler = new DataHandler()
    
    const App = require('./App').App
    const conjure = new App(dataHandler)

    await dataHandler.initialise(conjure.start)
}

start()