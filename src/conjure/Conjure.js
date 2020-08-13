import { Project, Scene3D, PhysicsLoader, THREE } from 'enable3d'
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js'
import Input from './Input' 
import World from './world/World'
import Profile from './user/Profile'
import ControlManager, { CONTROL_SCHEME } from './controls/ControlManager'
import ScreenManager from './screens/ScreenManager'
import PostProcessing from './PostProcessing'
import LoadingScreen from './LoadingScreen'
import AssetManager from './AssetManager';
import Fonts from './screens/text/Fonts'

export const CONJURE_MODE = {
    LOADING: 'Loading',
    EXPLORE: 'Explore',
    CONJURE: 'Conjure',
}

export default class Conjure extends Scene3D
{
    constructor()
    {
        super('Conjure')
    }

    async preload()
    {
        await this.load.preload('playerModel', 'assets/models/ybot_anims.glb')
        await this.load.preload('missing_texture', 'assets/textures/missing_texture.png')
        await this.load.preload('menger_texture', 'assets/textures/menger_texture.png')
        await this.load.preload('ponder_texture', 'assets/textures/ponder_texture.png')
        await this.load.preload('default_texture', 'assets/textures/default_texture.png')
    }

    async init()
    {
        global.THISFRAME = Date.now()
        this.loadTimer = global.THISFRAME
        this.conjureMode = CONJURE_MODE.LOADING

        this.initRenderer()
        this.initCamera()
        this.initScene()

        this.resizeCanvas = this.resizeCanvas.bind(this)
        window.onresize = this.resizeCanvas

        this.mouseRaycaster = new THREE.Raycaster()
        this.worldRaycaster = new THREE.Raycaster()

        this.vec3 = new THREE.Vector3()
        this.vec2 = new THREE.Vector2()
        this.quat = new THREE.Quaternion()

        this.input = new Input(this)
    }

    initRenderer()
    {
        this.renderer.outputEncoding = THREE.sRGBEncoding
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1
        this.renderer.setPixelRatio(DPR)
        this.renderer.toneMapping = THREE.ReinhardToneMapping

        this.renderer.setClearColor( 0x000000, 1.0)
        this.renderer.domElement.style.position = 'absolute' // required
        this.renderer.domElement.style.outline = 'none' // required
        this.renderer.domElement.style.zIndex = 0 // required
        this.renderer.domElement.style.top = 0 
        this.renderer.domElement.style.background = ''

        this.rendererCSS = new CSS3DRenderer({alpha: true, antialias: true})
        this.rendererCSS.setSize( window.innerWidth, window.innerHeight )
        this.rendererCSS.domElement.style.position = 'absolute'
        this.rendererCSS.domElement.style.outline = 'none' // required
        this.rendererCSS.domElement.style.top = 0
        this.rendererCSS.domElement.style.zIndex = 10000
        document.body.appendChild(this.rendererCSS.domElement)

        this.postProcessing = new PostProcessing(this);
    }

    initCamera()
    {
        this.camera.fov = 80
        this.camera.near = 0.1
        this.camera.far = 2000 

        this.cameraFollow = new THREE.Group()
        this.cameraFollow.position.setZ(-0.25)
        this.debugBall = new THREE.Mesh(new THREE.SphereBufferGeometry(0.1), new THREE.MeshBasicMaterial())
        this.cameraFollow.add(this.debugBall)
        this.camera.add(this.cameraFollow)

        this.cameraTrack = new THREE.Group()
        this.scene.add(this.cameraTrack)

        this.cameraScreenAttach = new THREE.Group()
        this.cameraScreenAttach.scale.set(0.2, 0.2, 0.2)
        this.scene.add(this.cameraScreenAttach)
    }

    initScene()
    {
        this.sceneCSS = new THREE.Scene()

        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61)
        hemiLight.position.set(0, 50, 0)
        this.scene.add(hemiLight)

