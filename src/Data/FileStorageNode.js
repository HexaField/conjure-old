import fs from 'fs'

export default class FileStorageNode
{  
    constructor(isProduction)
    {
        this.rootDirectory = '~' + (isProduction ? '/conjure-dev/' : '/conjure/')
        this.files = fs.promises
    }

    // Internal

    async initialise()
    {
        await this.makeDirectory(this.rootDirectory)
    }

    async makeDirectory(directory)
    {
        await this.files.mkdir(this.rootDirectory + directory, { recursive: true })
    }

    async exists(directory)
    {
        let stat = await this.files.stat(directory)
        return stat.isFile() || stat.isDirectory()
    }

    // API

    async readFile(filename)
    {
        try {
            if(await this.exists(this.rootDirectory + filename))
                return await (await this.files.readFile(this.rootDirectory + filename)).text()
            return false
        } catch (err) {
            console.log('Error reading file at location', filename, err)
        }
        return false
    }

    async writeFile(filename, data)
    {
       try {
            return await this.files.writeFile(this.rootDirectory + filename, new Blob([data]))
        } catch (err) {
            console.log('Error writing file at location', filename, err)
        }
        return false
    }

    async removeFile(filename)
    {
       try {
            if(await this.exists(this.rootDirectory + filename))
                if(await this.files.unlink(this.rootDirectory + filename))
                    return true
        } catch (err) {
            console.log('Error removing file at location', filename, err)
        }
        return false
    }

    // async getFiles(directory)
    // {
    //     try {
    //         return await this.getAllFilesIn(this.rootDirectory + directory)
    //     } catch (err) {
    //         console.log('Error getting files at location', directory, err)
    //     }
    //     return []
    // }

    // async getAllFilesIn(directory)
    // {
    //     let files = [];
    //     if(!await this.exists(directory))
    //     {
    //         await this.files.mkdir(directory, { recursive: true })
    //         return [];
    //     }
    //     let objects = await this.files.ls(directory)
    //     for(let object of objects)
    //     {
    //         if(object.isFile())
    //         {
    //             let blob = await this.files.readFile(object.path);
    //             files.push(await blob.text())
    //         }
    //     }
    //     return files;
    // }
}