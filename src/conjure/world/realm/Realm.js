import { THREE, ExtendedGroup } from 'enable3d'
import RealmData from './RealmData'

export default class RealmManager
{  
    constructor(realmManager)
    {
        this.realmManager = realmManager
        this.world = world
        this.conjure = this.world.conjure

        this.realmData = new RealmData()
    }

    async loadRealm()
    {
        
    }

    // { delta, input, mouseRaycaster, worldRaycaster }
    update(args)
    {

    }
}