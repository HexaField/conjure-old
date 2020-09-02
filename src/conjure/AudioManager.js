import { THREE } from 'enable3d'
import { number } from './util/number';

export default class AudioManager
{
    constructor(conjure)
    {
        this.conjure = conjure
        this.buffers = {}
        this.sounds = []
    }

    getHasContext()
    {
        return this.audioListener !== undefined
    }

    async create(waitForInput)
    {
        if(this.getHasContext()) return

        if(waitForInput)
        {
            this.conjure.getLoadingScreen().setText('WARNING!\n\nThis realm automatically plays audio.\nPlease click to continue.') 
            await this.conjure.getLoadingScreen().awaitInput()
        }

        this.audioListener = new THREE.AudioListener();
        
        await this.audioListener.context.resume()
        this.conjure.camera.add(this.audioListener);
        this.setMasterVolume(1.0)

        this.audioLoader = new THREE.AudioLoader();
    }

    async load(label, url)
    {
        if(this.buffers[label]) return
        
        if(!url) return

        await new Promise((resolve, reject) => {
            this.audioLoader.load(url, (buffer) => {
                this.buffers[label] = buffer
                return resolve()
            })
        })
    }
    
    // { loop, volume }
    play(buffer, args = {})
    {
        if(!this.audioListener || !this.buffers[buffer]) return
        
        let sound = args.positional ? new THREE.PositionalAudio(this.audioListener) : new THREE.Audio(this.audioListener);
        
        sound.setBuffer(this.buffers[buffer]);
        sound.setLoop(Boolean(args.loop));
        sound.setVolume(args.volume === undefined ? 1 : args.volume);
        if(args.positional)
            sound.setRefDistance(args.refDistance === undefined ? 20 : args.refDistance);
        sound.play();
        sound.onEnded = () => {
            for(let i in this.sounds)
                if(sound === this.sounds[i])
                    this.sounds.slice(i, 1)
        }
        this.sounds.push(sound)
        return sound
    }

    setMasterVolume(amount)
    {
        if(!this.audioListener) return
        this.audioListener.setMasterVolume(number(amount))
    }

    async toggleMute()
    {
        if(!this.audioListener) 
            await this.create(false)
        this.audioListener.setMasterVolume(this.audioListener.getMasterVolume() === 0 ? 1 : 0)
        return this.audioListener.getMasterVolume()
    }
}