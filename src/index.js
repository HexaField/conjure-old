import DataHandler from './data/DataHandler'
import App from './conjure/App'

global.isBrowser = true
global.isDevelopment = process.env.NODE_ENV === 'development'

async function start()
{
    console.log('Launched browser on ' + process.env.NODE_ENV + ' network')

    const dataHandler = new DataHandler()
    await dataHandler.initialise()
    const conjure = new App(dataHandler)
}

start()