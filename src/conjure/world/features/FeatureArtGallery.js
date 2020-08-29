import { THREE } from 'enable3d'
import Feature from "./Feature"
const etherscan = require('etherscan-api').init();
import abiDecoder from 'abi-decoder'
import FileType from 'file-type/browser'
import bufferToBase64 from '../../util/bufferToBase64'
import FeatureRoom from './FeatureRoom'
import { Texture, VideoTexture } from 'three/build/three.module';
import TextRenderer3D from '../../screens/text/TextRenderer3D';

export default class FeatureArtGallery extends Feature
{
    constructor(realm)
    {
        super(realm)
        this.piecesCount = 12
        this.room = new FeatureRoom(realm.conjure, realm.group, { roomHeight: 6, roomWidth: this.piecesCount * 2 })
        this.superrareABI =  [{"constant":true,"inputs":[{"name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_enabled","type":"bool"}],"name":"enableWhitelist","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"},{"name":"_uri","type":"string"}],"name":"updateTokenMetadata","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_address","type":"address"}],"name":"isWhitelisted","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"tokenCreator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"deleteToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_removedAddress","type":"address"}],"name":"removeFromWhitelist","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_whitelistees","type":"address[]"}],"name":"initWhitelist","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"tokenId","type":"uint256"},{"name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_uri","type":"string"}],"name":"addNewToken","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_newAddress","type":"address"}],"name":"addToWhitelist","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"},{"name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_name","type":"string"},{"name":"_symbol","type":"string"},{"name":"_oldSuperRare","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_tokenId","type":"uint256"},{"indexed":false,"name":"_uri","type":"string"}],"name":"TokenURIUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_newAddress","type":"address"}],"name":"AddToWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_removedAddress","type":"address"}],"name":"RemoveFromWhitelist","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"approved","type":"address"},{"indexed":true,"name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"operator","type":"address"},{"indexed":false,"name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"}]
        this.pieces = []
    }

    async preload()
    {
        this.realm.conjure.loadingScreen.setText('Loading art pieces...')
        console.log('Loading art gallery...')

        this.loadingTex = await this.realm.conjure.load.texture(this.realm.conjure.assetURL + 'assets/icons/loading.png')
        
        for(let i = 0; i < this.piecesCount; i++)
        {
            let isSecondHalf = i >= this.piecesCount / 2
            let x = (this.room.roomWidth / this.piecesCount) * ((isSecondHalf ? i - (this.piecesCount / 2) : i)) - (this.room.roomWidth / 4) + 1
            let mesh = this.createPainting(new THREE.Vector3(
                x * 2,
                3,
                (isSecondHalf ? 1 : -1) * this.room.roomLength * 0.45)
            )
            if(isSecondHalf)
                mesh.rotateY(Math.PI)
        }
    }

    async load()
    {
        this.loadArtwork()
    }

    async unload()
    {
        this.room.destroy()
    }

    update(updateArgs)
    {
    }

    async loadArtwork()
    {
        abiDecoder.addABI(this.superrareABI);
        
        let txlist = await etherscan.account.txlist('0xb932a70a57673d89f4acffbe830e8ed7f75fb9e0', 0, 'latest', 0, 100, 'desc');
        let i = 0;
        for(let txn of txlist.result)
        {
            let now = Date.now()
            let input = abiDecoder.decodeMethod(txn.input)
            if(!input || !input.params) continue
            
            if(input.name === 'addNewToken')
            {
                // let hash = input.params[0].value.split('/').slice(-1).pop()
                let metadata = await(await fetch(input.params[0].value)).json()
                if(metadata.media.mimeType.includes('gif') || metadata.media.mimeType.includes('mp4')) continue

                let artworkData = await fetch(metadata.media.uri)

                let data = await artworkData.arrayBuffer()
                let type = await FileType.fromBuffer(data)

                let dataURI = "data:" + type.mime + ";base64," + bufferToBase64(data)
                
                let image = new Image()
                let texture = new Texture()
                if(metadata.media.mimeType.includes('gif') || metadata.media.mimeType.includes('mp4'))
                {
                    // texture = new VideoTexture()
                }   
                else
                {
                    this.pieces[i].createdBy.setText(metadata.createdBy.trim())
                    this.pieces[i].description.setText(this.explodeString(metadata.description.trim(), 60))
                    this.pieces[i].mesh.material.map = texture
                    image.onload = () => {
                        texture.image = image;
                        texture.needsUpdate = true
                    }
                    image.src = dataURI
                }

                i++;
                console.log('Artwork number', i, 'of type',type.mime,'took', Date.now()-now,'ms to load ')
                if(i >= this.piecesCount - 1) return
            }
        }
    }

    createPainting(pos)
    {
        let mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), new THREE.MeshBasicMaterial({ map:this.loadingTex, side:THREE.DoubleSide }))
        
        let flip = this.pieces.length % 2 ? 1 : -1

        let createdBy = new TextRenderer3D(this.realm.conjure, mesh, { text: 'Loading...', width: 1, scale: 2, color: 0x000000 });
        createdBy.group.position.set(0, -1.25, 0);

        let description = new TextRenderer3D(this.realm.conjure, mesh, { text: '', width: 1, scale: 2, color: 0x000000 });
        description.group.position.set(0, -1.5, 0);

        mesh.receiveShadow = false
        mesh.castShadow = false
        mesh.position.copy(pos)
        this.realm.group.add(mesh)

        this.pieces.push({ mesh, createdBy, description })
        return mesh
    }

    explodeString(str, maxLength) {
        var buff = "";
        var numOfLines = Math.floor(str.length/maxLength);
        for(var i = 0; i<numOfLines+1; i++) {
            buff += str.substr(i*maxLength, maxLength); if(i !== numOfLines) { buff += "\n"; }
        }
        return buff;
    }
}