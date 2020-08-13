import { THREE } from 'enable3d'
import { OrbitControls } from "./OrbitControls"
import { TransformControls } from "./TransformControls"
import FlyControls from './FlyControls'
import ObjectControls from './ObjectControls'
import AvatarControls from './AvatarControls'

export const CONTROL_SCHEME = {
    NONE: 'None', // controls deactivated
    ORBIT: 'Orbit',
    FLY: 'Fly',
    AVATAR: 'Avatar',
}

export default class ControlManager
{  
    constructor(conjure)
    {
        this.conjure = conjure;
        this.world = conjure.world;
        this.scene = conjure.scene;
        this.camera = conjure.camera;
        this.domElement = conjure.renderer.domElement;
        
        this.controlsEnabled = false;

        this.flyControls = new FlyControls(camera, this.domElement);        
        this.avatarControls = new AvatarControls(conjure, this.world.user, this.domElement)

        this.transformControls = this.buildTransformControls(camera);
        this.orbit = new OrbitControls( camera, this.domElement );
        this.orbit.target.copy(this.world.user.focusPoint.position);
        this.orbit.enabled = false;
        this.objectControls = new ObjectControls(this, this.transformControls);
        
        this.transformObjects = [];
        this.lastTransformObject = undefined;
        this.objectGroups = [];
        
        this.vec3 = new THREE.Vector3();

        this.conjure.input.addKey('FOCUS', 'f');
        this.conjure.input.addKey('EDIT_CONTROLS', '1');
        this.conjure.input.addKey('FLY_CONTROLS', '2');
        this.conjure.input.addKey('AVATAR_CONTROLS', '3');
        this.conjure.input.addKey('FORWARD', 'w'); 
        this.conjure.input.addKey('BACKWARD', 's');
        this.conjure.input.addKey('LEFT', 'a');
        this.conjure.input.addKey('RIGHT', 'd');
        this.conjure.input.addKey('JUMP', 'SPACEBAR');
    }

    buildTransformControls(camera)
    {
        const controls = new TransformControls( this.camera, this.domElement );
        controls.addEventListener( 'dragging-changed', function ( event ) {
            this.orbit.enabled = !event.value;
        }.bind(this) );
        controls.enabled = false;
        this.scene.add(controls);
        return controls;
    }

    getPointerLock()
    {
        if(!document.hasFocus()) return
        if(this.conjure.screenManager.hudExplore.active || (this.conjure.screenManager.hudConjure.active && this.currentControlScheme === CONTROL_SCHEME.FLY))
            this.domElement.requestPointerLock()
    }

    pointerLockError()
    {
        // console.log('Control Manager: Could not get pointer lock');
    }

    toggleConjureControls()
    {
        if(this.currentControlScheme === CONTROL_SCHEME.ORBIT)
            this.setControlScheme(CONTROL_SCHEME.FLY)
        else if(this.currentControlScheme === CONTROL_SCHEME.FLY)
            this.setControlScheme(CONTROL_SCHEME.ORBIT)
    }

    enableControls(enable)
    {
        this.enableCurrentControls(enable)
        if(!enable)
            document.exitPointerLock();
    }

    enableCurrentControls(enable)
    {
        // console.log(this.currentControlScheme, enable)
        this.controlsEnabled = enable
        switch(this.currentControlScheme)
        {
            default: case CONTROL_SCHEME.NONE: break;
            
            case CONTROL_SCHEME.ORBIT: 
                if(enable)
                {
                    this.transformControls.enabled = true;
                    this.orbit.enabled = true;
                    this.orbit.update();
                    // this.conjure.screenManager.hudConjure.showScreen(true)
                }
                else
                {
                    if(this.transformControls.objects !== [])
                    {
                        this.lastTransformObject = this.transformControls.object;
                        this.objectControls.detachAll();
                    }
                    this.transformControls.enabled = false;
                    this.orbit.enabled = false;
                }
            break;
            
            case CONTROL_SCHEME.FLY: 
                if(enable)
                {
                    this.flyControls.connect();
                    this.conjure.screenManager.hudConjure.showScreen(false)
                }
                else
                {
                    this.flyControls.disconnect();
                }
            break;

            case CONTROL_SCHEME.AVATAR: 
                if(enable)
                {
                    this.avatarControls.connect();
                }
                else
                {
                    this.avatarControls.disconnect();
                }
                    
            break;
        }
    }

    setControlScheme(scheme)
    {
        switch(scheme)
        {
            default: case CONTROL_SCHEME.NONE:
                this.enableCurrentControls(false)
                document.exitPointerLock();
                
            break;

            case CONTROL_SCHEME.ORBIT: 
                document.exitPointerLock();
                this.enableCurrentControls(false)

                if(this.currentControlScheme === CONTROL_SCHEME.FLY)
                {
                    this.orbit.target.copy(this.flyControls.raycaster.ray.at(10, this.vec3));
                }
                if(this.currentControlScheme === CONTROL_SCHEME.AVATAR)
                    this.orbit.target.copy(this.avatarControls.raycaster.ray.at(10, this.vec3));
                
                this.currentControlScheme = scheme
                this.enableCurrentControls(true)

            break;

            case CONTROL_SCHEME.FLY:
                this.enableCurrentControls(false)
                this.currentControlScheme = scheme
                this.enableCurrentControls(true)

            break;
            
            case CONTROL_SCHEME.AVATAR:
                this.enableCurrentControls(false)
                this.currentControlScheme = scheme
                this.enableCurrentControls(true)

            break;
        }
    }

