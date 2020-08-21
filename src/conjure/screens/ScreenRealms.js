import ScreenBase from './ScreenBase'
import ScreenElementButton from './elements/ScreenElementButton'
import ScreenElementLabelled from './elements/ScreenElementLabelled'
import ScreenElementTextBox from './elements/ScreenElementTextBox'
import ScreenElementScroll from './elements/ScreenElementScroll'
import RealmData from '../world/realm/RealmData'

export default class ScreenRealms extends ScreenBase
{  
    constructor(screenManager, args)
    {
        super(screenManager, args);

        this.buttonWidth = 0.4;
        this.buttonHeight = 0.1;

        this.background.visible = true;
        this.group.add(this.background);

        this.createRealm = this.createRealm.bind(this);
        // this.updateGuilds = this.updateGuilds.bind(this);
        this.joinRealm = this.joinRealm.bind(this);

        // this.guilds = [];

        this.joinButton = new ScreenElementButton(this, this, { x: -this.width/4, y: this.height/2 - 0.1, width: this.buttonWidth, height: this.buttonHeight, text: 'Join Realm' });
        this.joinButton.setOnClickCallback(this.joinRealm)
        this.registerElement(this.joinButton)

        this.discordIdTextbox = new ScreenElementTextBox(this, this, { x: this.width/4, y: this.height/2 - 0.1, width: this.buttonWidth, height: this.buttonHeight });
        this.discordIdTextbox.setValue('')
        this.registerElement(this.discordIdTextbox);

        this.scrollPanel = new ScreenElementScroll(this, this, { width: this.width, height: this.height - 0.4 });
        this.registerElement(this.scrollPanel);

        this.createButton = new ScreenElementButton(this, this, { y: -this.height/2 + 0.2, width: this.buttonWidth, height: this.buttonHeight, text: 'Create Realm' });
        this.createButton.setOnClickCallback(this.createRealm)
        this.registerElement(this.createButton)
    }

    showScreen(active)
    {
        super.showScreen(active);
        this.scrollPanel.setActive(active);
        if(active)
            this.getRealms()
    }

    async getRealms()
    {
        this.displayRealms(await this.screenManager.conjure.getDataHandler().getRealms())
    }

    createRealm()
    {
        this.screenManager.showScreen(this.screenManager.screenRealmSettings, { isCreating: true })
    }

    // TODO: add realm icons
    displayRealms(recentRealms)
    {
        this.scrollPanel.removeAllItems()
        if(!recentRealms) return
        for(let realm of recentRealms)
        {
            let button = new ScreenElementButton(this, this.scrollPanel, { width: this.buttonWidth, height: this.buttonHeight });
            let realmLabel = new ScreenElementLabelled(this, this.scrollPanel, { width: this.buttonWidth * 2, height: this.buttonHeight, element: button });
            realmLabel.setIconFromURL(realm.iconURL ? realm.iconURL : 'https://cdn.discordapp.com/attachments/711163360175194154/736369287496728656/realm_default.png');
            realmLabel.setIconSize(0.1)
            realmLabel.icon.group.position.set(-0.2, 0, 0)
            button.setOnClickCallback(this.joinRealm, realm.id); // return all the realm info data
            button.setValue(realm.name);
            this.scrollPanel.registerItem(realmLabel);
        }
        this.scrollPanel.updateItems(0);
    }
    
    async joinRealm(id)
    {
        let realmData = await this.screenManager.conjure.getDataHandler().getRealm(id || this.discordIdTextbox.getValue())
        if(realmData)
        {
            this.screenManager.conjure.getWorld().joinRealm(new RealmData(realmData)) // for joining a private realm
            this.screenManager.hideAllScreens()
        }
        else
        {
            console.log('Could not join realm')
        }
    }

    update(updateArgs)
    {
        super.update(updateArgs)
    }
}