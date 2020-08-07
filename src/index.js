import DataHandler from './Data/DataHandler'

global.isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
global.isDevelopment = process.env.NODE_ENV === 'development'
console.log('Launched ' + (isBrowser ? 'browser' : 'node') + ' on ' + process.env.NODE_ENV + ' network')

async function start()
{
    // initiate data layer
    const dataHandler = new DataHandler()
    await dataHandler.initialise()

    if(global.isBrowser)
    {
        // initiate conjure
        console.log('Launching Conjure...')
    }
}

start()