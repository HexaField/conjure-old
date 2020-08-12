import DataHandler from './data/DataHandler'

global.isBrowser = false
global.isDevelopment = process.env.NODE_ENV === 'development'

async function start()
{
    console.log('Launched node on ' + process.env.NODE_ENV + ' network')
    
    const dataHandler = new DataHandler()
    await dataHandler.initialise()    
}

start()