// import Room from './util/ipfs-pubsub-room'
import Room from 'ipfs-pubsub-room'

// TODO: add comments {blah} to explain what payload should look like

export default class Network
{  
    constructor(ipfs, peerID, topic, receiveMessage = (message) => {console.log('Created a room with no receiveMessage callback!')}, params = {})
    {
        this.topic = (global.isDevelopment ? '/conjure-dev/' : '/conjure/') + topic
        this.room = new Room(ipfs, this.topic)
        this.myPeerID = peerID
        this.roomStats = {}
        this.roomStats.peers = []
        this.roomStats.peersCount = 0

        console.log('Joining p2p networking for topic', this.topic, 'with peer ID', this.myPeerID.id)

        this.room.on('subscribed', () => {
            console.log('Now connected!')
        })

        this.room.on('message', (message) => {
            if(message.from === this.myPeerID) return
            if(message.data === undefined || message.data === null) { console.log('Network: received bad buffer data', message.data, 'from peer', message.from); return; }
            let data = Buffer.from(message.data).toString();
            try {
                data = JSON.parse(data);
            } catch (error) { console.log('Network: received bad json data', data, 'from peer', message.from); return; }
            // this is a hack for this.sendTo while pubsubroom is broken
            if(data.intendedRecipient !== undefined && data.intendedRecipient !== this.myPeerID) 
                return
            receiveMessage(data, message.from);
        })

        if(params.showStats)
            this.showStatsRoom();
    }

    addPeerJoinCallback(callback)
    {
        this.room.on('peer joined', (peer) => {
            callback(peer)
        })
    }

    addPeerLeftCallback(callback)
    {
        this.room.on('peer left', (peer) => {
            callback(peer)
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
        let data = JSON.stringify({protocol:protocol, content:content, intendedRecipient:peerID});

        if(this.room)
            await this.room.broadcast(Buffer.from(data));
            // await this.room.sendTo(peerID, Buffer(data)); // sendTo is broken with new version of IPFS
    }

    async sendData(protocol, content)
    {
        if(!content) content = '';
        let data = JSON.stringify({protocol:protocol, content:content});
        await this.room.broadcast(Buffer.from(data));
    }

    showStatsRoom()
    {
        setInterval(async () => {
            try {
                let peers = await this.room.getPeers()
                this.roomStats.peers = peers
                this.roomStats.peersCount = peers.length
                // console.log(`The room now has ${peers.length} peers.`)
                // console.log('peers in ' + this.topic +' : '+ peers)
            } catch (err) {
                console.log('An error occurred trying to check our peers:', err)
            }
        }, 5000)
    }
}