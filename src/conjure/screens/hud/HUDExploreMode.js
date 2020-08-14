import ScreenBase from '../ScreenBase';
import HUDInteract, { INTERACT_TYPES } from './HUDInteract'
import { THREE } from 'enable3d'
import { REALM_PROTOCOLS } from '../../world/realm/RealmManager';

export default class HUDExploreMode extends ScreenBase
{  
    constructor(screenManager, args)
    {
        super(screenManager, args);

        this.crosshairSphere = new THREE.Mesh( new THREE.SphereGeometry( 0.005, 8, 8 ), new THREE.MeshLambertMaterial( {color: 0xffffff} ) );
        this.group.add(this.crosshairSphere)

        this.screenTitle.mesh.visible = false;

        this.interact = new HUDInteract(this)
        this.group.add(this.interact.group)


        this.screenManager.conjure.input.addKey('INTERACT', 'g');
    }

    showScreen(active)
    {
        super.showScreen(active);
    }

    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster);
        if(this.interact.object && input.isPressed('INTERACT'))
        {
            if(this.interact.type === INTERACT_TYPES.USER)
            {
                this.screenManager.screenUserPay.setUser(this.interact.object)
                this.screenManager.showScreen(this.screenManager.screenUserPay)
                this.screenManager.conjure.getWorld().realm.sendTo(REALM_PROTOCOLS.PROFILE.SERVICE.PAYID.REQUESTID, '', this.interact.object.peerID)
            }
            if(this.interact.type === INTERACT_TYPES.OBJECT && this.interact.object.userData.payID)
            {
                this.screenManager.screenUserPay.setObject(this.interact.object)
                this.screenManager.showScreen(this.screenManager.screenUserPay)
                // this.screenManager.conjure.getWorld().realm.sendTo(REALM_PROTOCOLS.PROFILE.SERVICE.PAYID.REQUESTID, '', this.interact.object.payID)
            }
        }
    }
}