import { THREE } from 'enable3d'

export default class FeatureArtGallery
{
    constructor(parent, args = {})
    {
        var geometry = new THREE.SphereGeometry(1024, 60, 40);
        let texture = new THREE.TextureLoader().load( 'assets/textures/milkyway.jpg' );
        var material = new THREE.MeshStandardMaterial( {  
            side: THREE.BackSide,
            opacity: args.opacity || 1,
            transparent: true,
            map: texture
        });

        let skyBox = new THREE.Mesh(geometry, material);
        skyBox.renderDepth = 1000.0;  
        parent.add(skyBox); 
    }
}