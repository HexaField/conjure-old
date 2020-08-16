import ScreenBase from './ScreenBase';
import ScreenElementButton from './elements/ScreenElementButton';
import ScreenElementLabelled from './elements/ScreenElementLabelled';
import ScreenElementTextBox from './elements/ScreenElementTextBox';
import ScreenElementScroll from './elements/ScreenElementScroll';
import { number } from '../util/number'

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
        // if(active && !this.guilds.length)
        //     this.profile.getRealmsFromConnectedServices(this.updateGuilds);
    }

    createRealm()
    {
        this.screenManager.hideAllScreens()
        this.screenManager.conjure.getWorld().realmManager.createRealm()
    }

    // TODO: add realm icons
    updateRecentRealms(recentRealms)
    {
        this.scrollPanel.removeAllItems()
        // console.log(recentRealms)
        if(!recentRealms) return
        for(let realm of recentRealms)
        {
            let button = new ScreenElementButton(this, this.scrollPanel, { width: this.buttonWidth, height: this.buttonHeight });
            let realmLabel = new ScreenElementLabelled(this, this.scrollPanel, { width: this.buttonWidth * 2, height: this.buttonHeight, element: button });
            realmLabel.setIconFromURL(realm.iconURL ? realm.iconURL : 'https://cdn.discordapp.com/attachments/711163360175194154/736369287496728656/realm_default.png');
            realmLabel.setIconSize(0.1)
            realmLabel.icon.group.position.set(-0.2, 0, 0)
            button.setOnClickCallback(this.joinRealm, realm); // return all the realm info data
            button.setValue(realm.name);
            this.scrollPanel.registerItem(realmLabel);
        }
        this.scrollPanel.updateItems(0);
    }

    updateGuilds(guilds)
    {
        // this.guilds = guilds;
        // for(let i = 0; i < this.guilds.length; i++)
        // {
        //     const editable = new ScreenElementButton(this, this.scrollPanel, 0.4, 0, 0, this.buttonWidth, this.buttonHeight);
        //     const guildNameLabel = new ScreenElementLabelled(this, this.scrollPanel, 0, 0, 0.1, this.buttonWidth * 2, this.buttonHeight, editable);
        //     if(this.guilds[i].icon)
        //         guildNameLabel.setIconFromURL('https://cdn.discordapp.com/icons/' + this.guilds[i].id + '/'+ this.guilds[i].icon + '.png');
        //     else
        //         guildNameLabel.setIconFromURL('https://cdn.clipart.email/718929dc3e24ec2fccef17c2134648c8_discord-logo-png-free-transparent-png-logos_512-512.png');
        //     guildNameLabel.setIconSize(0.1)
        //     guildNameLabel.icon.group.position.set(-0.2, 0, 0)
        //     editable.setOnClickCallback(this.joinGuild, this.guilds[i].id);
        //     editable.setValue(this.guilds[i].name);
        //     this.scrollPanel.registerItem(guildNameLabel);
        // }
        // this.scrollPanel.updateItems(0);
    }

    joinRealm(realmInfo)
    {
        if(!realmInfo)
        try{
            this.screenManager.hideAllScreens()
            this.screenManager.conjure.getWorld().joinRealmByID(number(this.discordIdTextbox.getValue())) // for joining a private realm
            return
        }
        catch(error)
        {
            global.console.log('Error! Realm ID must be a number!')
        }
        this.screenManager.hideAllScreens()
        this.screenManager.conjure.getWorld().joinRealm(realmInfo) // for joining a public realm
    }

    update(updateArgs)
    {
        super.update(updateArgs)
    }
}