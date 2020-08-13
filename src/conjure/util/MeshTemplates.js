import { THREE } from 'enable3d'

export function easyLine(args = {})
{				
    return new THREE.Mesh( new THREE.BufferGeometry().setFromPoints( args.points ), args.material || easyMaterial(args))
}

export function easyBox(args = {})
{
    return new THREE.Mesh( new THREE.BoxGeometry(args.width, args.height, args.depth), args.material || easyMaterial(args))
}

export function easyPlane(args = {})
{				
    return new THREE.Mesh( new THREE.PlaneGeometry(args.width, args.height), args.material || easyMaterial(args))
}

export function easySphere(args = {})
{
    return new THREE.Mesh( new THREE.SphereGeometry(args.radius, args.segments, args.segments), args.material || easyMaterial(args));
}

export function easyMaterial(args = {})
{
    return new THREE.MeshBasicMaterial(args)
}