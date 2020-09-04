import ScreenElementText from '../elements/ScreenElementText';

export default class HUDElementConsole
{  
    constructor(screen)
    {
        this.screen = screen

        this.messages = []
        this.messageLife = 1000 * 12 // last for 10 seconds
        this.messageHeight = 0.06
    }

    log(...text)
    {
        let message = text.join(' ')
        let textElement = new ScreenElementText(this.screen, this.screen, 1, 0, 0, 1, 0.1, { 
            anchor: true,
            textSettings: {
                alignX: 'right',
            }
        })
        textElement.setText(message)
        textElement.userData.timestamp = Date.now()
        this.screen.registerElement(textElement)
        this.messages.push(textElement)
        this.updateMessages()
    }

    updateMessages()
    {
        let y = -1
        for(let message of this.messages)
        {
            y += this.messageHeight
            message.group.position.setY(y)
        }
    }

    update()
    {
        let now = Date.now()
        for(let i in this.messages)
        {
            if(now - this.messages[i].userData.timestamp > this.messageLife)
            {
                this.messages[i].destroy()
                this.screen.group.remove(this.messages[i].group)
                this.messages.splice(i, 1)
                this.updateMessages()
                break; // break just because our iterator will break - will update next frame anyway
            }
        }
    }
}