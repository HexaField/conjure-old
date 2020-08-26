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
        // this.realm.conjure.loadingScreen.textObj.getObject().scale.set(0.4,0.4,0.4)
        this.realm.conjure.loadingScreen.setText('Loading Realm Assets...')
        await this.realm.conjure.load.preload('lookingglass1', this.realm.conjure.assetURL + 'assets/models/lookingglass.glb')
        
        await this.realm.conjure.load.preload('grass1', this.realm.conjure.assetURL + 'assets/textures/grass1.jpg')
        await this.realm.conjure.load.preload('granite1', this.realm.conjure.assetURL + 'assets/textures/granite1.jpg')
        await this.realm.conjure.load.preload('granite2', this.realm.conjure.assetURL + 'assets/textures/granite2.jpg')
        await this.realm.conjure.load.preload('granite3', this.realm.conjure.assetURL + 'assets/textures/granite3.jpg')
        await this.realm.conjure.load.preload('rock1', this.realm.conjure.assetURL + 'assets/textures/rock1.jpg')
        await this.realm.conjure.load.preload('emerald1', this.realm.conjure.assetURL + 'assets/textures/emerald1.jpg')
        this.realm.conjure.loadingScreen.setText(`
THE ETHEREAL REALM
WETWARE INC.

'THE ENTS MARCH TO WAR'

Written by
Ponderjaunt

Produced by
Free Markets & Liberty

REALMS CREATED WITH CONJURE ENGINE

COPYWRONG /©/ 1984 ALL RIGHTS CANCELLED. BY PONDERJAUNT & THE FOREST.
THIS PROGRAM IS PROTECTED UNDER THE LAWS OF THE INCORPORATED UNITED STATES
AND OTHER BANKS. ILLEGAL DISTROBUTION MAY RESULT IN INCREDIBLE CIVIL VALUE
AND ECONOMIC EPOCHAL SHIFTS.`)
        await this.loadScene()
        setTimeout(()=>{}, 10000)
    }

    async unload()
    {
        this.platform.destroy()
    }

    async loadScene()
    {
        // this._tempLand = new THREE.Mesh(new THREE.SphereBufferGeometry(64, 24, 24), new THREE.MeshStandardMaterial({ color: 0x3bff18 }))
        // this._tempLand.scale.set(1, 0.1, 1)
        // this._tempLand.position.setY(-6)
        // this.realm.group.add(this._tempLand);
        // this.realm.conjure.physics.add.existing(this._tempLand, { shape:'concaveMesh', mass:0  })

        this.platform = new Platform(this.realm.conjure, this.realm.group, { size: 1024, pos: new THREE.Vector3(0, 1, 0) })
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
        // this.skybox = new SkyboxMilkyway(this.realm.conjure.camera, { opacity: 0.5 })

        // init water

        this.waterGeometry = new THREE.PlaneBufferGeometry(2048, 2048);

        this.water = new Water( this.waterGeometry, {
            color: 0x6eacff,
            scale: 256,
            reflectivity: 0.8,
            flowDirection: new THREE.Vector2(0.25, 0.25),
            textureWidth: 1024, 
            textureHeight: 1024
        } );

        this.water.position.y = 2;
        this.water.rotation.x = Math.PI * - 0.5;
        this.realm.group.add(this.water);

        this.sceneModel = await this.realm.conjure.load.gltf('lookingglass1')
        
        for(let child of this.sceneModel.scene.children)
        {
            child.geometry.computeVertexNormals()
            this.realm.conjure.physics.add.existing(child, { shape:'concaveMesh', mass:0  })
        }
        // console.log(this.sceneModel.scene)
        this.realm.group.add(this.sceneModel.scene)


        let grassTex = await this.realm.conjure.load.texture('grass1')
        grassTex.wrapS = THREE.RepeatWrapping
        grassTex.wrapT = THREE.RepeatWrapping
        grassTex.repeat.set( 32, 32 )
        let grassMat = new THREE.MeshStandardMaterial({ map: grassTex})
        this.sceneModel.scene.children[0].material = grassMat
        this.sceneModel.scene.children[13].material = grassMat
        this.sceneModel.scene.children[14].material = grassMat
        this.sceneModel.scene.children[15].material = grassMat
        

        let granite1Tex = await this.realm.conjure.load.texture('granite1')
        granite1Tex.wrapS = THREE.RepeatWrapping
        granite1Tex.wrapT = THREE.RepeatWrapping
        // granite1Tex.repeat.set( 1, 4 )
        let granite1Mat = new THREE.MeshStandardMaterial({ map: granite1Tex})
        this.sceneModel.scene.children[5].material = granite1Mat
        this.sceneModel.scene.children[11].material = granite1Mat


        let granite2Tex = await this.realm.conjure.load.texture('granite2')
        granite2Tex.wrapS = THREE.RepeatWrapping
        granite2Tex.wrapT = THREE.RepeatWrapping
        // granite2Tex.repeat.set( 1, 1 )
        let granite2Mat = new THREE.MeshStandardMaterial({ map: granite2Tex})
        this.sceneModel.scene.children[6].material = granite2Mat
        this.sceneModel.scene.children[12].material = granite2Mat

        let granite3Tex = await this.realm.conjure.load.texture('granite3')
        granite3Tex.wrapS = THREE.RepeatWrapping
        granite3Tex.wrapT = THREE.RepeatWrapping
        // granite3Tex.repeat.set( 1, 1 )
        let granite3Mat = new THREE.MeshStandardMaterial({ map: granite3Tex})
        this.sceneModel.scene.children[7].material = granite3Mat
        this.sceneModel.scene.children[9].material = granite3Mat

        let rock1Tex = await this.realm.conjure.load.texture('rock1')
        rock1Tex.wrapS = THREE.RepeatWrapping
        rock1Tex.wrapT = THREE.RepeatWrapping
        // rock1Tex.repeat.set( 1, 1 )  
        let rock1Mat = new THREE.MeshStandardMaterial({ map: rock1Tex})
        this.sceneModel.scene.children[2].material = rock1Mat
        this.sceneModel.scene.children[3].material = rock1Mat
        this.sceneModel.scene.children[4].material = rock1Mat
        this.sceneModel.scene.children[10].material = rock1Mat
        this.sceneModel.scene.children[16].material = rock1Mat

        let emerald1Tex = await this.realm.conjure.load.texture('emerald1')
        emerald1Tex.wrapS = THREE.RepeatWrapping
        emerald1Tex.wrapT = THREE.RepeatWrapping
        // emerald1Tex.repeat.set( 1, 1 )  
        let emerald1Mat = new THREE.MeshStandardMaterial({ map: emerald1Tex})
        this.sceneModel.scene.children[8].material = emerald1Mat    

        this.flyingLights = []
        for(let i = 0; i < 100; i++)
        {
            let light = new THREE.PointLight(0xbfff83, 2, 10)
            let sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0xbfff83 }))
            sphere.add(light)
            sphere.position.set(100-(Math.random() * 200), Math.random() * 30, 100-(Math.random() * 200))
            this.realm.group.add(sphere)
            sphere.userData.velocity = new THREE.Vector3()
            this.flyingLights.push(sphere)
        }
    }

    update(updateArgs)
    {
        for(let light of this.flyingLights)
        {
            light.userData.velocity.x += (Math.random()-0.5)*0.005
            light.userData.velocity.y += (Math.random()-0.5)*0.005
            light.userData.velocity.z += (Math.random()-0.5)*0.005
            light.position.add(light.userData.velocity)
        }
    }
}