        let d = 8.25
        let dirLight = new THREE.DirectionalLight(0xffffff, 0.54)
        dirLight.position.set(-8, 12, 8)
        dirLight.castShadow = true
        dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024)
        dirLight.shadow.camera.near = 0.1
        dirLight.shadow.camera.far = 1500
        dirLight.shadow.camera.left = d * -1
        dirLight.shadow.camera.right = d
        dirLight.shadow.camera.top = d
        dirLight.shadow.camera.bottom = d * -1
        this.scene.add(dirLight)
    }

    async create()
    {
        this.fonts = new Fonts()

        console.log('Took', (Date.now() - this.loadTimer)/1000, ' seconds to load.')
        this.loadingScreen.setText('Loading default assets...')
        this.assetManager = new AssetManager(this)

        await this.assetManager.createDefaultAssets(); // we want to do this now as some screens may use default assets or grab references in initialisation
        
        this.localProfile = new Profile(this)
        
        this.world = new World(this)
        this.controls = new ControlManager(this)
        this.screenManager = new ScreenManager(this)

        this.resizeCanvas() // trigger this to set up screen anchors
        this.screenManager.hudGlobal.showScreen(true)
        global.CONSOLE.addWatchItem('Connected Peers', this.networkInfo, 'peersCount')
        global.CONSOLE.addWatchItem('Online Users', this.conjureDatabase.network.roomStats, 'peersCount')

        this.loadingScreen.setText('Loading World...')
        // Now load stuff in
        this.setConjureMode(CONJURE_MODE.LOADING)
        await this.localProfile.loadFromDatabase()
        await this.localProfile.initialiseServices()
        await this.conjureDatabase.load()
        await this.world.loadWorld() // loads local realm
        this.setConjureMode(CONJURE_MODE.EXPLORE)

        this.loadInfo = document.getElementById( 'loadInfo' )
        this.loadInfo.hidden = true
        
        global.CONSOLE.log('Took', (Date.now() - this.loadTimer)/1000, ' seconds to load.')
    }

    getWorld() { return this.world }
    getScreens() { return this.screenManager }
    getControls() { return this.controls }

    toggleConjureMode()
    {
        if(this.conjureMode === CONJURE_MODE.LOADING) return
        
        this.setConjureMode(this.conjureMode === CONJURE_MODE.EXPLORE ? CONJURE_MODE.CONJURE : CONJURE_MODE.EXPLORE)
    }

    setConjureMode(mode)
    {
        this.conjureMode = mode
        switch(mode)
        {
            default: case CONJURE_MODE.LOADING: 
                this.controls.enableCurrentControls(false)
                this.screenManager.hideHud()

            break;

            case CONJURE_MODE.EXPLORE: 
                this.controls.setControlScheme(CONTROL_SCHEME.AVATAR)
                this.screenManager.showHud()

            break;

            case CONJURE_MODE.CONJURE:
                this.controls.setControlScheme(CONTROL_SCHEME.ORBIT)
                this.screenManager.showHud()
            break;
        }
    }
    
    _update()
    {
        const delta = this.clock.getDelta() * 1000
        const time = this.clock.getElapsedTime()
    
        this.update(parseFloat(time.toFixed(3)), parseInt(delta.toString()))
        
        this.physics.update(delta)
        this.physics.updateDebugger()
        
        this.animationMixers.update(delta)
        this.renderer.render(this.scene, this.camera)
        this.postProcessing.render()
        this.rendererCSS.render(this.sceneCSS, this.camera)
    }

    update(time, delta)
    {
        let deltaSeconds = delta / 1000
        
        this.input.update()

        if(this.input.isPressed('l', true))
        {
            if(this.physics.debugDrawer.enabled)
                this.physics.debug.disable()
            else
                this.physics.debug.enable()
        }

        this.mouseRaycaster.setFromCamera(this.input.mouse, this.camera)
        this.worldRaycaster.setFromCamera(this.vec2, this.camera)
    
        // update controls

        this.world.update({ delta: deltaSeconds, input: this.input, mouseRaycaster: this.mouseRaycaster, worldRaycaster: this.worldRaycaster })

        this.cameraScreenAttach.position.copy(this.cameraFollow.getWorldPosition(this.vec3))
        this.cameraScreenAttach.quaternion.copy(this.cameraFollow.getWorldQuaternion(this.quat))

        // update screens

        this.camera.updateMatrix() // TODO: check if this is necessary
    }

    resizeCanvas()
    {
        this.canvas.width  = window.innerWidth
        this.canvas.height = window.innerHeight

        this.canvas.style.width = '100%'
        this.canvas.style.height= '100%'
        
        this.canvasHalfWidth = Math.round(this.canvas.width/2)
        this.canvasHalfHeight = Math.round(this.canvas.height/2)

        const { width, height } = this.canvas   

        let ratio = width / height
        this.camera.aspect = ratio
        this.camera.updateProjectionMatrix()
        
        this.renderer.setSize(width, height)
        this.loadingScreen.renderer.setSize(width, height)
        this.rendererCSS.setSize(width, height)
        this.postProcessing.composer.setSize(width, height)
        if(this.screenManager)
            this.screenManager.resizeScreens(ratio)
        // this.postProcessing.effectFXAA.uniforms['resolution'].value.set(1 / this.canvas.width, 1 / this.canvas.height)
    }
}

const config = {
    scenes: [Conjure],
    renderer: new THREE.WebGLRenderer({ alpha: true, antialias: true }),
    gravity: { x: 0, y: -9.81, z: 0},
    maxSubSteps: 100,
    fixedTimeStep: 1 / 180
  }

PhysicsLoader('lib', () => new Project(config))