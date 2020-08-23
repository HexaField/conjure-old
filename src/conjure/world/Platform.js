
import { THREE, ExtendedObject3D } from 'enable3d'
import TextRenderer3D from '../screens/text/TextRenderer3D';

export default class Platform
{  
    constructor(conjure, parentGroup)
    {
        this.conjure = conjure
        this.platformSize = 10;
        this.parentGroup = parentGroup


        this.worldNameText = new TextRenderer3D(this.conjure, this.parentGroup, { text: 'Local Realm', width: 5, scale: 10 });
        this.worldNameText.group.position.set(0, 5, 0);

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
        this.parentGroup.remove(this.worldNameText.group)
    }
}