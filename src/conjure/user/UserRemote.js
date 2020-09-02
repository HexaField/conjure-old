import User from './User';
import TextRenderer3D from '../screens/text/TextRenderer3D';
import { THREE } from 'enable3d'

export default class UserRemote extends User
{
    constructor(conjure, username, peerID)
    {
        super(conjure, true);
        this.isRemote = true;
        this.username = username;
        this.peerID = peerID;
        this.remoteEntity = true;
        this.group.name = username;

        this.nameplate = new TextRenderer3D(conjure, this.group, { text: username });
        this.nameplate.group.position.setY(2);
        this.nameplate.group.visible = false
        this.timeoutLimit = 3 * 60; // if don't receive a heartbeat for 3 seconds, die
        this.timeoutCount = 0;
        this.timedOut = false

        this.velocity = new THREE.Vector3();
    }

    onCreate()
    {
        super.onCreate()
        // this.group.body.setCollisionFlags(2);
    }

    updateInfo(data)
    {
        this.timeoutCount = 0;
        if(this.timedOut) return
        if(data.username)
        {
            this.username = data.username
            this.nameplate.setText(this.username)
        }
    }

    update(updateArgs)
    {
        if(this.timedOut) return
        this.timeoutCount++;
        if(this.timeoutCount > this.timeoutLimit)
        {
            console.log(this.group.name + ' has timed out')
            this.conjure.getWorld().onUserLeave(this.peerID);
            return
        }
        if(!this.group) return;
        this.group.position.set(this.group.position.x + (this.velocity.x * updateArgs.delta), this.group.position.y + (this.velocity.y * updateArgs.delta), this.group.position.z + (this.velocity.z * updateArgs.delta))
        // this.group.body.needUpdate = true;
    }

    setPhysics(physics)
    {
        this.timeoutCount = 0;
        if(!this.group || this.timedOut) return;
        this.group.position.set(physics.position.x, physics.position.y, physics.position.z);
        this.group.quaternion.set(physics.quaternion._x, physics.quaternion._y, physics.quaternion._z, physics.quaternion._w);
        this.velocity.set(physics.velocity.x, physics.velocity.y, physics.velocity.z);
        // this.group.body.needUpdate = true;
    }

    destroy()
    {
        // this.conjure.getWorld().onUserLeave(this.peerID)
        // this.conjure.physics.destroy(this.group.body)
        // this.scene.remove(this.group)
        // this.timedOut = true;
    }
}