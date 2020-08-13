import ScreenBase from './ScreenBase'
import ScreenElementJSONTree from './elements/ScreenElementJSONTree'
import ScreenElementButton from './elements/ScreenElementButton'

export default class ScreenObjectsHierarchy extends ScreenBase
{  
    constructor(screenManager, camera, world, args)
    {
        super(screenManager, camera, world, args);

        this.group.add(this.background);

        this.frameBorder = 0.05;

        this.updateObjects = this.updateObjects.bind(this);
        this.groupingCallback = this.groupingCallback.bind(this);
        this.itemSelected = this.itemSelected.bind(this);
        this.itemHover = this.itemHover.bind(this);

        this.onCreateObject = this.onCreateObject.bind(this);
        this.onDestroyObject = this.onDestroyObject.bind(this);

        this.jsonTree = new ScreenElementJSONTree(this, this, { y: 0.05, width: this.width - this.frameBorder, height: this.height - this.frameBorder - 0.1, collapsibleDragCallback: this.groupingCallback, itemSelected: this.itemSelected, itemHover: this.itemHover })
        this.registerElement(this.jsonTree);
        this.jsonTree.setSchema(this.getSchema());

        this.createButton = new ScreenElementButton(this, this, { x: -this.width/4, y: -this.height/2 + this.frameBorder + 0.05, width: 0.2, height: 0.1, text:'Create'});
        this.createButton.setOnClickCallback(this.onCreateObject);
        this.registerElement(this.createButton);

        this.destroyButton = new ScreenElementButton(this, this, { x: this.width/4, y: -this.height/2 + this.frameBorder + 0.05, width: 0.2, height: 0.1, text:'Destroy'});
        this.destroyButton.setOnClickCallback(this.onDestroyObject);
        this.registerElement(this.destroyButton);
    }

    onCreateObject()
    {
        this.screenManager.showScreen(this.screenManager.screenObjectCreate);
    }

    onDestroyObject()
    {
        this.screenManager.conjure.controls.objectControls.detachAll({isDeleting: true});
    }

    updateObjects()
    {
        if(!this.active) return;
        this.jsonTree.updateTree(this.screenManager.conjure.world.objectManager.objects, this.updateObjects);
    }

    groupingCallback(newParent, newChild)
    {
        if(!this.screenManager.conjure.world.objectManager.groupObjects(newParent, newChild))
            return false;
        return true
    }

    itemSelected(selected, item)
    {
        if(selected)
            global.CONJURE.controls.objectControls.attach(item, { ignoreScreenUpdate: true, detachOthers: !global.CONJURE.input.isDown('SHIFT', true)})
        else
            global.CONJURE.controls.objectControls.detach(item, { ignoreScreenUpdate: true })
    }
    
    itemHover(hover, item)
    {
        if(hover)
            global.CONJURE.postProcessing.setHoverObject(item);
    }

    selectObject(select, object)
    {
        if(!this.active) return;
        let itemToSelect = this.jsonTree.getItemByReference(this.jsonTree.scrollPanel.items, object)
        if(itemToSelect)
            itemToSelect.setSelected(select, {ignoreCallback:true});
    }

    getSchema()
    {
        // type - array, json, value, static
        // label - the label for the representation
        // value - the json key
        // items is always either json or 'root'

        // TODO: replace strings with enums

        return {
            type: 'array',
            label: 'name',
            items: {
                children: {
                    type: 'array',
                    items: 'root',
                },
            },
        }
    }

    showScreen(active)
    {
        super.showScreen(active);
        this.jsonTree.setActive(active)
        if(active)
            this.updateObjects();
    }

    update(delta, input, raycaster)
    {
        super.update(delta, input, raycaster);
    }
}