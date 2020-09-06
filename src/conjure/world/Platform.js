
import { THREE, ExtendedObject3D } from 'enable3d'
import TextRenderer3D from '../screens/text/TextRenderer3D';
import { Vector3 } from 'three/build/three.module';

export default class Platform
{  
    constructor(conjure, parentGroup, args = {})
    {
        this.conjure = conjure
        this.platformSize = args.size || 10;
        this.pos = args.pos || new Vector3();
        this.parentGroup = parentGroup


        this.worldNameText = new TextRenderer3D(this.conjure, this.parentGroup, { text: args.platformLabel || '', width: 5, scale: 10 });
        this.worldNameText.group.position.set(0, 5, 0);

        this.floor = new ExtendedObject3D()
        this.floor.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(this.platformSize, this.platformSize), new THREE.MeshBasicMaterial({side:THREE.DoubleSide})));
        this.floor.rotateX(Math.PI / 2)
        this.floor.position.copy(this.pos)
        this.parentGroup.add(this.floor);
        conjure.physics.add.existing(this.floor, {shape:'plane', collider:{margin:0.01}, collisionFlags:1, mass:0})
    }

    destroy()
    {
        this.conjure.physics.destroy(this.floor.body)
        this.parentGroup.remove(this.floor)
        this.parentGroup.remove(this.worldNameText.group)
    }
}