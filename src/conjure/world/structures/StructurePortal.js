import { THREE, ExtendedObject3D } from 'enable3d'
import TextRenderer3D from '../../screens/text/TextRenderer3D';

export default class Gallery
{  
    constructor(conjure, parentGroup, params = {})
    {
        this.conjure = conjure
        this.portalWidth = params.portalWidth || 1; // X
        this.portalHeight = params.portalHeight || 1; // Y
        this.portalLength = params.portalLength || 1; // Z

        this.group = new THREE.Group();
        this.group.position.set(params.position.x, params.position.y, params.position.z)
        this.group.lookAt(0, 0, 0)
        parentGroup.add(this.group);

        this.portalMaterial = new THREE.MeshBasicMaterial({ visible: false })

        this.portalEntered = false

        this.portal = new THREE.Mesh(new THREE.BoxBufferGeometry(this.portalWidth, this.portalLength, this.portalHeight),  this.portalMaterial)
        this.group.add(this.portal);
        if(params.realmID !== '')
        {
            conjure.physics.add.existing(this.group, { collisionFlags: 6, mass: 0 })
            this.group.body.on.collision((otherObject, event) => {
                if(this.portalEntered)
                    return
                this.portalEntered = true
                
                if (otherObject === this.conjure.getWorld().user.group)
                    this.conjure.world.joinRealmByID(params.realmID)
            })
        }


        this.nameplate = new TextRenderer3D(conjure, this.group, { text: params.realmID });
        this.nameplate.group.position.setY(1)
        this.nameplate.group.scale.setScalar(4)
    }

    destroy()
    {
        if(this.group.body)
            this.conjure.physics.destroy(this.group.body)
        this.group.parent.remove(this.group)
    }
}