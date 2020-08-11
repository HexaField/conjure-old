import { promises as fs } from 'fs'
import os from 'os'

export default class FileStorageNode
{  
    constructor()
    {
        this.rootDirectory = os.homedir() + (global.isDevelopment ? '/.conjure-dev/' : '/.conjure/')
        this.files = fs
    }   

    // Internal

    async initialise()
    {
        if(await this.makeDirectory(this.rootDirectory))
            console.log('Created    Root Directory: ' + this.rootDirectory)
    }

    async makeDirectory(directory)
    {
        try {
            // console.log('makeDirectory', directory)
            if(!await this.exists(directory))
                return Boolean(await this.files.mkdir(directory, { recursive: true }))
        } catch (err) {
            console.log('Error making directory at location', directory, err)
        }
        return false
    }

    async exists(directory)
    {
        try {
            // console.log('exists', directory)
            let stat = await this.files.stat(directory)
            return Boolean(stat)
        } catch (err) {
            console.log('Error finding status of file at location', directory, err)
        }
        return false
    }

    // API

    async readFile(filename)
    {
        try {
            // console.log('readFile', this.rootDirectory + filename)
            if(await this.exists(this.rootDirectory + filename))
                return await this.files.readFile(this.rootDirectory + filename)
            return false
        } catch (err) {
            console.log('Error reading file at location', filename, err)
        }
        return false
    }

    async writeFile(filename, data)
    {
       try {
            // console.log('writeFile', this.rootDirectory + filename)
            return await this.files.writeFile(this.rootDirectory + filename, data)
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