    lookAt(obj) // need to sync all cameras - might be a better way than this
    {
        if(!obj) return;
        let pos = obj.position.getWorldPosition(this.vec3);
        this.camera.lookAt(pos.x, pos.y, pos.z);
        this.orbit.target.copy(pos);
        this.orbit.update();
    }

    addTransformObject(obj, attach)
    {
        this.transformObjects.push(obj);
        if(this.transformControls.object)
            this.lastTransformObject = this.transformControls.object;
        if(attach)
            this.objectControls.attach(obj, { detachOthers:true });
    }

    update(delta, input, raycaster)
    {
        if(!this.controlsEnabled) 
        {
            if(this.conjure.screenManager.controlsEnabled)
                this.enableControls(true)
            else
                return
        }
        else if(!this.conjure.screenManager.controlsEnabled)
        {
            this.enableControls(false)
            return
        }
        if(input.isPressed('MOUSELEFT', true))
            this.getPointerLock()
        // if(input.isPressed('HOME'))
        // {
        //     if(this.currentControlScheme === CONTROL_SCHEME.ORBIT && this.transformControls.hasAnyAttached())
        //     {
        //         this.lastTransformObject = this.transformControls.object;
        //         this.objectControls.detachAll();
        //     }
        //     if(this.currentControlScheme === CONTROL_SCHEME.FLY)
        //     {
        //         this.setControlScheme(CONTROL_SCHEME.ORBIT)
        //         // if(!this.conjure.screenManager.hudConjure.active)
        //         //     this.conjure.screenManager.hudConjure.showScreen(true)
        //     }
        // }

        // if(input.isPressed('DELETE', true) || input.isPressed('BACKSPACE', true))
        // {
        //     this.objectControls.detachAll({ isDeleting:true });
        // }

        // if(this.transformControls.enabled)
        // {
        //     let intersections = raycaster.intersectObjects(this.transformObjects, true);
        //     if(intersections.length > 0)
        //     {
        //         if(input.isPressed('MOUSELEFT', true))
        //         {
        //             // if(!this.transformControls.axis)
        //             // {
        //                 let object = global.CONJURE.world.objectManager.getTopGroupObject(intersections[0].object);
        //                 if(object)
        //                 {
        //                     if(input.isDown('SHIFT', true))
        //                     {
        //                         this.objectControls.attach(object);
        //                     }
        //                     else
        //                     {
        //                         if(this.transformControls.hasAnyAttached())
        //                             this.lastTransformObject = this.transformControls.isAttached(object) ? object : this.lastTransformObject;
                                
        //                         if(this.transformControls.isAttached(object))
        //                         {
        //                             this.objectControls.detach(object);
        //                         }
        //                         else
        //                         {
        //                             this.objectControls.attach(object, {detachOthers:true});
        //                         }
        //                     }
        //                 }
        //             // }
        //         }
        //     }
        // }
        // need to fix this to work with multiple objects
        // if(input.isPressed('FOCUS')) // focus on object
        // {
        //     // need to add things necessary to change from other control schemes to orbit/transform
        //     this.transformControls.enabled = true;
        //     if(this.transformControls.objects.length > 0)
        //     {
        //         if(this.lastTransformObject)
        //         {
        //             let obj = this.lastTransformObject;
        //             this.lastTransformObject = this.transformControls.object;
        //             this.objectControls.attach(obj);
        //             if(input.isDown('SHIFT', true))
        //                 this.lookAt(this.lastTransformObject);
        //         }
        //     }
        //     else
        //     {
        //         if(this.lastTransformObject)
        //         {
        //             this.objectControls.attach(this.lastTransformObject);
        //             if(input.isDown('SHIFT', true))
        //                 this.lookAt(this.lastTransformObject);
        //         }
        //     }
        // }

        // INPUT UPDATE
        if(this.currentControlScheme === CONTROL_SCHEME.ORBIT)
        {  
            if(this.conjure.screenManager.openScreens.length > 0)
            {
                this.transformControls.enabled = !this.conjure.screenManager.mouseOver;
                this.orbit.enabled = !this.conjure.screenManager.mouseOver; 
            }   
            else
            {
                this.transformControls.enabled = true;
                this.orbit.enabled = true;
            }
            this.objectControls.input(input);
        }
        if(this.currentControlScheme === CONTROL_SCHEME.FLY) 
            this.flyControls.input(input);
        if(this.currentControlScheme === CONTROL_SCHEME.AVATAR) 
            this.avatarControls.input(input);
        
        // CONTROL UPDATE
        if(this.currentControlScheme === CONTROL_SCHEME.ORBIT)
            this.objectControls.update();
        if(this.currentControlScheme === CONTROL_SCHEME.FLY)
            this.flyControls.update(delta);
        
        this.avatarControls.update(delta); 
    }
}