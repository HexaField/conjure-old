
import { THREE } from 'enable3d'
import ScreenElementText from '../elements/ScreenElementText';

export const INTERACT_TYPES = {
    NONE: 'none',
    USER: 'user',
    OBJECT: 'object',
}

export default class HUDInteract
{  
    constructor(screen)
    {
        this.screen = screen;
        this.active = false;
        this.object = undefined;
        this.group = new THREE.Group()

        this.textElement = new ScreenElementText(screen, this, { y: 0.75, width: 0.5, height: 0.2, background: true, backgroundOpacity: 0.2, autoUpdateSize: true })
        this.textElement.setText('Interact (G)') // TODO: Get 'G' from keybinding
        this.group.visible = false
        this.screen.registerElement(this.textElement)
        this.type = INTERACT_TYPES.NONE;
    }

    setObject(object, type)
    {
        if(object === this.object)
            return
        if(!object)
        {
            this.object = undefined;
            this.type = INTERACT_TYPES.NONE;
            this.group.visible = false
            return
        }
        this.object = object;
        this.type = type;
        this.group.visible = true
    }
}