import { THREE, ExtendedObject3D } from 'enable3d'
import { REALM_PROTOCOLS } from '../world/realm/Realm'

export default class User
{
    constructor(conjure)
    {
        this.vec = new THREE.Vector3();
        this.quat = new THREE.Quaternion();
        this.euler = new THREE.Euler();
        this.isRemote = false;
        
        this.conjure = conjure;
        this.scene = conjure.scene;

        this.group = new ExtendedObject3D();
        this.group.name = 'user'
        this.group.position.y += 1;
        this.group.rotateY(Math.PI + 0.1) // a hack
        this.group.rotation.set(0, Math.PI * 1.5, 0)
        this.modelHeight = 1.8;

        this.thirdPerson = false;

        this.eyeHeight = 1.75;
        this.focusLength = 2;

        this.theta = 0;
        this.phi = 0;
        this.sensitivityX = 1;
        this.sensitivityY = 0.8;

        this.yMinLimit = -20;
        this.yMaxLimit = 80;

        this.radius = 10;
        this.follow = false;

        this.focusPoint = new ExtendedObject3D();
        this.focusPoint.position.y = this.eyeHeight;
        this.focusPoint.position.z = -2;
        this.group.add(this.focusPoint);

        this.previewMeshPoint = new ExtendedObject3D();
        this.previewMeshPoint.position.y = 1;
        this.previewMeshPoint.position.z = -1.5;
        this.group.add(this.previewMeshPoint);

        this.scene.add(this.group);

        this.walkSpeed = 1;
        this.runSpeed = 5;

        this.loadModel()
    }

