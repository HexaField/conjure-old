async function loadDataHandler(isDevelopment, isBrowser) {
    // === load IPFS === //

    const IPFS = require('./IPFS')
    const ipfs = await IPFS.loadIPFS(isDevelopment, isBrowser)

    // === connect to conjure network === //

    // const network = require('./network')
    // network.connect(isDevelopment, isBrowser)

    // === load local database === //

    // browser: IndexedDB (simple-fs)
    // node: fs

    // ===  === //


}

module.exports = { loadDataHandler }