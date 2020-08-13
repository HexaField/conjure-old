import { THREE, ExtendedGroup } from 'enable3d'
import RealmInfo from './RealmInfo'

export default class RealmManager
{  
    constructor(realmManager)
    {
        this.realmManager = realmManager
        this.world = world
        this.conjure = this.world.conjure

        this.realmInfo = new RealmInfo()
    }

    async loadRealm()
    {
        
    }

    // { delta, input, mouseRaycaster, worldRaycaster }
    update(args)
    {

    }
}