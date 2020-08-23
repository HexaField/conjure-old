import ScreenElementBase from './ScreenElementBase'
import { easyPlane } from '../../util/MeshTemplates'

export default class ScreenElementSprite extends ScreenElementBase
{  
    constructor(screen, parent, args = {})
    {
        super(screen, parent, args);

        this.load = this.load.bind(this)

        this.icon = easyPlane({ width: this.width, height: this.height });
        this.group.add(this.icon);

        this.texture = undefined;
        this.textureURL = undefined;
    }

    setIconTexture(texture)
    {
        this.texture = texture;
        this.icon.material.map = texture;
    }

    setIconScale(scale)
    {
        this.icon.scale.set(scale, scale, scale)
    }

    setCallback(callback)
    {
        this.loadCallback = callback;
    }

    async load()
    {
        if(!this.textureURL) return;

        this.texture = await this.screen.screenManager.conjure.load.texture(this.textureURL)
        
        if(!this.texture)
            this.texture = await this.screen.screenManager.conjure.load.texture('https://cors-anywhere.herokuapp.com/' + this.textureURL)
        
        if(this.loadCallback)
            this.loadCallback();
        this.icon.material.map = this.texture;
    }

    setValue(tex)
    {
        this.texture = tex;
    }

    getValue()
    {
        return this.texture;
    }

    update(updateArgs)
    {
        super.update(updateArgs);
    }

    setDisabled(disable)
    {
        super.setDisabled(disable);
    }
}

// export default ScreenElement;