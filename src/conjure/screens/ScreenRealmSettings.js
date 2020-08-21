import ScreenBase from './ScreenBase'
import ScreenElementButton from './elements//ScreenElementButton'
import ScreenElementJSONTree from './elements/ScreenElementJSONTree'
import { REALM_TERRAIN_GENERATORS, REALM_VISIBILITY } from '../world/realm/RealmData'
import RealmData from '../world/realm/RealmData'

export default class ScreenRealmSettings extends ScreenBase
{  
    constructor(screenManager, args)
    {
        super(screenManager, args)

        this.group.add(this.background)

        this.createRealm = this.createRealm.bind(this)
        this.updateRealm = this.updateRealm.bind(this)
        this.isCreating = false

        this.jsonTree = new ScreenElementJSONTree(this, this, { width: this.width, height: this.height, alwaysUpdate: true })
        this.registerElement(this.jsonTree)

        this.cancelButton = new ScreenElementButton(this, this, { x : -this.width / 4, y: -this.height / 2 + 0.2, width: this.buttonWidth, height: this.buttonHeight });
        this.cancelButton.setText('Cancel');    
        this.cancelButton.setOnClickCallback(() => this.screenManager.showScreen(this.screenManager.screenRealms));
        this.cancelButton.setHidden(true)
        this.registerElement(this.cancelButton);

        this.createButton = new ScreenElementButton(this, this, { x : this.width / 4, y: -this.height / 2 + 0.2, width: this.buttonWidth, height: this.buttonHeight });
        this.createButton.setText('Create');
        this.createButton.setOnClickCallback(this.createRealm);
        this.createButton.setHidden(true)
        this.registerElement(this.createButton);
    }

    getSchema()
    {
        return {
            type: 'json',
            label: 'name',
            items: {
                id: {
                    type: 'static',
                    label: 'ID',
                },
                name: {
                    type: 'text',
                    label: 'Name',
                },
                iconURL: {
                    type: 'text',
                    label: 'Icon',
                },
                visibility: {
                    type: this.isCreating ? 'list' : 'static',
                    label: 'Visibility',
                    items: Object.values(REALM_VISIBILITY)
                },
                architectures: {
                    type: 'list',
                    label: 'Architectures',
                    items: []
                },
                worldSettings: {
                    type: 'json',
                    label: 'World Settings',
                    items: {
                        terrainGeneratorType: {
                            type: 'list',
                            label: 'Terrain Type',
                            items: Object.values(REALM_TERRAIN_GENERATORS)
                        }
                    }
                },
            }
        }
    }

    showScreen(active, args = {})
    {
        super.showScreen(active)
        this.isCreating = Boolean(args.isCreating)
        this.jsonTree.setActive(active)
        this.jsonTree.setSchema(this.getSchema())
        if(active)
        {
            if(this.isCreating)
            {
                this.createButton.setHidden(false)
                this.cancelButton.setHidden(false)
                this.info = new RealmData()
                this.jsonTree.updateTree(this.info.getInfo())
            }
            else
            {
                this.createButton.setHidden(true)
                this.cancelButton.setHidden(true)
                this.jsonTree.updateTree(this.screenManager.conjure.getWorld().realm.settings.settings, this.updateRealm)
            }
        }
    }

    async createRealm()
    {
        await this.screenManager.conjure.getDataHandler().createRealm(this.info.getInfo())
        console.log('Successfully made realm!')
        this.screenManager.showScreen(this.screenManager.screenRealms)
    }

    updateRealm()
    {
        this.screenManager.conjure.getDataHandler().updateRealm(this.info.getInfo())
    }

    update(updateArgs)
    {
        super.update(updateArgs)
    }
}