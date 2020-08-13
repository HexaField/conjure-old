import { THREE } from 'enable3d'
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js'

export default class HTMLObject
{
    constructor(cssParent, objectParent, element, args = { width: 1, height: 1, scale: 1, resolution: 100, anchorX: 0, anchorY: 0 })
    {
        this.width = args.width
        this.height = args.height
        this.scale = args.scale
        this.resolution = args.resolution;
        this.inverseRes = 1/this.resolution;
        
        this.objectCSS = new CSS3DObject(element);
        this.objectCSS.castShadow = false;
        this.objectCSS.receiveShadow = false;
        cssParent.add(this.objectCSS);
        
        var material = new THREE.MeshBasicMaterial();
        material.color.set(0x2685ff)
        material.opacity = 0.0;
        material.transparent = true;
        // material.blending = THREE.NoBlending;
        material.side = THREE.DoubleSide;
        
        var geometry = new THREE.PlaneGeometry(this.width * this.scale, this.height * this.scale);
        this.planeMesh = new THREE.Mesh( geometry, material );
        this.planeMesh.castShadow = false;
        this.planeMesh.receiveShadow = false;
        this.anchor = new THREE.Group();
        this.anchor.position.set(args.anchorX, 0, 0);
        this.anchor.add(this.planeMesh);
        objectParent.add(this.anchor);

        this.vec = new THREE.Vector3();
        this.qua = new THREE.Quaternion();
        // this.update()
        this.show(false)
    }

    show(show)
    {
        this.objectCSS.element.hidden = !show;
        this.objectCSS.visible = show;
    }

    update()
    {
        this.objectCSS.position.copy(this.planeMesh.getWorldPosition(this.vec));
        this.objectCSS.quaternion.copy(this.planeMesh.getWorldQuaternion(this.qua));
        this.objectCSS.scale.copy(this.planeMesh.getWorldScale(this.vec).multiplyScalar(this.inverseRes));
    }
}