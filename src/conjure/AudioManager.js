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

    async create()
    {
        this.audioListener = new THREE.AudioListener();
        
        await this.audioListener.context.resume()
        this.conjure.camera.add(this.audioListener);
        this.setMasterVolume(0.1)

        this.audioLoader = new THREE.AudioLoader();
    }

    async load(label, url)
    {
        if(this.buffers[label]) return
        
        if(!url) return

        console.log(this.audioLoader)
        await new Promise((resolve, reject) => {
            this.audioLoader.load(url, (buffer) => {
                this.buffers[label] = buffer
                return resolve()
            }, (progress) => {console.log(progress)})
        })
    }
    
    // { loop, volume }
    play(buffer, args = {})
    {
        console.log('play ')
        if(!this.audioListener || !this.buffers[buffer]) return
        
        let sound = new THREE.Audio(this.audioListener);

        sound.setBuffer(this.buffers[buffer]);
        sound.setLoop(Boolean(args.loop));
        sound.setVolume(args.volume === undefined ? 1.0 : args.volume);
        sound.play();
        sound.onEnded = () => {
            for(let i in this.sounds)
                if(sound === this.sounds[i])
                    this.sounds.slice(i, 1)
        }
        this.sounds.push(sound)
        return sound
    }

    // { loop, volume, refDistance }
    playPositional(buffer, args = {})
    {
        if(!this.audioListener || !this.buffers[buffer]) return
        
        let sound = new THREE.PositionalAudio(this.audioListener);
        
        sound.setBuffer(this.buffers[buffer]);
        sound.setLoop(Boolean(args.loop));
        sound.setVolume(args.volume);   
        sound.setRefDistance(args.refDistance);
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
}