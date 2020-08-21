import DataHandler from './DataHandler'

global.isBrowser = false
global.isDevelopment = process.env.NODE_ENV === 'development'
global.conjureVersion = '0.0.0'

async function start()
{
    console.log('Launched node on ' + process.env.NODE_ENV + ' network')
    
    const dataHandler = new DataHandler()
    await dataHandler.initialise()    
}

start()