export default class ProfileHandler
{
    constructor(dataHandler)
    {
        this.dataHandler = dataHandler
    }

    async initialise()
    {

    }


    async loadProfile()
    {
        try {
            return JSON.parse(await this.dataHandler.getLocalFiles().readFile('profile.json'))
        }
        catch (error) {
            global.log('ProfileManager: could not load profile with error', error);
            // this.conjure.getGlobalHUD().log('Failed to load profile')
            return
        }
    }

    async saveProfile(data)
    {
        try {
            let newObject = { timestamp:String(Date.now()), data: data }
            await this.dataHandler.getLocalFiles().writeFile('profile.json', JSON.stringify(newObject))
            global.log('ProfileManager: Successfully saved profile');
            // this.conjure.getGlobalHUD().log('Successfully saved profile')
            return true
        } catch (error) {
            global.log('ProfileManager: could not save profile', data, 'with error', error);
            // this.conjure.getGlobalHUD().log('Failed to save profile')
            return false
        }
    }
}