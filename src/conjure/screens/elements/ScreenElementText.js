import TextRenderer3D from '../text/TextRenderer3D'
import ScreenElementBase from './ScreenElementBase'
import { easyPlane } from '../../util/MeshTemplates'

export default class ScreenElementText extends ScreenElementBase
{  
    constructor(screen, parent, args = {})
    {
        super(screen, parent, args);

        this.textObj = new TextRenderer3D(screen.screenManager.conjure, this.group, { text: args.text, ...args.textSettings });
        
        // TODO: add automatic scaler for width & height
        this.autoUpdateSize = args.autoUpdateSize;

        if(args.background)
        {
            this.background = easyPlane({ width: this.width, height: this.height, color: 0x2685ff, transparent: true, opacity: args.backgroundOpacity === undefined ? 0.5 : args.backgroundOpacity });
            this.background.visible = true;
            this.group.add(this.background);
        }
    }
    
    setActive(active)
    {
        super.setActive(active);
    }

    getValue()
    {
        return this.textObj.string;
    }

    setText(text)
    {
        this.textObj.setText(text);
    }

    addIcon(icon)
    {
        // easyPlane(this.group, icon, 0xffffff, 0.4, 0.2);
    }

    setOnClickCallback(callback, args)
    {
        this.onClickCallbackArgs = args;
        this.onClickCallback = callback;
    }
    
    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster);
        if(this.disabled) return;
        if(!this.active) return;
        let intersections = raycaster.intersectObject(this.textObj.group, false);
        if(intersections.length > 0)
        {
            this.hover(this, true);
            if(input.isPressed('MOUSELEFT', true))
                this.click(this, true);
        }
        else
        {
            if(input.isPressed('MOUSELEFT', true))
                this.click(this, false);
            this.hover(this, false);
        }
        if(input.isReleased('MOUSELEFT', true))
            this.click(this, false);
    }

    setDisabled(disable)
    {
        if(!this.active) return;
        super.setDisabled(disable);

    }

    onClick(clickable)
    {
        if(this.disabled) return;
        
        if(this.onClickCallback)
            this.onClickCallback(this.onClickCallbackArgs)
    }

    onUnClick(clickable)
    {
        if(this.disabled) return;
    }

    onMouseOver(clickable)
    {
        if(this.disabled) return;
    }

    onMouseOut(clickable)
    {
        if(this.disabled) return;
    }
}