import { THREE, ExtendedGroup } from 'enable3d'
export default class Fonts
{  
    constructor()
    {
        this.fonts = {}
    }

    addFont(name, font)
    {
        this.fonts[name] = font
    }

    getFont(name)
    {
        return this.fonts[name]
    }
}