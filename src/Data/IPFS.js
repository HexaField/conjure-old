const IPFS = require('ipfs')

async function loadIPFS(isProduction) {
    console.log('Connecting to IPFS...')
    const ipfs = await IPFS.create({
        repo: (isProduction ? '~/.ipfs-' : '~/.ipfs-dev-') + Date.now()+'/',
        config:{
            Addresses:{
                Swarm:[
                    '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                    '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                    '/dns4/boiling-hamlet-91904.herokuapp.com/tcp/443/wss/p2p-webrtc-star',
                ]
            }
        },
    });
    
    console.log('IPFS Info', ipfs)
    const peerID = await ipfs.id()
    console.log('IPFS node ready with id ' + peerID.id)

    document.addEventListener("unload", ()=>{
        ipfs.stop().catch(err => console.error(err))
    });
    // this.networkInfo = {}
    // this.networkInfo.peersCount = 0;
    
    // this.showStats();
    return ipfs
}

module.exports = { loadIPFS }