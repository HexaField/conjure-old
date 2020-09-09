import FileSystem from './simple-fs'
import OrbitDBFS from './simple-fs-orbitdb'

export default class FileStorageDHT
{  
    constructor(directory)
    {
        this.rootDirectory = '/conjure/' + directory
        this.files = new FileSystem({ storage: new OrbitDBFS('conjure ' + directory) })
    }

    async close()
    {
        return await this.files.storage.close()
    }

    async initialise(orbitdb)
    {
        await this.files.storage.initialise(orbitdb)
        // if(!await this.files.exists(this.rootDirectory))
        await this.files.mkdirParents(this.rootDirectory)
        await this.files.mkdirParents(this.rootDirectory + '/objects')
        // console.log(this.files.storage.db.all)
    }

    async makeDirectory(directory)
    {
        if(!await this.files.exists(this.rootDirectory + directory))
            await this.files.mkdirParents(this.rootDirectory + directory)
    }

    async readFile(filename)
    {
        try {
            if(await this.files.exists(this.rootDirectory + filename))
                return await this.files.readFile(this.rootDirectory + filename)
            return false
        } catch (err) {
            global.log('Error reading file at location', filename, err)
        }
        return false
    }

    async writeFile(filename, data)
    {
       try {
            return await this.files.writeFile(this.rootDirectory + filename, data)
        } catch (err) {
            global.log('Error writing file at location', filename, err)
        }
        return false
    }

    async removeFile(filename)
    {
       try {
            if(await this.files.exists(this.rootDirectory + filename))
                if(await this.files.unlink(this.rootDirectory + filename))
                    return true
        } catch (err) {
            global.log('Error removing file at location', filename, err)
        }
        return false
    }

    async getFiles(directory)
    {
        try {
            return await this.getAllFilesIn(this.rootDirectory + directory)
        } catch (err) {
            global.log('Error getting files at location', directory, err)
        }
        return []
    }

    async getAllFilesIn(directory)
    {
        let files = []
        if(!await this.files.exists(directory))
        {
            await this.files.mkdirParents(directory)
            return []
        }
        let objects = await this.files.ls(directory)
        for(let object of objects)
        {
            if(object.isFile())
            {
                files.push(await this.files.readFile(object.path))
            }
        }
        return files;
    }
}