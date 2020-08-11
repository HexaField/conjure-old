import DataHandler from './data/DataHandler'
import Conjure from './conjure/Conjure'

global.isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
global.isDevelopment = process.env.NODE_ENV === 'development'
console.log('Launched ' + (isBrowser ? 'browser' : 'node') + ' on ' + process.env.NODE_ENV + ' network')

async function start()
{
    const dataHandler = new DataHandler()
    await dataHandler.initialise()

    if(global.isBrowser)
    {
        const conjure = new Conjure(dataHandler)
    }
    
}

start()