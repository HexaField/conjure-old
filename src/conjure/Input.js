import { THREE } from 'enable3d'
import Keybindings from './Keybindings';
export default class Input
{
    constructor(conjure)   
    {
        this.conjure = conjure;
        this.input = new window.Pinput();
        this.mouse = new THREE.Vector2();
        this.scroll = 0;
        this.scrollVelocity = 0;
        this.enabled = true;
        this.keybindings = new Keybindings(conjure);
		this.onMouseWheel = this.onMouseWheel.bind(this);
        document.addEventListener('wheel', this.onMouseWheel, false);
        this.addKey('HOME', 'GRAVE');
    }

    setEnabled(enabled)
    {
        this.enabled = enabled;
    }

    isPressed(key, ignoreBinding, ignoreEnabled)
    {
        if(!ignoreEnabled) { if(!this.enabled) { return false; } }
        if(ignoreBinding)
            return this.input.isPressed(key);
        else
            return this.input.isPressed(''+this.keybindings.getKey(key));
    }
    
    isReleased(key, ignoreBinding, ignoreEnabled)
    {
        if(!ignoreEnabled) { if(!this.enabled) { return false; } }
        if(ignoreBinding)
            return this.input.isReleased(key);
        else
            return this.input.isReleased(''+this.keybindings.getKey(key));
    }
    
    isDown(key, ignoreBinding, ignoreEnabled)
    {
        if(!ignoreEnabled) { if(!this.enabled) { return false; } }
        if(ignoreBinding)
            return this.input.isDown(key);
        else
            return this.input.isDown(''+this.keybindings.getKey(key));
    }

    addKey(key, value)
    {
        this.keybindings.addKey(key, value);
    }

	onMouseWheel(event)
	{
		let delta = 0;

		if(event.wheelDelta) //WebKit / Opera / Explorer 9
			delta = event.wheelDelta;
		else if(event.detail) // Firefox 
            delta = - event.detail;
        delta *= 0.01;
        if(delta > 1)
            delta = 1;
        if(delta < -1)
            delta = -1;
        this.scrollVelocity = delta;
        this.scroll += this.scrollVelocity
    }
    
    update()
    {
        this.input.update();
        this.mouse.x = (this.input.mousePosition.x / window.innerWidth) * 2 - 1;
        this.mouse.y = - (this.input.mousePosition.y / window.innerHeight) * 2 + 1;
        if(this.scrollVelocity > 0 || this.scrollVelocity < 0)
            this.scrollVelocity *= 0.5;
        if(this.scroll > 5)
            this.scroll = 5;
        if(this.scroll < -5)
            this.scroll = -5;
        if(this.scroll > 0)
            this.scroll *= 0.5;
        if(this.scroll < 0)
            this.scroll *= 0.5;
        if((this.scroll < 0.01 && this.scroll > 0) || (this.scroll > -0.01 && this.scroll < 0))
            this.scroll = 0;
    }
}