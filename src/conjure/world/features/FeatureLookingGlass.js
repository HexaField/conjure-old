import { THREE } from 'enable3d'
import Feature from "./Feature"

import { Water } from './Water2.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import Platform from '../Platform'  
import SkyboxMilkyway from './SkyboxMilkyway'

export default class FeatureArtGallery extends Feature
{
    constructor(realm)
    {
        super(realm)
    }

    async load()
    {
        console.log('Loading act i...')
        await this.loadScene()
    }

    async unload()
    {
        this.platform.destroy()
    }

    async loadScene()
    {
        this._tempLand = new THREE.Mesh(new THREE.SphereBufferGeometry(64, 24, 24), new THREE.MeshStandardMaterial({ color: 0x3bff18 }))
        this._tempLand.scale.set(1, 0.1, 1)
        this._tempLand.position.setY(-6)
        this.realm.group.add(this._tempLand);
        this.realm.conjure.physics.add.existing(this._tempLand, { shape:'mesh', collisionFlags: 2 })

        this.platform = new Platform(this.realm.conjure, this.realm.group, { size: 1024, pos: new THREE.Vector3(0, -1, 0) })
        this.platform.floor.visible = false
        this.platform.worldNameText.group.visible = false

        // init sky

        this.sky = new Sky();   
        this.sky.scale.setScalar(450000);
        this.realm.group.add(this.sky);

        var uniforms = this.sky.material.uniforms;
        uniforms[ "turbidity" ].value = 0.2;
        uniforms[ "rayleigh" ].value = 0.01;
        uniforms[ "mieCoefficient" ].value = 0.005;
        uniforms[ "mieDirectionalG" ].value = 0.8;

        uniforms[ "sunPosition" ].value.copy(this.realm.conjure.sunPos);

        // milkyway
        this.skybox = new SkyboxMilkyway(this.realm.group, { opacity: 0.5 })

        // init water

        this.waterGeometry = new THREE.PlaneBufferGeometry(512, 512);

        this.water = new Water( this.waterGeometry, {
            color: 0x6eacff,
            scale: 64,
            reflectivity: 0.8,
            flowDirection: new THREE.Vector2(0.25, 0.25),
            textureWidth: 1024,
            textureHeight: 1024
        } );

        this.water.position.y = 0;
        this.water.rotation.x = Math.PI * - 0.5;
        this.realm.group.add(this.water);
    }

    update(updateArgs)
    {
    }
}