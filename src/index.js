const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
const isProduction = process.env.NODE_ENV === 'development'
console.log('Launched ' + (isBrowser ? 'browser' : 'node') + ' on ' + process.env.NODE_ENV + ' network')

async function start()
{
    // initiate data layer
    const dataHandler = require('./Data')
    await dataHandler.loadDataHandler(isProduction)

    if(isBrowser)
    {
        // initiate conjure
    }
}

start()