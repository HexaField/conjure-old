import { THREE, ExtendedGroup } from 'enable3d'
import RealmManager from './realm/RealmManager'

export default class World
{  
    constructor(conjure)
    {
        this.conjure = conjure
        this.scene = this.conjure.scene

        this.group = new ExtendedGroup()
        this.scene.add(this.group)

        this.realmManager = new RealmManager(this)
    }


    async loadRealm()
    {

    }

    // { delta, input, mouseRaycaster, worldRaycaster }
    update(args)
    {

    }
}