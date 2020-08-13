import ScreenElementBase from './ScreenElementBase'
import { easyPlane } from '../../util/MeshTemplates'

export default class ScreenElementSprite extends ScreenElementBase
{  
    constructor(screen, parent, args = {})
    {
        super(screen, parent, args);

        this.load = this.load.bind(this)

        this.icon = easyPlane({ width: this.width, height: this.height, color: 0xffffff });
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

    load()
    {
        if(!this.textureURL) return;
        this.screen.screenManager.conjure.load.texture('https://cors-anywhere.herokuapp.com/' + this.textureURL).then(function(tex) {
            this.texture = tex;
            this.onLoad();
        }.bind(this))
    }

    onLoad()
    {
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

    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster);
    }

    setDisabled(disable)
    {
        super.setDisabled(disable);
    }
}

// export default ScreenElement;