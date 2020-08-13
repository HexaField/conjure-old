import { THREE } from 'enable3d'
import { CONJURE_MODE } from '../Conjure'

import HUDGlobal from './hud/HUDGlobal'
import HUDExploreMode from './hud/HUDExploreMode'
import HUDConjureMode from './hud/HUDConjureMode'

import ScreenHomeMenu from './ScreenHomeMenu'
import ScreenRealmSettings from './ScreenRealmSettings'
import ScreenObjectCreate from './ScreenObjectCreate'
import ScreenObjectEdit from './ScreenObjectEdit'
import ScreenObjectsHierarchy from './ScreenObjectsHierarchy'
import ScreenProfile from './ScreenProfile'
import ScreenSettings from './ScreenSettings'
import ScreenRealms from './ScreenRealms'
import ScreenAssets from './ScreenAssets'
import ScreenAssetSelect from './ScreenAssetSelect'
import ScreenTextureEditor from './ScreenTextureEditor'
import ScreenUserInteract from './ScreenUserInteract'
import ScreenUserPay from './ScreenUserPay'
import ScreenServices from './ScreenServices'
import ScreenPayID from './ScreenPayID'
import ScreenTextEntry from './ScreenTextEntry'

export default class ScreenManager
{  
    constructor(conjure)
    {
        this.conjure = conjure;
        this.domElement = conjure.renderer.domElement;
        this.world = conjure.world;
        this.camera = conjure.camera;
        
        this.group = new THREE.Group();
        this.conjure.scene.add(this.group);

        this.hideLastOpenScreen = this.hideLastOpenScreen.bind(this) // for text entry screen callback

        // TODO: rename this to explore mode HUD and add conjure mode HUD
        this.hudGlobal = new HUDGlobal(this, this.camera, this.world, {name:'Global', width:2, height:1});
        this.hudExplore = new HUDExploreMode(this, this.camera, this.world, {name:'Explore', width:2, height:1});
        this.hudConjure = new HUDConjureMode(this, this.camera, this.world, {name:'Conjure', width:2, height:1});
        this.hudGlobal.showScreen(false)
        this.hudExplore.showScreen(false)
        this.hudConjure.showScreen(false)

        this.screens = [];
        
        this.screenHomeMenu = this.createScreen(new ScreenHomeMenu(this, this.camera, this.world, {name:'Home Menu', width:1, height:1, pauses:true}));
        this.screenRealmSettings = this.createScreen(new ScreenRealmSettings(this, this.camera, this.world, {name:'Realm Settings', width:1.5, height:1, pauses:true}));
        this.screenObjectCreate = this.createScreen(new ScreenObjectCreate(this, this.camera, this.world, {name:'Create Object', width:0.8, height:0.4}));
        this.screenObjectEdit = this.createScreen(new ScreenObjectEdit(this, this.camera, this.world, {name:'Object Edit', width:0.8, height:1.6, x:0.75, anchor:true}));
        this.screenObjectsHierarchy = this.createScreen(new ScreenObjectsHierarchy(this, this.camera, this.world, {name:'Objects Hierarchy', width:0.8, height:1.6, x:-0.6, anchor:true}));
        this.screenSettings = this.createScreen(new ScreenSettings(this, this.camera, this.world, {name:'Settings', width:1.6, height:0.8, pauses:true}));
        this.screenProfile = this.createScreen(new ScreenProfile(this, this.camera, this.world, {name:'Profile', width:1.6, height:0.8, pauses:true}));
        this.screenServices = this.createScreen(new ScreenServices(this, this.camera, this.world, {name:'Services', width:1.6, height:0.8, pauses:true}));
        this.screenRealms = this.createScreen(new ScreenRealms(this, this.camera, this.world, {name:'Realms', width:1.5, height:1.5, pauses:true}));
        this.screenAssets = this.createScreen(new ScreenAssets(this, this.camera, this.world, {name:'Assets', width:2.4, height:1.0, pauses:true}));
        this.screenAssetSelect = this.createScreen(new ScreenAssetSelect(this, this.camera, this.world, {name:'Assets Select', width:0.8, height:1.6}));
        this.screenTextureEditor = this.createScreen(new ScreenTextureEditor(this, this.camera, this.world, {name:'Edit Texture', width:1.6, height:1.6}));
        this.screenUserInteract = this.createScreen(new ScreenUserInteract(this, this.camera, this.world, {name:'User Interact', width:1.5, height:1, pauses:true}));
        this.screenUserPay = this.createScreen(new ScreenUserPay(this, this.camera, this.world, { name:'Pay User', width:1.5, height:0.6, pauses:true }))
        this.screenPayID = this.createScreen(new ScreenPayID(this, this.camera, this.world, { name:'PayID', width:2.8, height:1.2, pauses:true }));
        this.screenTextEntry = this.createScreen(new ScreenTextEntry(this, this.camera, this.world, { name:'Enter Value', width:0.8, height:0.4 }))

        this.openScreens = [];
        this.mouseOver = false;
    }

