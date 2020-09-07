import DataHandler from './DataHandler'

global.isBrowser = false
global.isDevelopment = process.env.NODE_ENV === 'development'
global.conjureVersion = '0.0.0'

async function start()
{
    console.log('Launched node on ' + process.env.NODE_ENV + ' network')
    
    const dataHandler = new DataHandler()
    await dataHandler.initialise()
    
    // process.stdin.resume()
    // async function exitHandler(evtOrExitCodeOrError) {
    //     try {
    //         await dataHandler.cleanupServer()
    //         process.exit(0)
    //     } catch (e) {
    //       console.error('EXIT HANDLER ERROR', e);
    //     }
      
    //     process.exit(isNaN(+evtOrExitCode) ? 1 : +evtOrExitCode);
    //   }
      
    //   [
    //     'beforeExit', 'uncaughtException', 'unhandledRejection', 
    //     'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 
    //     'SIGABRT','SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 
    //     'SIGUSR2', 'SIGTERM', 
    //   ].forEach(evt => process.on(evt, exitHandler));
}
start()