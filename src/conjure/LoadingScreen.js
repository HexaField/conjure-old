import TextRenderer3D from './screens/text/TextRenderer3D'
import { THREE } from 'enable3d'

export default class LoadingScreen
{
    constructor(conjure)
    {
        this.conjure = conjure
        this.init()
    }

    init()
    {
        this.renderer = new THREE.WebGLRenderer({alpha:true, antialias:true})
        this.renderer.setClearColor( 0x000000, 0.0);
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
        this.renderer.domElement.style.position = 'absolute';
        this.renderer.domElement.style.outline = 'none'; // required
        this.renderer.domElement.style.top = 0;
        this.renderer.domElement.style.zIndex = -1; // required
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        document.body.appendChild( this.renderer.domElement );

        this.camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 100 );
    
        this.scene = new THREE.Scene()
    }

    create()
    {
        this.textObj = new TextRenderer3D(this.conjure, this.scene, { text: "Loading...", colour: 0x2685ff });
        // this.textObj.group.position.setY(0.25)
        this.camera.position.set(0, 0, 1)
        this.camera.lookAt(0,0,0)
    }

    setText(text)
    {
        this.textObj.setText(text)
    }

    update()
    {
        this.renderer.render(this.scene, this.camera)
    }
}