    async loadModel()
    {
        this.playerModel = await this.conjure.load.gltf('playerModel')

        this.mesh = this.playerModel.scene;
        this.mesh.isSkinnedMesh = true;
        
        this.mesh.rotation.y = THREE.MathUtils.DEG2RAD * 180;
        let i = 0;
        this.mesh.traverse(o => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
                o.material.transparent = true;
                o.material.opacity = 1;
                o.name = 'avatar mesh ' + i
                i++
            }
        })

        this.group.add(this.mesh);
        this.collider = this.conjure.physics.add.existing(this.group, {
            shape: 'box',
            width: 0.6,
            depth: 0.4,
            height: this.modelHeight,
            offset: { x : 0, y: -this.modelHeight / 2, z:0},
            autoCenter: false,
            mass: 1
            // shape: 'sphere',
            // radius: 0.25,
            // width: 0.5,
            // offset: { y: -0.25 }
        })
        this.group.body.setCollisionFlags(0);
        this.group.body.setFriction(1.5)
        this.group.body.setBounciness(0)
        this.group.body.setAngularFactor(0, 0, 0)
        this.group.body.setLinearFactor(1, 1, 1)

        // Continuous Collision Detection - https://docs.panda3d.org/1.10/python/programming/physics/bullet/ccd
        // this.group.body.setCcdMotionThreshold(1e-7)
        // this.group.body.setCcdSweptSphereRadius(0.25)
    
        this.conjure.animationMixers.add(this.group.animation.mixer)
        this.playerModel.animations.forEach(animation => {
            if (animation.name) 
                this.group.animation.add(animation.name, animation)
        })

        this.onGround = false;
        this.animMovementLock = true;

        this.group.animation.mixer.addEventListener('loop', function( e ) {
            if(!this.group || this.group.body) return;
            if(this.currentAnimation === 'land' || this.currentAnimation === 'landHard' || this.currentAnimation === 'landRoll')
            {
                this.group.body.setVelocity(0, 0, 0);
            }
        }.bind(this));

        this.group.animation.mixer.addEventListener('finished', function( e ) {
            if(this.currentAnimation === 'jump' || this.currentAnimation === 'runningJump' || this.currentAnimation === 'flip')
            {
                this.setAction('falling', 0.1);
            }
            if(this.currentAnimation === 'land' || this.currentAnimation === 'landHard' || this.currentAnimation === 'landRoll')
            {
                this.setAction('idle', 0.2)
            }
            console.log('finished')
        }.bind(this));

        this.setAction('idle', 0.1);
        this.turnedTooMuch = false;
        this.onCreate();
        this.conjure.getControls().controlsEnabled = true
    }

    onCreate()
    {

    }

    jump()
    {
        if(this.currentAnimation === 'jump' || this.currentAnimation === 'runningJump' || (this.currentAnimation === 'falling' && this.group.body.velocity.y > 0.5))
        {
            this.setAction('flip', 0.1, true);
            this.group.body.applyForceY(3);
        }

        if(!this.onGround) return;

        if(this.currentAnimation === 'run')
        {
            this.setAction('runningJump', 0.1, true);
            this.group.body.applyForceY(5);
        }
        else
        {
            this.setAction('jump', 0.1, true);
            this.group.body.applyForceY(5);
        }
    }

    setTransparency(alpha)
    {
        this.mesh.visible = Boolean(alpha);
        this.mesh.traverse(o => {
            if (o.isMesh) {
                o.material.opacity = alpha;
            }
        })
    }

    update(updateArgs)
    {
        if(!this.playerModel) return;
        if(this.isRemote) return;
        
        // let speed = this.getVelocity(false);
        let xzSpeed = this.getVelocity(true);
        const physicsRaycaster = this.conjure.physics.add.raycaster('allHits') // 'closest' is the default

        physicsRaycaster.setRayFromWorld(this.group.position.x, this.group.position.y+0.5, this.group.position.z)
        physicsRaycaster.setRayToWorld(this.group.position.x, this.group.position.y-0.5, this.group.position.z)
        physicsRaycaster.rayTest()
        
        this.onGround = false;
        
        if (physicsRaycaster.hasHit())
        {
            physicsRaycaster.getCollisionObjects().forEach((obj, i) => {
                // if(obj.name === 'platform')
                // {
                    // console.log(obj.name)
                    this.onGround = true;
                // }
           })
        }
        if(this.currentAnimation === 'land' || this.currentAnimation === 'landHard' || this.currentAnimation === 'landRoll')
        {

        }
        else if(this.currentAnimation === 'falling')
        {
            if(this.onGround)
            {
                if(this.turnedTooMuch)
                {
                    if(this.group.body.velocity.y < -1 && xzSpeed > this.walkSpeed)
                    {
                        this.setAction('landHard', 0.1, true, 0.0);
                    }
                    else
                    {
                        this.setAction('land', 0.2, true, 0.2);
                    }
                    this.turnedTooMuch = false;
                }
                else if(this.group.body.velocity.y < -5)
                {
                    if(!this.turnedTooMuch)
                    {
                        if(xzSpeed > this.walkSpeed)
                        {
                            this.setAction('landRoll', 0.1, true, 0.0);
                        }
                        else
                        {
                            this.setAction('land', 0.2, true, 0.2);
                        }

                    }
                    else
                    {
                        this.setAction('landHard', 0.1, true, 0.0);
                    }
                }
                else if(xzSpeed > this.runSpeed)
                {
                    this.setAction('run', 0.2);
                }
                else
                {
                    this.setAction('land', 0.2, true, 0.2);
                }
            }

        }
        else if(this.currentAnimation === 'jump' || this.currentAnimation === 'runningJump' || this.currentAnimation === 'flip')
        {

        }
        else
        {
            if(this.onGround)
            {
                if(xzSpeed > this.runSpeed)
                {
                    if(this.currentAnimation !== 'run')
                        this.setAction('run', 0.2);
                }
                else if(xzSpeed > this.walkSpeed)
                {
                    if(this.currentAnimation !== 'walk')
                        this.setAction('walk', 0.2);
                }
                else 
                {
                    if(this.currentAnimation !== 'idle')
                        this.setAction('idle', 0.25);
                }
            }
            else
            {
                if(this.currentAnimation !== 'falling')
                this.setAction('falling', 0.1);
            }
        }
        if(this.group.getWorldPosition(this.vec).y < -10 || updateArgs.input.isPressed('R', true))
        {
            this.teleport(this.conjure.world.spawnLocation.x, this.conjure.world.spawnLocation.y, this.conjure.world.spawnLocation.z);
        }
        physicsRaycaster.destroy()
    }

    teleport(x, y, z)
    {
        if(!this.group || !this.group.body) return;
        this.group.body.setCollisionFlags(2);
        this.group.position.set(x, y, z);
        this.group.body.needUpdate = true;
        this.group.body.once.update(() => {
            this.group.body.setCollisionFlags(0)
            this.group.body.setVelocity(0, 0, 0)
            this.group.body.setAngularVelocity(0, 0, 0)
        })
    }
    
    // idle - walk - run - jump - runningJump - falling - land - landHard - landRoll - flip
    setAction(name, fadeTime, once, startTime) // add in time
    {
        if(!this.group) return;
        if(name === this.currentAnimation) return;
        // console.log(name)
        this.currentAnimation = name;
        this.getMovementLock()
        this.group.animation.play(name, fadeTime * 1000, !Boolean(once));
        if(!this.isRemote)
            this.conjure.getWorld().sendData(REALM_PROTOCOLS.USER.ANIMATION, { name, fadeTime, once, startTime });
    }

    getMovementLock()
    {
        switch(this.currentAnimation)
        {
            case 'land': case 'landHard': case 'landRoll':  case 'jump': case 'runningJump': case 'falling': case 'flip':
                this.animMovementLock = true; return;
            default: 
                this.animMovementLock = false; return;
        }
    }

    getVelocity(xz)
    {
        return xz ? Math.sqrt((this.group.body.velocity.x * this.group.body.velocity.x) + (this.group.body.velocity.z * this.group.body.velocity.z)) : Math.sqrt((this.group.body.velocity.x * this.group.body.velocity.x) + (this.group.body.velocity.y * this.group.body.velocity.y) + (this.group.body.velocity.z * this.group.body.velocity.z))
    }
}


// use left and right turn animations
// if deltaTheta is too big, change running jump to end with hard landing
 