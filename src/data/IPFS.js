// import IPFS from 'ipfs'
// import WebrtcStar from 'libp2p-webrtc-star'
// import WS from 'libp2p-websockets'
// import TCP from 'libp2p-tcp'
// import wrtc from 'https://cdn.skypack.dev/wrtc'
// import Gossipsub from 'https://cdn.skypack.dev/libp2p-gossipsub'
// import KadDHT from 'https://cdn.skypack.dev/libp2p-kad-dht'
// import MPLEX from 'https://cdn.skypack.dev/libp2p-mplex'
// import SECIO from 'https://cdn.skypack.dev/libp2p-secio'
// import NOISE from 'https://cdn.skypack.dev/libp2p-noise'

// import Bootstrap from 'libp2p-bootstrap'

async function loadIPFS() {
    global.log('Connecting to IPFS and making repo at ' + global.homedir)
    const ipfs = await Ipfs.create({
        repo: global.homedir + '/.ipfs',// + '-' + Date.now() + '/',
        config: {
            Addresses: { 
                Swarm: [
                    // '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                    // '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                    '/dns4/boiling-hamlet-91904.herokuapp.com/tcp/443/wss/p2p-webrtc-star',
                ],
                API: '',
                Gateway: '',
                Delegates: []
            },
            Bootstrap: []
        },
        // libp2p: {
        //     modules: {
        //         transport: [
        //             TCP, 
        //             WebrtcStar, 
        //             WS
        //         ],
        //         // streamMuxer: [MPLEX],
        //         // connEncryption: [NOISE, SECIO],
        //         // // peerDiscovery: [Bootstrap],
        //         // dht: KadDHT,
        //         // pubsub: Gossipsub
        //     },
        //     config: {
        //         transport: {
        //             [WebrtcStar.prototype[Symbol.toStringTag]]: {
        //                 wrtc
        //             }
        //         },
        //         dht: {
        //             enabled: true,
        //             // randomWalk: {
        //             //     enabled: true,
        //             // }
        //         },
        //     }
        // }
    });

    return ipfs
}
export default { loadIPFS }