import { easyPlane } from '../../util/MeshTemplates'
import HTMLObject from '../../util/HTMLObject'
import ScreenElementBase from './ScreenElementBase';
import { THREE } from 'enable3d'

export default class ScreenElementTextBox extends ScreenElementBase
{  
    constructor(screen, parent, args = {})
    {
        super(screen, parent, args);

        this.background = easyPlane({ width: this.width, height: this.height, color: 0x2685ff, transparent: true, opacity: 0.2 });
        this.background.castShadow = false;
        this.background.receiveShadow = false;

        this.onClickCallback = args.callback;

        this.group.add(this.background);
        // this.registerElement(this.button);

        //sceneCSS, parent, string, colour, width, height, scale, editable
        // this.textObj = new easyText3D(screen.screenManager.conjure, this.group, 'Edit');
        // this.textObj.group.position.setZ(0.1);

        this.value = 'text';
        this.focused = false;
        this.edit = this.edit.bind(this);

        this.resolution = 600;
        var element = document.createElement( 'div' );
        element.style.width = ''+(this.width*this.resolution)+'px';
        element.style.height = ''+(this.height*this.resolution)+'px';
        element.style.opacity = 1;
        element.style.background = new THREE.Color(0xffffff); //0x2685ff
        element.textContent = 'text';
        element.style.fontFamily = 'Verdana'
        element.style.fontSize = '32px'
        element.style.lineHeight = '40px'
        element.style.textAlign = 'center';
        element.style.verticalAlign = 'text-bottom';

        this.cssObj = new HTMLObject(screen.screenManager.conjure.sceneCSS, this.group, element, { width: this.width, height: this.height, scale: 0.1, resolution: this.resolution });
        this.cssObj.objectCSS.element.addEventListener("blur", ()=>{ this.edit(false); }, true);
        this.addHTML(this.cssObj)
        this.edit(false);
    }

    setValue(value)
    {
        this.value = String(value);
        this.setText(this.value);
    }

    setSubject(vector3)
    {
        this.subject = vector3;
        this.setValue(this.subject)
    }

    updateValue()
    {
        this.setValue(this.cssObj.objectCSS.element.textContent);
        if(this.onChangeCallback)
            this.onChangeCallback(this.getValue())
    }

    setOnExitCallback(callback)
    {
        this.onExitCallback = callback
    }

    setOnChangeCallback(callback)
    {
        this.onChangeCallback = callback;
    }

    getValue()
    {
        return this.value;
    }

    setText(text)
    {
        // this.textObj.setText(text);
        this.cssObj.objectCSS.element.textContent = text;
    }

    setActive(active)
    {
        super.setActive(active);
        this.cssObj.show(active);
        if(!active)
            this.edit(false);
    }

    getIsFocused()
    {
        return this.focused
    }

    edit(flag)
    {
        this.focused = flag;
        this.screen.screenManager.conjure.input.setEnabled(!flag);
        if(flag)
        {
            this.screen.activeTextBox = this;
            this.cssObj.objectCSS.element.focus();
            this.cssObj.objectCSS.element.setAttribute('contenteditable', 'true');
            this.cssObj.objectCSS.element.className = 'editbox';
            this.background.material.opacity = 0.8;
        }
        else
        {
            this.screen.activeTextBox = undefined;
            this.cssObj.objectCSS.element.blur();
            this.cssObj.objectCSS.element.setAttribute('contenteditable', 'false');
            this.cssObj.objectCSS.element.className = 'noselect';
            this.background.material.opacity = 0.2;
            if(this.onExitCallback)
                this.onExitCallback()
        }
    }

    addIcon(icon)
    {
        // easyPlane(this.group, icon, 0xffffff, 0.4, 0.2);
    }

    update(updateArgs)
    {
        super.update(updateArgs);
        if(this.disabled) return;

        if(this.focused)
            this.updateValue();
        
        this.cssObj.update();
        if(!this.active) return;
        
        if(updateArgs.input.isPressed('ESCAPE', true, true) || updateArgs.input.isPressed('ENTER', true, true))
        {
            if(this.focused && this.onClickCallback)
                this.onClickCallback(this.onClickCallbackArgs, this.getValue());
            this.edit(false);
        }
        let intersections = updateArgs.mouseRaycaster.intersectObject(this.background, false);
        if(intersections.length > 0)
        {
            this.hover(this, true);
            if(updateArgs.input.isPressed('MOUSELEFT', true, true))
                this.click(this, true);
        }
        else
        {
            if(updateArgs.input.isPressed('MOUSELEFT', true, true))
                this.click(this, false);
            this.hover(this, false);
        }
        if(updateArgs.input.isReleased('MOUSELEFT', true))
            this.click(this, false);
        if(updateArgs.input.isDown('CONTROL', true))
        {
            if(updateArgs.input.isPressed('V', true))
            {
                navigator.clipboard.readText().then(clipText => this.setValue(clipText))
            }
        }

        // if(!this.focused && this.subject !== this.value) // update only when necessary
        //     this.setValue(this.subject);
    }

    setOnClickCallback(callback, args)
    {
        this.onClickCallbackArgs = args;
        this.onClickCallback = callback;
    }

    setDisabled(disable)
    {
        super.setDisabled(disable);
    }

    onClick(clickable)
    {
        if(this.disabled) return;
        this.edit(true);
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

// export default ScreenElement;