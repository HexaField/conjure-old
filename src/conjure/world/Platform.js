
import { THREE, ExtendedObject3D } from 'enable3d'

export default class Terrain
{  
    constructor(conjure, parentGroup)
    {
        this.conjure = conjure
        this.platformSize = 10;
        this.parentGroup = parentGroup

        this.floor = new ExtendedObject3D()
        this.floor.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(this.platformSize, this.platformSize), new THREE.MeshBasicMaterial({side:THREE.DoubleSide})));
        this.floor.rotateX(Math.PI / 2)
        this.parentGroup.add(this.floor);
        conjure.physics.add.existing(this.floor, {shape:'plane', collider:{margin:0.01}, collisionFlags:1, mass:0})
    }

    destroy()
    {
        this.conjure.physics.destroy(this.floor.body)
        this.parentGroup.remove(this.floor)
    }
}