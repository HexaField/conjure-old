import { THREE } from 'enable3d'
import Feature from "./Feature"

import { Water } from './Water2.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import Platform from '../Platform'  
import { easyOrigin } from '../../util/MeshTemplates';
// import SkyboxMilkyway from './SkyboxMilkyway'
// import VolumetricClouds from './VolumetricClouds'

export default class FeatureArtGallery extends Feature
{
    constructor(realm)
    {
        super(realm)
        this.swordTriggerEventProtocol = 'lookingglass.eventtrigger'
        this.triggerSwordEvent = this.triggerSwordEvent.bind(this)
        this.realm.addNetworkProtocolCallback(this.swordTriggerEventProtocol, this.triggerSwordEvent)
    }

    async preload()
    {
        // await this.getTokens()
        let assetCount = 10

        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (1/' + assetCount + ')')
        await this.realm.conjure.getAudioManager().load('jumanji', this.realm.conjure.assetURL + 'assets/sounds/jumanji.mp3')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (2/' + assetCount + ')')
        await this.realm.conjure.load.preload('lookingglass1', this.realm.conjure.assetURL + 'assets/models/lookingglass.glb')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (3/' + assetCount + ')')
        await this.realm.conjure.load.preload('grass1', this.realm.conjure.assetURL + 'assets/textures/grass1.jpg')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (4/' + assetCount + ')')
        await this.realm.conjure.load.preload('granite1', this.realm.conjure.assetURL + 'assets/textures/granite1.jpg')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (5/' + assetCount + ')')
        await this.realm.conjure.load.preload('granite2', this.realm.conjure.assetURL + 'assets/textures/granite2.jpg')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (6/' + assetCount + ')')
        await this.realm.conjure.load.preload('granite3', this.realm.conjure.assetURL + 'assets/textures/granite3.jpg')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (7/' + assetCount + ')')
        await this.realm.conjure.load.preload('rock1', this.realm.conjure.assetURL + 'assets/textures/rock1.jpg')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (8/' + assetCount + ')')
        await this.realm.conjure.load.preload('emerald1', this.realm.conjure.assetURL + 'assets/textures/emerald1.jpg')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (9/' + assetCount + ')')
        await this.realm.conjure.load.preload('sword', this.realm.conjure.assetURL + 'assets/models/chevalier/scene.gltf')
        this.realm.conjure.getLoadingScreen().setText('Loading Realm Assets\n (10/' + assetCount + ')')
        await this.realm.conjure.load.preload('mountains', this.realm.conjure.assetURL + 'assets/models/mountainring.glb')

        this.realm.conjure.getLoadingScreen().setText(`
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

        // setTimeout(()=>{}, 10000)
    }

    async unload()
    {
        this.platform.destroy()
    }

    async loadScene()
    {
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

        // this.clouds = new VolumetricClouds({
        //     threshold: 0.25,
        //     opacity: 0.25,
        //     range: 0.1,
        //     steps: 100,
        //     size: {
        //         x: 100,
        //         y: 20,
        //         z: 100,
        //     },
        // })
        // this.clouds.position.setY(100)
        // this.realm.group.add(this.clouds)


        // milkyway
        // this.skybox = new SkyboxMilkyway(this.realm.conjure.camera, { opacity: 0.5 })

        // init water

        this.waterGeometry = new THREE.PlaneBufferGeometry(4096, 4096);

        this.water = new Water( this.waterGeometry, {
            color: 0x6eacff,
            scale: 256,
            reflectivity: 0.9,
            flowDirection: new THREE.Vector2(0.25, 0.25),
            textureWidth: 1024, 
            textureHeight: 1024
        } );

        this.water.position.y = 2;
        this.water.rotation.x = Math.PI * - 0.5;
        this.realm.group.add(this.water);

        this.mountains = await this.realm.conjure.load.gltf('mountains')
        this.realm.group.add(this.mountains.scene)

        this.sceneModel = await this.realm.conjure.load.gltf('lookingglass1')
        // console.log(this.sceneModel)
        
        for(let child of this.sceneModel.scene.children)
        {
            child.geometry.computeVertexNormals()
            this.realm.conjure.physics.add.existing(child, { shape:'concaveMesh', mass:0  })
        }
        // console.log(this.sceneModel.scene)
        this.realm.group.add(this.sceneModel.scene)


        let grassTex = await this.realm.conjure.load.texture('grass1')
        grassTex.wrapS = THREE.MirroredRepeatWrapping
        grassTex.wrapT = THREE.MirroredRepeatWrapping
        grassTex.repeat.set( 2, 2 )
        let grassMat = new THREE.MeshStandardMaterial({ map: grassTex})
        this.sceneModel.scene.children[0].material = grassMat
        

        let granite1Tex = await this.realm.conjure.load.texture('granite1')
        granite1Tex.wrapS = THREE.MirroredRepeatWrapping
        granite1Tex.wrapT = THREE.MirroredRepeatWrapping
        granite1Tex.repeat.set( 4, 4 )
        let granite1Mat = new THREE.MeshStandardMaterial({ map: granite1Tex})
        this.sceneModel.scene.children[5].material = granite1Mat
        this.sceneModel.scene.children[9].material = granite1Mat


        let granite2Tex = await this.realm.conjure.load.texture('granite2')
        granite2Tex.wrapS = THREE.MirroredRepeatWrapping
        granite2Tex.wrapT = THREE.MirroredRepeatWrapping
        granite2Tex.repeat.set( 1, 1 )
        let granite2Mat = new THREE.MeshStandardMaterial({ map: granite2Tex})
        this.sceneModel.scene.children[6].material = granite2Mat
        this.sceneModel.scene.children[4].material = granite2Mat
        this.sceneModel.scene.children[7].material = granite2Mat

        let granite3Tex = await this.realm.conjure.load.texture('granite3')
        granite3Tex.wrapS = THREE.MirroredRepeatWrapping
        granite3Tex.wrapT = THREE.MirroredRepeatWrapping
        granite3Tex.repeat.set( 8, 8 )
        let granite3Mat = new THREE.MeshStandardMaterial({ map: granite3Tex})
        this.mountains.scene.children[0].material = granite3Mat

        let rock1Tex = await this.realm.conjure.load.texture('rock1')
        rock1Tex.wrapS = THREE.MirroredRepeatWrapping
        rock1Tex.wrapT = THREE.MirroredRepeatWrapping
        rock1Tex.repeat.set( 1, 1 )  
        let rock1Mat = new THREE.MeshStandardMaterial({ map: rock1Tex})
        this.sceneModel.scene.children[2].material = rock1Mat
        this.sceneModel.scene.children[3].material = rock1Mat
        this.sceneModel.scene.children[8].material = rock1Mat

        let emerald1Tex = await this.realm.conjure.load.texture('emerald1')
        emerald1Tex.wrapS = THREE.MirroredRepeatWrapping
        emerald1Tex.wrapT = THREE.MirroredRepeatWrapping
        emerald1Tex.repeat.set( 1, 1 )  
        let emerald1Mat = new THREE.MeshPhysicalMaterial({
            map: emerald1Tex,
            color: 0x00ff00,
            metalness: 0,
            roughness: 0,
            opacity: 0.25,
            transparent: true,
            side: THREE.DoubleSide,
            premultipliedAlpha: true

        })
        this.sceneModel.scene.children[10].material = emerald1Mat    

        this.flyingLights = []
        for(let i = 0; i < 100; i++)
        {
            let light = new THREE.PointLight(0xbfff83, 1, 20, 2)
            let sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.05), new THREE.MeshBasicMaterial({ color: 0xbfff83 }))
            sphere.add(light)
            sphere.position.set(50-(Math.random() * 50), 30+(Math.random() * 10),50-(Math.random() * 100))
            this.realm.group.add(sphere)
            sphere.userData.velocity = new THREE.Vector3()
            this.flyingLights.push(sphere)
        }

        this.sword = await this.realm.conjure.load.gltf('sword')
        this.sword.scene.position.set(0, 0, 0)
        console.log(this.sword.scene)
        this.sword.scene.children[0].scale.set(0.75, 0.75, 0.75)
        this.sword.scene.children[0].position.set(0.025, -0.55, -0.025)
        this.sword.scene.children[0].rotateX(Math.PI / 2)
        // this.sword.scene.add(easyOrigin())
        this.realm.world.user.attachToBone(this.sword.scene, this.realm.world.user.rightHand)
        this.sword.scene.position.set(0, 0, 0)

        this.sword.scene.traverse(o => {
            if (o.isMesh) this.swordMesh = o
        })
        
        this.swordMesh.frustumCulled = false;
        this.swordMesh.material.visible = false
        this.sword.scene.rotateX(Math.PI / 24)
        // this.sword.scene.rotateY(-Math.PI / 8)
        this.sword.scene.rotateZ(-Math.PI / 12)
            
    }

    giveSword()
    {
        if(this.realm.world.user.hasSword) return

        this.swordMesh.material.visible = true
        this.realm.world.user.hasSword = true
        this.realm.world.user.setAction('unsheath', 0.1, true)
    }

    async load()
    {
        this.realm.conjure.getAudioManager().play('jumanji', { loop: true })
    }

    async getTokens()
    {
        let address = 'r4sYcbdi4oE18FhVYWEhXa1AEe21XGR39z'
        let txlist = await (await fetch('https://data.ripple.com/api/v2/address/' + address)).json()
        console.log(txlist)
    }

    update(updateArgs)
    {
        if(updateArgs.input.isPressed('U', true, true))
        {
            this.realm.sendData(this.swordTriggerEventProtocol)
            this.triggerSwordEvent()
        }
        for(let light of this.flyingLights)
        {
            light.userData.velocity.x += (Math.random()-0.5)*0.005
            light.userData.velocity.y += (Math.random()-0.5)*0.005
            light.userData.velocity.z += (Math.random()-0.5)*0.005
            light.position.add(light.userData.velocity)
        }
    }

    triggerSwordEvent()
    {
        this.giveSword()
        // this.sky.
    }
}