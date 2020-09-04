const IPFS = require('ipfs')
const os = require('os')
const _ = require('lodash')
const WebrtcStar = require('libp2p-webrtc-star')
const WS = require('libp2p-websockets')
// const Bootstrap = require('libp2p-bootstrap')
// const Gossipsub = require('libp2p-gossipsub')
// const KadDHT = require('libp2p-kad-dht')
// const MPLEX = require('libp2p-mplex')
// const SECIO = require('libp2p-secio')
// const { NOISE } = require('libp2p-noise')
const wrtc = require('wrtc')


async function loadIPFS() {
    console.log('Connecting to IPFS...')
    console.log(os.homedir())
    const ipfs = await IPFS.create({
        repo: os.homedir() + (global.isDevelopment ? '/.ipfs-dev' : '/.ipfs') + (global.isBrowser ? '-'+Date.now() : '') + '/',
        config: {
            Addresses: { 
                Swarm: [
                    '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                    '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
                    '/dns4/boiling-hamlet-91904.herokuapp.com/tcp/443/wss/p2p-webrtc-star',
                ]
            }
        },
        libp2p: { // _.merge({
            modules: {
                transport: [WebrtcStar, WS],
                // streamMuxer: [MPLEX],
                // connEncryption: [NOISE, SECIO],
                // peerDiscovery: [Bootstrap],
                // dht: KadDHT,
                // pubsub: Gossipsub
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
        }//, getLibp2pConfig())
    });

    // this.networkInfo = {}
    // this.networkInfo.peersCount = 0;
    
    // this.showStats();
    return ipfs
}

function getLibp2pConfig() {
    if(global.isBrowser) return {}

    return {
        config: {
        }
            // peerDiscovery: {
            //     autoDial: true,
            //     webRTCStar: {
            //         enabled: true
            //     },
            //     bootstrap: {
            //         enabled: true,
            //         interval: 30e3,
            //         list: bootstrapList
            //     }
            // },
            // relay: {
            //     enabled: true,
            //     hop: {
            //         enabled: true,
            //         active: true
            //     }
            // },
            // dht: {
            //     enabled: true,
            //     randomWalk: {
            //         enabled: true,
            //     }
            // }
        // }
    }
}

module.exports = { loadIPFS }