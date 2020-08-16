import ScreenBase from './ScreenBase'
import ScreenElementJSONTree from './elements/ScreenElementJSONTree'
import { REALM_TERRAIN_GENERATORS, REALM_VISIBILITY } from '../world/realm/RealmInfo'
import RealmInfo from '../world/realm/RealmInfo'

export default class ScreenRealmSettings extends ScreenBase
{  
    constructor(screenManager, args)
    {
        super(screenManager, args)

        this.group.add(this.background)

        this.updateRealm = this.updateRealm.bind(this)
        this.updateNewRealm = this.updateNewRealm.bind(this)
        this.isCreating = false

        this.jsonTree = new ScreenElementJSONTree(this, this, { width: this.width, height: this.height, alwaysUpdate: true })
        this.registerElement(this.jsonTree)
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
                this.info = new RealmInfo()
                this.jsonTree.updateTree(this.info.getInfo(), this.updateNewRealm)
            }
            else
                this.jsonTree.updateTree(this.screenManager.conjure.getWorld().realm.settings.settings, this.updateRealm)
        }
    }

    updateNewRealm()
    {
        
    }

    updateRealm()
    {
        this.screenManager.conjure.getWorld().realm.settings.updateSettings()
    }

    update(updateArgs)
    {
        super.update(updateArgs)
    }
}