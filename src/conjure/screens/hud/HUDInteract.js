
import { THREE } from 'enable3d'
import ScreenElementText from '../elements/ScreenElementText';
import { REALM_PROTOCOLS } from '../../world/realm/Realm';

export const INTERACT_TYPES = {
    NONE: 'none',
    USER: 'user',
    OBJECT: 'object',
    VIDEO: 'video',
}

export default class HUDInteract
{  
    constructor(screen)
    {
        this.screen = screen;
        this.active = false;
        this.object = undefined;
        this.group = new THREE.Group()

        this.textElement = new ScreenElementText(screen, this, { y: 0.75, width: 0.4, height: 0.125, background: true, backgroundOpacity: 0.2, autoUpdateSize: true })
        this.textElement.setText('Interact (G)') // TODO: Get 'G' from keybinding
        this.group.visible = false
        this.screen.registerElement(this.textElement)
        this.type = INTERACT_TYPES.NONE;

        this.screen.screenManager.conjure.input.addKey('INTERACT', 'g');
    }

    setObject(object, type)
    {
        if(type === INTERACT_TYPES.VIDEO)
        {
            this.textElement.setText(object.userData.media.paused ? 'Play' : 'Pause')
        }
        else
            this.textElement.setText('Interact (G)')
        
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

    update(updateArgs)
    {
        if(this.object && updateArgs.input.isPressed('INTERACT'))
        {
            if(this.type === INTERACT_TYPES.USER)
            {
                this.screen.screenManager.screenUserPay.setUser(this.object)
                this.screen.screenManager.showScreen(this.screen.screenManager.screenUserPay)
                this.screen.screenManager.conjure.getWorld().realm.sendTo(REALM_PROTOCOLS.PROFILE.SERVICE.PAYID.REQUESTID, '', this.object.peerID)
            }
            if(this.type === INTERACT_TYPES.OBJECT && this.object.userData.payID)
            {
                this.screen.screenManager.screenUserPay.setObject(this.object)
                this.screen.screenManager.showScreen(this.screen.screenManager.screenUserPay)
            }
            if(this.type === INTERACT_TYPES.VIDEO)
            {
                this.object.userData.media.paused ? this.object.userData.media.play() : this.object.userData.media.pause()
                this.object.userData.media.volume = 1
            }
        }
    }
}