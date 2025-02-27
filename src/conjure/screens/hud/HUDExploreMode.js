import ScreenBase from '../ScreenBase';
import HUDInteract from './HUDInteract'
import { THREE } from 'enable3d'

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
    }

    showScreen(active)
    {
        super.showScreen(active);
    }

    update(updateArgs)
    {
        super.update(updateArgs);
        this.interact.update(updateArgs)
    }
}