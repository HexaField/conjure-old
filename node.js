import DataHandler from './src/data/DataHandler'
import os from 'os'

global.homedir = os.homedir()
global.isBrowser = false
global.conjureVersion = '0.0.0'

async function start()
{
    console.log('Launched node')
    
    const dataHandler = new DataHandler()
    await dataHandler.initialise()
}
start()