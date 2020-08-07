export async function loadDataHandler(isProduction) {
    // === load IPFS === //

    const IPFS = require('./IPFS')
    const ipfs = await IPFS.loadIPFS(isProduction)

    // === connect to conjure network === //

    // const network = require('./network')
    // network.connect(isProduction)

    // === load local database === //

    // browser: IndexedDB (simple-fs)
    // node: fs

    // ===  === //


}