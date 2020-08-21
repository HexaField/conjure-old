
import { THREE } from 'enable3d'
import ScreenElementText from '../elements/ScreenElementText';

export default class HUDElementNotification
{  
    constructor(screen)
    {
        this.screen = screen;
        this.active = false;
        this.object = undefined;
        this.group = new THREE.Group()
        this.screen.group.add(this.group)

        this.textElement = new ScreenElementText(screen, this, { text: 'empty notification', y: 0.75, width: 0.5, height: 0.2, autoUpdateSize:true })
        this.textElement.setHidden(true)

        this.timer = 0
        this.hasNotification = false
        this.duration = 0
    }

    showNotification(message, duration = 3) // 3 seconds
    {
        console.log(message, duration)
        this.textElement.setText(message)
        this.textElement.setHidden(false)
        this.hasNotification = true
        this.duration = duration
    }

    update()
    {
        if(this.hasNotification)
            this.timer++
        if(this.timer > this.duration)
        {
            this.hasNotification = false
            this.textElement.setHidden(true)
        }
    }
}