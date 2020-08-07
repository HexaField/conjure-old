const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'
const isDevelopment = process.env.NODE_ENV === 'development'
console.log('Launched ' + (isBrowser ? 'browser' : 'node') + ' on ' + process.env.NODE_ENV + ' network')

async function start()
{
    // initiate data layer
    const { loadDataHandler } = require('./Data')
    await loadDataHandler(isDevelopment, isBrowser)

    if(isBrowser)
    {
        // initiate conjure
    }
}

start()