export default class AssetManager
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
    }

    async initialise()
    {

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