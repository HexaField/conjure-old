const IPFS = require('ipfs')
const os = require('os')
const WebrtcStar = require('libp2p-webrtc-star')
const WS = require('libp2p-websockets')
const TCP = require('libp2p-tcp')
// const Bootstrap = require('libp2p-bootstrap')
const Gossipsub = require('libp2p-gossipsub')
const KadDHT = require('libp2p-kad-dht')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const { NOISE } = require('libp2p-noise')
const wrtc = require('wrtc')


async function loadIPFS() {
    global.log('Connecting to IPFS and making repo at' + os.homedir())
    const ipfs = await IPFS.create({
        repo: os.homedir() + (global.isDevelopment ? '/.ipfs-dev' : '/.ipfs'),// + '-' + Date.now() + '/',
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
        libp2p: {
            modules: {
                transport: [
                    TCP, 
                    WebrtcStar, 
                    WS
                ],
                streamMuxer: [MPLEX],
                connEncryption: [NOISE, SECIO],
                // peerDiscovery: [Bootstrap],
                dht: KadDHT,
                pubsub: Gossipsub
            },
            config: {
                transport: {
                    [WebrtcStar.prototype[Symbol.toStringTag]]: {
                        wrtc
                    }
                },
                dht: {
                    enabled: true,
                    // randomWalk: {
                    //     enabled: true,
                    // }
                },
            }
        }
    });

    return ipfs
}

module.exports = { loadIPFS }