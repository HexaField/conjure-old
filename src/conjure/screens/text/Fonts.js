import { THREE, ExtendedGroup } from 'enable3d'
export default class Fonts
{  
    constructor(conjure)
    {
        this.fonts = {}
        this.fontLoader = new THREE.FontLoader() 
    }

    async addFont(name, font)
    {
        this.fonts[String(name).toLowerCase()] = await this.fontLoader.loadAsync(font)
    }

    getFont(name)
    {
        return this.fonts[String(name).toLowerCase()]
    }
}