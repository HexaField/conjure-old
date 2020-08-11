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
            console.log('ConjureDatabase: could not load profile with error', error);
            global.CONSOLE.log('Failed to load profile')
            return
        }
    }

    async saveProfile(data)
    {
        try {
            let newObject = { timestamp:String(Date.now()), data: data }
            await this.files.writeFile('profile', JSON.stringify(newObject))
            console.log('ProfileManager: Successfully saved profile');
            // global.CONSOLE.log('Successfully saved profile')
            return true
        } catch (error) {
            console.log('ProfileManager: could not save profile', data, 'with error', error);
            // global.CONSOLE.log('Failed to save profile')
            return false
        }
    }
}