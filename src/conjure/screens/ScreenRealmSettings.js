import ScreenBase from './ScreenBase';
import ScreenElementJSONTree from './elements/ScreenElementJSONTree'
import { REALM_TERRAIN_GENERATORS } from '../world/realm/RealmManager'

export default class ScreenRealmSettings extends ScreenBase
{  
    constructor(screenManager, args)
    {
        super(screenManager, args);

        this.group.add(this.background);

        this.updateRealmSettings = this.updateRealmSettings.bind(this)

        this.jsonTree = new ScreenElementJSONTree(this, this, { width: this.width, height: this.height, alwaysUpdate: true })
        this.registerElement(this.jsonTree);
        this.jsonTree.setSchema(this.getSchema());
    }

    getSchema()
    {
        return {
            type: 'json',
            label: 'name',
            items: {
                info: {
                    type: 'json',
                    label: 'Info',
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
                    }
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

    showScreen(active)
    {
        super.showScreen(active);
        this.jsonTree.setActive(active)
        if(active)
        {
            this.jsonTree.updateTree(this.screenManager.conjure.getWorld().realm.settings.settings, this.updateRealmSettings);
        }
    }

    updateRealmSettings()
    {
        this.screenManager.conjure.getWorld().realm.settings.updateSettings();
    }

    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster);
    }
}