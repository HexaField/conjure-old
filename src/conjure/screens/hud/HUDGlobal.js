import ScreenBase from '../ScreenBase';
import HUDElementWatcher from './HUDElementWatcher';
import HUDElementConsole from './HUDElementConsole';
import HUDElementNotification from './HUDElementNotification';


export default class HUDGlobal extends ScreenBase
{  
    constructor(screenManager, camera, world, args)
    {
        super(screenManager, camera, world, args)

        this.screenTitle.mesh.visible = false
        global.CONSOLE = this

        this.watcher = new HUDElementWatcher(this)
        this.console = new HUDElementConsole(this)
        this.notification = new HUDElementNotification(this)
        
    }

    addWatchItem(label, reference, key)
    {
        this.watcher.addWatchItem(label, reference, key)
    }

    removeWatchItem(ref)
    {
        this.watcher.removeWatchItem(ref)
    }

    log(...text)
    {
        this.console.log(text)
    }

    showNotification(message, duration)
    {
        this.notification.showNotification(message, duration)
    }

    showScreen(active)
    {
        super.showScreen(active)
    }

    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster)
        this.console.update()
        this.watcher.update()
        this.notification.update()
    }
}