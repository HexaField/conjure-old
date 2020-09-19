import { THREE } from 'enable3d'
import Feature from "./Feature"
import StructurePortal from "../structures/StructurePortal"
import { POSTPROCESSING } from '../../PostProcessing';

export default class FeatureLobby extends Feature
{
    constructor(realm)
    {
        super(realm)
    }

    async preload()
    {
        this.portals = []
        this.portalRealmIDs = ['Gallery', '', '', '', '', '', '', '', '', '', '', '']
        this.portalsCount = this.portalRealmIDs.length

        this.portalMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color('aqua'), linewidth: 2 })

        let groundMesh = new THREE.Line(this.createCircleGeometry(2), this.portalMaterial)
        groundMesh.layers.enable(POSTPROCESSING.BLOOM_SCENE)
        this.realm.group.add(groundMesh)
        
        for(let i = 0; i < this.portalsCount; i++)
        {
            let angle = ((i + 0.5) * Math.PI * 2 / this.portalsCount) + (Math.PI / 2)
            let point = new THREE.Vector2(Math.cos(angle), Math.sin(angle))
            
            let portal = new StructurePortal(this.realm.conjure, this.realm.group, { realmID: this.portalRealmIDs[i], position: { x: -point.x * 10, y: 2, z: -point.y * 10}})
    
            this.portals.push(portal)
            if(this.portalRealmIDs[i] !== '')
            {
                let line = new THREE.Line(this.createLineGeometry(new THREE.Vector3(-point.x * 2, 0, -point.y * 2), new THREE.Vector3(-point.x * 9, 0, -point.y * 9)), this.portalMaterial)
                line.layers.enable(POSTPROCESSING.BLOOM_SCENE)
                this.realm.group.add(line)
            }
            
            groundMesh = new THREE.Line(this.createCircleGeometry(1), this.portalMaterial)
            if(this.portalRealmIDs[i] !== '')
                groundMesh.layers.enable(POSTPROCESSING.BLOOM_SCENE)
            groundMesh.position.set(-point.x * 10, 0, -point.y * 10)

            this.realm.group.add(groundMesh)
        }


    }

    createLineGeometry(a, b)
    {
        let geom = new THREE.BufferGeometry().setFromPoints([a, b]);
        return geom
    }

    createCircleGeometry(radius)
    {
        let curve = new THREE.EllipseCurve(
            0,  0,
            radius, radius,
            0,  2 * Math.PI,
            false,
            0
        )
        let points = curve.getPoints(50);
        let geom = new THREE.BufferGeometry().setFromPoints(points);
        geom.rotateX(Math.PI / 2)
        return geom
    }

    async load()
    {
    }

    async unload()
    {
        this.portals.forEach((portal) => portal.destroy())
    }

    update(updateArgs)
    {
        
    }
}