    createScreen(screen)
    {
        this.screens.push(screen)
        screen.showScreen(false);
        return screen;
    }

    getScreenByName(screenName)
    {
        for(let s of this.screens)
            if(s.screenName === screenName)
                return s;
    }

    getScreenOpen(screen)
    {
        if(typeof screen === 'string')
        {
            screen = this.getScreenByName(screen);
            if(!screen) return false;
        }
        for(let s of this.openScreens)
            if(screen === s) 
                return true;
        return false;
    }

    isHudOpen()
    {
        return this.hudExplore.active || this.hudConjure.active
    }

    hideHud()
    {
        this.hudExplore.showScreen(false)
        this.hudConjure.showScreen(false)
    }

    showHud()
    {
        if(this.conjure.conjureMode === CONJURE_MODE.LOADING)
        {
            this.hudExplore.showScreen(false)
            this.hudConjure.showScreen(false)
            return
        }
        this.hideAllScreens()
        if(this.conjure.conjureMode === CONJURE_MODE.EXPLORE)
        {
            this.hudExplore.showScreen(true)
            this.hudConjure.showScreen(false)
        }
        if(this.conjure.conjureMode === CONJURE_MODE.CONJURE)
        {
            this.hudExplore.showScreen(false)
            this.hudConjure.showScreen(true)
        }   
    }

    showScreen(screen)
    {
        if(!screen) return;
        if(typeof screen === 'string')
        {
            screen = this.getScreenByName(screen);
            if(!screen) return;
        }
        if(this.getScreenOpen(screen)) return;
        if(screen.pauses)
        {
            this.closeAllScreens()
            this.controlsEnabled = false
            this.hideHud();
        }
        screen.showScreen(true);
        this.openScreens.push(screen);
    }

    closeAllScreens()
    {
        for(let screen of this.openScreens)
            screen.showScreen(false);
        this.openScreens = [];
    }

    hideAllScreens()
    {
        this.controlsEnabled = true
        if(this.openScreens.length === 0) return;
        for(let screen of this.openScreens)
            screen.showScreen(false);
        this.openScreens = [];
        this.mouseOver = false;
        this.showHud();
    }

    hideLastOpenScreen()
    {
        if(this.openScreens.length === 0) return;
        this.openScreens[this.openScreens.length - 1].showScreen(false);
        this.openScreens.splice(this.openScreens.length - 1, 1);
        if(this.openScreens.length === 0)
        {
            this.mouseOver = false;
            this.controlsEnabled = true
            this.showHud();
        }
    }
    
    hideScreen(screen)
    {
        if(typeof screen === 'string')
        {
            screen = this.getScreenByName(screen);
            if(!screen) return;
        }
        if(!screen)
        {
            this.hideAllScreens();
        }
        else
        {
            for(let i = 0; i < this.openScreens.length; i++)
                if(this.openScreens[i] === screen)
                {
                    screen.showScreen(false);
                    this.openScreens.splice(i, 1);
                }
        }
        if(this.screens.length === 0)
            this.hideAllScreens();
    }

    update(delta, input, raycaster)
    {
        // add custom key listeners to allow this to scale
        if(input.isPressed('HOME'))
        {
            if(this.openScreens.length === 0)
                this.showScreen(this.screenHomeMenu);
            else
                this.hideLastOpenScreen();
        }
        this.mouseOver = false;
        for(let s of this.openScreens)
        {
            if(!s.pauses || s === this.openScreens[this.openScreens.length - 1])
                s.update(delta, input, raycaster);
            if(s.mouseOver)
                this.mouseOver = true;
        }
        if(this.openScreens.length === 0)
        {
            if(this.conjure.conjureMode === CONJURE_MODE.EXPLORE)
                this.hudExplore.update(delta, input, raycaster);
            if(this.conjure.conjureMode === CONJURE_MODE.CONJURE)
                this.hudConjure.update(delta, input, raycaster);
        }
        this.hudGlobal.update(delta, input, raycaster);
    }

    resizeScreens(ratio)
    {
        for(let screen of this.screens)
            screen.resizeScreen(ratio)
        this.hudExplore.resizeScreen(ratio)
        this.hudConjure.resizeScreen(ratio)
        this.hudGlobal.resizeScreen(ratio)
    }
}