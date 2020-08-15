export default class ProfileManager
{
    constructor(files)
    {
        this.files = files
    }

    async initialise()
    {

    }


    async loadProfile()
    {
        try {
            return JSON.parse(await this.files.readFile('profile'))
        }
        catch (error) {
            console.log('ProfileManager: could not load profile with error', error);
            this.conjure.getGlobalHUD().log('Failed to load profile')
            return
        }
    }

    async saveProfile(data)
    {
        try {
            let newObject = { timestamp:String(Date.now()), data: data }
            await this.files.writeFile('profile', JSON.stringify(newObject))
            console.log('ProfileManager: Successfully saved profile');
            // this.conjure.getGlobalHUD().log('Successfully saved profile')
            return true
        } catch (error) {
            console.log('ProfileManager: could not save profile', data, 'with error', error);
            // this.conjure.getGlobalHUD().log('Failed to save profile')
            return false
        }
    }
}