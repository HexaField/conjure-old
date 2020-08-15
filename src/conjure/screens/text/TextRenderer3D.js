
import { THREE } from 'enable3d'
import createText from './createText'
import { number } from '../../util/number'

export default class TextRenderer3D
{
    constructor(conjure, parent, params = {})
    {
        this.conjure = conjure
        this.x = number(params.x)
        this.y = number(params.y)
        this.scale = number(params.scale) || 1
        this.anchorX = params.anchorX || 'center'
        this.anchorY = params.anchorY || 'center'
        this.renderSide = params.renderSide || THREE.DoubleSide
        this.color = params.color || 0xffffff
        
        this.string = String(params.string || params.text || 'string')

        this.group = new THREE.Group()
        this.font = conjure.getFonts().getFont(params.font || 'Helvetiker')
        this.geometry = createText(this.font, { string: this.string })
        
        this.material = new THREE.MeshBasicMaterial({
            // transparent: true,
            color: this.color,
            side: this.renderSide,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.scale.set(this.scale, this.scale, this.scale)
        this.group.add(this.mesh)
        parent.add(this.group)
        // this.group.add(easySphere(0.01)) // use this for debugging
    }

    setText(text, font)
    {
        if(font !== undefined)
            this.font = font
        this.string = String(text)
        this.geometry = createText(this.font, { string: this.string })
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