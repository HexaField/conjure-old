import ScreenBase from '../ScreenBase';
import HUDElementWatcher from './HUDElementWatcher';
import HUDElementConsole from './HUDElementConsole';
import HUDElementNotification from './HUDElementNotification';


export default class HUDGlobal extends ScreenBase
{  
    constructor(screenManager, args)
    {
        super(screenManager, args)

        this.screenTitle.mesh.visible = false

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

    update(updateArgs)
    {
        super.update(updateArgs)
        this.console.update()
        this.watcher.update()
        this.notification.update()
    }
}