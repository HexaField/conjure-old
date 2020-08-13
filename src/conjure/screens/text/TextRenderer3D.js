
import { THREE } from 'enable3d'
import createText from './createText'

export default class TextRenderer3D
{
    constructor(font, parent, params = { string: '', x: 0, y: 0, scale: 1, anchorX: 'center', anchorY: 'center', renderSide: THREE.DoubleSide, color: 0xffffff })
    {
        this.x = params.x
        this.y = params.y
        this.scale = params.scale
        this.anchorX = params.anchorX
        this.anchorY = params.anchorY
        this.renderSide = params.renderSide
        this.colour = params.color
        
        this.string = String(params.string)

        this.group = new THREE.Group()
        this.font = font
        this.geometry = createText(this.font, params)
        
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.group.add(this.mesh)
        parent.add(this.group)
        // this.group.add(easySphere(0.01)) // use this for debugging
    }

    setText(text, font)
    {
        if(font !== undefined)
            this.font = font
        this.string = String(text)
        this.geometry = createText(this.font, text)
        this.mesh.geometry = this.geometry
    }

    getBounds()
    {
        return this.geometry.getBounds()
    }

    getText()
    {
        return this.string
    }
}