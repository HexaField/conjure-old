import TextRenderer3D from './screens/text/TextRenderer3D'
import { THREE } from 'enable3d'
import ThreeEditableText from 'three-typeable-text'

export default class LoadingScreen
{
    constructor(conjure)
    {
        this.conjure = conjure
        this.passcodeLoseFocus = this.passcodeLoseFocus.bind(this)
        this.active = false
        this.passcodeCallback = undefined
        this.init()
    }

    init()
    {
        this.renderer = new THREE.WebGLRenderer()
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

    setPasscodeCallback(callback)
    {
        this.passcodeCallback = callback
    }

    passcodeLoseFocus(focus)
    {
        if(!focus && this.active)
        {
            if(this.passcodeCallback)
            this.passcodeCallback(this.passcodeTextEntry.getText())
            this.passcodeTextEntry.actionFocus(true)
        }
    }

    setPasscodeVisible(visible)
    {
        this.passcodeText.getObject().visible = visible
        this.passcodeTextEntry.getObject().visible = visible
        this.passcodeTextEntry.actionFocus(true)
    }

    create()
    {
        this.passcodeTextEntry = new ThreeEditableText({onFocus: this.passcodeLoseFocus, camera: this.camera, font: this.conjure.getFont('System'), align: 'left', string: "", material: new THREE.MeshBasicMaterial({ color:0x00ff00 }) });
        this.passcodeText = new ThreeEditableText({useDocumentListeners: false, font: this.conjure.getFont('System'), align: 'right', string: "Enter Passcode > ", material: new THREE.MeshBasicMaterial({ color:0x00ff00 }) });
        this.textObj = new ThreeEditableText({useDocumentListeners: false, font: this.conjure.getFont('System'), string: "", material: new THREE.MeshBasicMaterial({ color:0x00ff00 }) });
        
        this.passcodeText.getObject().position.set(0.25, -4, 0)
        this.passcodeTextEntry.getObject().position.set(-0.25, -4, 0)

        this.setPasscodeVisible(false)

        this.camera.position.set(0, 0, 50)
        this.camera.lookAt(0,0,0)
        
        this.scene.add(this.passcodeTextEntry.getObject())
        this.scene.add(this.passcodeText.getObject())
        this.scene.add(this.textObj.getObject())
    }

    setText(text)
    {
        this.textObj.setText(text)
        if(text.includes('\n'))
            this.textObj.getObject().position.setY((this.textObj._line_height * text.match(/\n/g).length))
        else
            this.textObj.getObject().position.setY(0)
        this.update()
    }

    async awaitInput()
    {
        return new Promise((resolve, reject) => {
            document.addEventListener('click', () => { return resolve() })
        })
    }

    update()
    {
        this.renderer.render(this.scene, this.camera)
        this.passcodeTextEntry.updateCursor()
    }
}