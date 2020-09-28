self.global = {}

global.homedir = '/'
global.isBrowser = true
global.conjureVersion = '0.0.0'

async function start() {

    const { getParams } = await import('../data/util/urldecoder')
    const { default: DataHandler } = await import('../data/DataHandler')
    const dataHandler = new DataHandler()

    await dataHandler.initialise(async () => {
    
        const canvas = document.getElementById('conjure-canvas');
        
        const { createOffscreenCanvas } = await import('./offscreencanvas')
        canvas.receiveRequest = dataHandler.receiveRequest.bind(dataHandler)


        const urlParams = getParams(window.location.href)

        // const proxy = createOffscreenCanvas(canvas, '/_dist_/conjure/worker.js', { 
        //     windowKeysToCopy: [
        //         'location',
        //         'devicePixelRatio',
        //     ],
        //      userData: {
            //     urlParams
            // }
        // });
    
        // if (proxy) {
        //     console.log('Successfully loaded offscreen canvas!');
        // } else {
            const { default: init } = await import('./App')
            init({ canvas, inputElement: canvas, userData: {
                urlParams,
                dataHandler
            } })
        // }    
            
    })
}
start()