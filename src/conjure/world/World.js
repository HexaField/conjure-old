import { THREE, ExtendedGroup } from 'enable3d'
import RealmManager from './realm/RealmManager'
import User from '../user/User'
import Platform from './Platform'

export default class World
{  
    constructor(conjure)
    {
        this.conjure = conjure
        this.scene = this.conjure.scene

        this.group = new ExtendedGroup()
        this.scene.add(this.group)

        this.realmManager = new RealmManager(this)
        this.user = new User(conjure);

        this.platform = new Platform(this.conjure, this.group);
    }

    sendData()
    {
        
    }


    async loadRealm()
    {

    }

    // { delta, input, mouseRaycaster, worldRaycaster }
    update(args)
    {

    }
}