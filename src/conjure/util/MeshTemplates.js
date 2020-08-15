import { THREE } from 'enable3d'

export function easyLine(args = {}, matArgs = {})
{				
    return new THREE.Mesh( new THREE.BufferGeometry().setFromPoints( args.points ), args.material || easyMaterial(matArgs))
}

export function easyBox(args = {}, matArgs = {})
{
    return new THREE.Mesh( new THREE.BoxGeometry(args.width, args.height, args.depth), args.material || easyMaterial(matArgs))
}

export function easyPlane(args = {}, matArgs = {})
{				
    return new THREE.Mesh( new THREE.PlaneGeometry(args.width, args.height), args.material || easyMaterial(matArgs))
}

export function easySphere(args = {}, matArgs = {})
{
    return new THREE.Mesh( new THREE.SphereGeometry(args.radius, args.segments, args.segments), args.material || easyMaterial(matArgs));
}

export function easyMaterial(args = {})
{
    return new THREE.MeshBasicMaterial(args)
}