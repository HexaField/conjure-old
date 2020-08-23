import ScreenBase from './ScreenBase'
import ScreenElementButton from './elements//ScreenElementButton'
import ScreenElementJSONTree from './elements/ScreenElementJSONTree'
import { REALM_WORLD_GENERATORS, REALM_VISIBILITY } from '../world/realm/RealmData'
import RealmData from '../world/realm/RealmData'

export default class ScreenRealmSettings extends ScreenBase
{  
    constructor(screenManager, args)
    {
        super(screenManager, args)

        this.group.add(this.background)

        this.createRealm = this.createRealm.bind(this)
        this.updateData = this.updateData.bind(this)
        this.isCreating = false

        this.jsonTree = new ScreenElementJSONTree(this, this, { width: this.width, height: this.height, alwaysUpdate: true })
        this.registerElement(this.jsonTree)

        this.cancelButton = new ScreenElementButton(this, this, { x : -this.width / 4, y: -this.height / 2 + 0.2, width: this.buttonWidth, height: this.buttonHeight });
        this.cancelButton.setText('Cancel');
        this.cancelButton.setOnClickCallback(() => this.screenManager.hideLastOpenScreen());
        this.registerElement(this.cancelButton);

        this.createButton = new ScreenElementButton(this, this, { x : this.width / 4, y: -this.height / 2 + 0.2, width: this.buttonWidth, height: this.buttonHeight });
        this.createButton.setText('Create');
        this.createButton.setOnClickCallback(this.createRealm);
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
                // features: {
                //     type: 'button',
                //     buttonText: 'Features',
                //     ignoreLabel: true,
                //     disable: this.isCreating,
                //     callback: () => this.screenManager.showScreen(this.screenManager.screenFeatures, this.data.getData()),
                // },
                worldSettings: {
                    type: 'json',
                    label: 'World Settings',
                    items: {
                        terrainGeneratorType: {
                            type: 'list',
                            label: 'Terrain Type',
                            items: Object.values(REALM_WORLD_GENERATORS)
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
                this.createButton.setText('Create')
                this.data = new RealmData(args.data ? args.data.getData() : {})
                this.jsonTree.updateTree(this.data.getData(), this.updateData)
            }
            else
            {
                this.createButton.setText('Update')
                this.data = this.screenManager.conjure.getWorld().realm.realmData
                this.jsonTree.updateTree(this.data.getData(), this.updateData)
            }
        }
    }

    async createRealm()
    {
        if(this.isCreating)
        {
            await this.screenManager.conjure.getDataHandler().createRealm(this.data.getData())
            console.log('Successfully made realm!')
            this.screenManager.showScreen(this.screenManager.screenRealms)
        }
        else
        {
            await this.screenManager.conjure.getDataHandler().updateRealm(this.data.getData())
        }
    }

    updateData()
    {
        // console.log(this.data)
    }

    update(updateArgs)
    {
        super.update(updateArgs)
    }
}