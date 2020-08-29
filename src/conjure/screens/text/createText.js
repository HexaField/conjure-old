import { THREE } from 'enable3d'

export default function(font, args = {})
{
    var shapes = font.generateShapes(args.string || '', 0.05);
    var geometry = new THREE.ShapeBufferGeometry(shapes);

    geometry.computeBoundingBox();

    // todo: add in args.alignX & args.alignY
    geometry.translate(
        -0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x),
        -0.5 * (geometry.boundingBox.max.y - geometry.boundingBox.min.y), 
        0);
    return geometry

    // if(outline)
    // {
    //     var holeShapes = [];
    //     for ( var i = 0; i < shapes.length; i ++ ) {
    //         var shape = shapes[ i ];
    //         if ( shape.holes && shape.holes.length > 0 ) {
    //             for ( var j = 0; j < shape.holes.length; j ++ ) {
    //                 var hole = shape.holes[ j ];
    //                 holeShapes.push( hole );
    //             }
    //         }
    //     }
    //     shapes.push.apply( shapes, holeShapes );

    //     var lineText = new THREE.Object3D();
    //     for ( var i = 0; i < shapes.length; i ++ ) {
    //         var shape = shapes[ i ];
    //         var points = shape.getPoints();
    //         var geometry = new THREE.BufferGeometry().setFromPoints( points );
    //         geometry.translate( xMid, 0, 0 );
    //         var lineMesh = new THREE.Line( geometry, material );
    //         lineText.add( lineMesh );
    //     }
    //     return lineText;
    // }
    // return text;
}