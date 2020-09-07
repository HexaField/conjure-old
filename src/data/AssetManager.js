import { GLOBAL_PROTOCOLS } from "./GlobalNetwork"

export default class AssetManager
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
        this.assetCallbacks = {}
        this.receiveAsset = this.receiveAsset.bind(this)
        this.receiveRequest = this.receiveRequest.bind(this)
        this.setProtocolCallback(GLOBAL_PROTOCOLS.ASSET.REQUEST, this.receiveRequest)
        this.setProtocolCallback(GLOBAL_PROTOCOLS.ASSET.RECEIVE, this.receiveAsset)
    }

    async initialise()
    {

    }

    addDataListener(requestTimestamp, callback)
    {
        this.assetCallbacks[requestTimestamp] = callback
    }

    receiveAsset(data, from)
    {
        if(this.protocolCallbacks[data.content.requestTimestamp] !== undefined)
            this.protocolCallbacks[data.content.requestTimestamp](data.content.data);
    }

    async receiveRequest(data, from)
    {
        this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.ASSET.RECEIVE, { requestTimestamp: requestTimestamp, data: await this.loadAsset(assetID) })
    }

    async requestAsset(assetID)
    {
        return await new Promise((resolve, reject) => {
            const requestTimestamp = Date.now() + '-' + Math.round(Math.random() * 1000)
            this.addDataListener(requestTimestamp, (_returnedData) => { 
                _returnedData === undefined 
                    ? reject('Data Module: WebSocket request timed out')
                    : resolve(_returnedData) 
            })

            this.dataHandler.getGlobalNetwork().sendData(GLOBAL_PROTOCOLS.ASSET.REQUEST, { requestTimestamp: requestTimestamp, data: assetID })
        })
    }

    async loadAsset(assetID)
    {
        try {
            return JSON.parse(await this.dataHandler.getNetworkFiles().readFile(assetID))
        }
        catch (error) {
            console.log('AssetManager: could not load asset with error', error)
            return
        }
    }

    async saveAsset(assetID, data)
    {
        try {
            await this.dataHandler.getNetworkFiles().writeFile(assetID, data)
            console.log('AssetManager: Successfully saved asset')
            return true
        } catch (error) {
            console.log('AssetManager: could not save asset', assetID, 'with error', error)
            return false
        }
    }
}