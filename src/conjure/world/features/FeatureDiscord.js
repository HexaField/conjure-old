import { THREE } from 'enable3d'
import Feature from "./Feature"
import StructurePortal from "../structures/StructurePortal"
import { POSTPROCESSING } from '../../PostProcessing';
import { REALM_VISIBILITY, REALM_WHITELIST } from '../realm/RealmData';

export default class FeatureDiscord extends Feature
{
    constructor(realm)
    {
        super(realm)
    }

    async preload()
    {
        console.log('discord feature!')
    }

    async load()
    {
    }

    async unload()
    {
        
    }

    update(updateArgs)
    {
        
    }
}