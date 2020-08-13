import ScreenBase from './ScreenBase';
import { THREE } from 'enable3d'
import { Vector2 } from 'three'
import ScreenElementText from './elements/ScreenElementText'

export default class ScreenHomeMenu extends ScreenBase
{  
    constructor(screenManager, camera, world, args)
    {
        super(screenManager, camera, world, args)

        this.segments = []
        this.segmentTargets = []
        this.labels = []
        this.expandScale = 1.25;
        this.hoverNumber = 0;
        this.segmentItems = ['Profile', 'Settings', 'Change Mode', 'Realms']

        this.createRing()
    }

    createRing()
    {
        let material = new THREE.MeshBasicMaterial({ color: this.defaultColour2, side: THREE.DoubleSide, transparent: true, opacity: this.defaultOpacity})

        for(let i = 0; i < this.segmentItems.length; i++)
        {
            let segMesh = new THREE.Mesh(new THREE.RingBufferGeometry(0.25, 0.5, 8, 1, 0, Math.PI * 2 / this.segmentItems.length), material)
            let segTarget = new THREE.Mesh(new THREE.RingBufferGeometry(0.25, 0.5 * this.expandScale, 8, 1, 0, Math.PI * 2 / this.segmentItems.length), material)
            segMesh.rotateZ(i * Math.PI * 2 / this.segmentItems.length)
            segTarget.rotateZ(i * Math.PI * 2 / this.segmentItems.length)
            segTarget.visible = false
            this.segments.push(segMesh)
            this.segmentTargets.push(segTarget)
            this.group.add(segMesh)
            this.group.add(segTarget)

            let angle = (i + 0.5) * Math.PI * 2 / this.segmentItems.length
            let point = new Vector2(Math.cos(angle), Math.sin(angle))
            point.multiplyScalar(0.35)

            let text = new ScreenElementText(this, this, { x: point.x, y: point.y })
            text.setText(this.segmentItems[i])
            this.registerElement(text)
            this.labels.push(text)
        }
    }

    clickItem()
    {
        switch(this.hoverNumber)
        {
            case 0: this.screenManager.showScreen(this.screenManager.screenProfile); break;
            case 1: this.screenManager.showScreen(this.screenManager.screenSettings); break;
            case 2: this.screenManager.conjure.toggleConjureMode(); break;
            case 3: this.screenManager.showScreen(this.screenManager.screenRealms); break;
            default: break;
        }
    }

    showScreen(active)
    {
        super.showScreen(active)
    }

    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster)
                
        if(this.segments.length > 0 && this.segments[this.hoverNumber])
            this.segments[this.hoverNumber].scale.set(1,1,1)
        let intersections = raycaster.intersectObjects(this.segmentTargets, false);
        if(intersections.length)
        {
            let hoverTarget = intersections[0].object
            for(let i in this.segmentTargets)
                if(this.segmentTargets[i] === hoverTarget)
                    this.hoverNumber = Number(i)

            this.segments[this.hoverNumber].scale.set(this.expandScale, this.expandScale, this.expandScale)
            if(input.isPressed('MOUSELEFT', true))
                this.clickItem()
        }
        else
            this.hoverNumber = undefined
    }
}