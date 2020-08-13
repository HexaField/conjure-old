import ScreenBase from '../ScreenBase';
import ScreenElementButton from '../elements/ScreenElementButton';
import { CONJURE_MODE } from '../../Conjure';

export default class HUDExploreMode extends ScreenBase
{  
    constructor(screenManager, camera, world, args)
    {
        super(screenManager, camera, world, args)

        this.screenTitle.mesh.visible = false
        
        this.clickTab = this.clickTab.bind(this)

        this.tabs = {
            EXIT: 'Exit',
            ASSETS:'Assets',
            OBJECTS: 'Objects',
            FLY: 'Fly',
            MANAGE: 'Manage Realm',
        }

        this.tabKeys = Object.keys(this.tabs)

        this.tabHeight = this.tabKeys.length / 50 // this makes it so all the tabs fit in the same space vertically
        let y = 0.5 // start at one quarter from the top (-1 is bottom, 0 is center, 1 is top)

        for(let tab of this.tabKeys)
        {
            let button = new ScreenElementButton(this, this, -0.95, y, 0, 0.1, this.tabHeight, { text:this.tabs[tab], anchor:true})
            button.setOnClickCallback(this.clickTab, this.tabs[tab])
            this.registerElement(button)
            y -= this.tabHeight * 2
        }
    }

    clickTab(tab)
    {
        switch(tab)
        {
            default: case this.tabs.EXIT: this.screenManager.conjure.setConjureMode(CONJURE_MODE.EXPLORE); break;
            case this.tabs.ASSETS: this.screenManager.showScreen(this.screenManager.screenAssets); break;
            case this.tabs.OBJECTS: this.screenManager.showScreen(this.screenManager.screenObjectsHierarchy); break;
            case this.tabs.FLY: this.screenManager.conjure.controls.toggleConjureControls(); break;
            case this.tabs.MANAGE: this.screenManager.showScreen(this.screenManager.screenRealmSettings); break;

        }
    }

    showScreen(active)
    {
        super.showScreen(active)
    }

    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster)
    }
}