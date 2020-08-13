import { THREE, ExtendedGroup } from 'enable3d';

export default class ObjectControls
{  
    constructor(controlManager, controlInfo, controls)
    {
        this.controlManager = controlManager;
        this.controlInfo = controlInfo;
        this.controls = controls;
        this.storageBodyType = null;
        this.translationSnap = 0.5;
    }

    input(input)
    {
        if(input.isPressed('q', true))
            this.controls.setSpace( this.controls.space === "local" ? "world" : "local" );
            
        if(input.isPressed('SHIFT', true))
        {
            // add settings for this
            this.controls.setTranslationSnap( this.translationSnap );
            this.controls.setRotationSnap( THREE.MathUtils.degToRad( 15 ) );
            this.controls.setScaleSnap( 0.25 );
        }
        if(input.isReleased('SHIFT', true))
        {
            this.controls.setTranslationSnap( null );
            this.controls.setRotationSnap( null );
            this.controls.setScaleSnap( null );
        }
        if(input.isPressed('w', true))
            this.controls.setMode( "translate" );

        if(input.isPressed('e', true))
            this.controls.setMode( "rotate" );

        if(input.isPressed('r', true))
            this.controls.setMode( "scale" );

        if(input.isPressed('g', true))
            this.createGroup();

        if(input.isPressed('+', true) || input.isPressed('=', true))
            this.controls.setSize( this.controls.size + 0.1 );

        if(input.isPressed('-', true) || input.isPressed('_', true))
            this.controls.setSize( Math.max( this.controls.size - 0.1, 0.1 ) );

        if(input.isPressed('x', true))
            this.controls.showX = ! this.controls.showX;

        if(input.isPressed('y', true))
            this.controls.showY = ! this.controls.showY;

        if(input.isPressed('z', true))
            this.controls.showZ = ! this.controls.showZ;

        if(input.isPressed('SPACEBAR', true))
        {
            this.controls.enabled = ! this.controls.enabled;
            this.controlInfo.hidden = !this.controls.enabled;
        }
    }

    createGroup()
    {
        if(this.controls.objects.length > 1)
        {
            let newGroup = new ExtendedGroup();
            for(let obj of this.controls.objects)
            {
                obj.parent.remove(obj);
                newGroup.add(obj);
            }
            global.CONJURE.scene.add(newGroup);
            this.detachAll();
        }
    }

    attach(object, params = {})
    {
        console.log(object)
        if(params.detachOthers) 
            this.detachAll();
        global.ITERATE.iterateChildrenWithFunction(object, (o) => {
            if(o.body)
            {
                global.CONJURE.physics.destroy(o.body);
            }
        })

        this.controls.attach(object);
        global.CONJURE.postProcessing.addSelectedObject(object);
        if(!params.ignoreScreenUpdate)
            global.CONJURE.screenManager.screenObjectsHierarchy.selectObject(true, object);
        global.CONJURE.screenManager.showScreen(global.CONJURE.screenManager.screenObjectEdit);
        global.CONJURE.screenManager.screenObjectEdit.setObject(object);
    }

    detachAll(params = {})
    {
        if(params.isDeleting)
            for(let object of this.controls.objects)
                global.CONJURE.world.destroyObject(object);
        else
            for(let object of this.controls.objects)
            {
                if(!params.ignoreScreenUpdate)
                    global.CONJURE.screenManager.screenObjectsHierarchy.selectObject(false, object);
                global.ITERATE.iterateChildrenWithFunction(object, (o) => {
                    global.CONJURE.world.restorePhysics(o);
                });
                object.userData.needsUpdate = true;
            }

        this.controls.detachAll();
        global.CONJURE.postProcessing.clearSelectedObjects();
        global.CONJURE.screenManager.hideScreen(global.CONJURE.screenManager.screenObjectEdit);
    }

    detach(object, params = {})
    {
        this.controls.detach(object);
        
        global.ITERATE.iterateChildrenWithFunction(object, (o) => {
            global.CONJURE.world.restorePhysics(o);
        });
        object.userData.needsUpdate = true;
        global.CONJURE.postProcessing.removeSelectedObject(object);
        
        if(!params.ignoreScreenUpdate)
            global.CONJURE.screenManager.screenObjectsHierarchy.selectObject(false, object)
        global.CONJURE.screenManager.hideScreen(global.CONJURE.screenManager.screenObjectEdit);
    }

    update()
    {
        
    }
}