import Room from './util/ipfs-pubsub-room'

export default class Network
{  
    constructor(ipfs, peerID, topic, onMessage, onPeerJoin, onPeerLeave, params = {})
    {
        this.topic = (global.isDevelopment ? '/conjure-dev/' : '/conjure/') + topic
        this.room = new Room(ipfs, this.topic)
        this.myPeerID = peerID
        this.userData = params

        this.room.on('peer joined', (peer) => {
            onPeerJoin(peer)
        })

        this.room.on('peer left', (peer) => {
            onPeerLeave(peer)
        })

        this.room.on('message', (message) => {

            if(message.from === this.myPeerID) return

            if(message.data === undefined || message.data === null) {
                console.log('Network: received bad buffer data', message.data, 'from peer', message.from)
                return
            }

            let data = message.data

            try {
                data = JSON.parse(data);
            } 
            catch(error) { 
                console.log('Network: received bad json data', data, 'from peer', message.from); 
                return;
            }

            onMessage(data, message.from);
        })
    }
    
    async leave()
    {
        await this.room.leave()
    }

    async sendTo(protocol, content, peerID)
    {
        if(!peerID) return;
        if(!content) content = '';
        let data = JSON.stringify({ protocol: protocol, content: content });
        await this.room.sendTo(peerID, data);
    }

    async sendData(protocol, content)
    {
        if(!content) content = '';
        let data = JSON.stringify({ protocol: protocol, content: content });
        await this.room.broadcast(data);
    }

    getPeers()
    {
        return this.room.getPeers()
    }
}