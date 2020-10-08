import { THREE } from 'enable3d'
import * as DiscordOauth2 from 'discord-oauth2'
import crypto from 'crypto'

export default class DiscordOauthHandler
{  
    constructor(service)
    {
        this.serviceHandler = service;
        this.userData = undefined;
        this.loggedIn = false;
    }

    async initialise()
    {
        this.clientId = '719132345483132948';
                        
        this.oauth = new DiscordOauth2({
            clientId: this.clientId,
            // clientSecret: this.clientSecret,
            redirectUri: window.location.origin + "/success.html",
        });

        this.url = this.oauth.generateAuthUrl({
            scope: "identify guilds",
            responseType: 'token',
            state: crypto.randomBytes(16).toString("hex"), 
        });

        this.getUser(window.localStorage.getItem('discordAccessToken'))

        return true
    }

    logOut()
    {
        if(!this.loggedIn) return
        // let access_token = window.localStorage.getItem('discordAccessToken');
        // if(!access_token) return
        // const credentials = Buffer.from(`${this.clientId}`).toString("base64"); 

        // this.oauth.revokeToken(access_token, credentials).then((response) => {
            window.localStorage.removeItem('discordAccessToken');
            this.userData = undefined;
            this.setLoggedIn(false);
        // }); 
    }

    logInToDiscord()
    {
        if(this.loggedIn)
            this.logOut();
        else
        {
            window.addEventListener("message", function(ev) {
                if (ev.data.message === "deliverResult") {
                    let params = ev.data.result
                        .substr(1)
                        .split("&")
                        .map(v => v.split("="))
                        .reduce( (pre, [key, value]) => ({ ...pre, [key]: value }), {} );
                    this.getUser(params.access_token)
                    ev.source.close();
                }
            }.bind(this));
            
            //let authWindow = 
            window.open(this.url, 'Login');
        }
    }
    
    // this acts as the login 
    //   - if we fail to get the user data, we may as well bind that to if we are logged in!
    getUser(access_token)
    {
        if(!access_token) return
            
        this.oauth.getUser(access_token)
        .then((user_data) => {
            console.log("Successfully logged into discord!");
            window.localStorage.setItem('discordAccessToken', access_token)
            this.setLoggedIn(true)
            this.userData = user_data;
            this.serviceHandler.setData({ discordName: this.userData.username, discordID: this.userData.id });
        })
        .catch((error) => {
            console.log('Sorry, could not log you in. Your session may have expired.')
            window.localStorage.removeItem('discordAccessToken')
            this.userData = undefined;
            this.setLoggedIn(false)
        })
    }

    async getUserGuilds()
    {
        return await new Promise((resolve, reject) => {
            try{
                const access_token = window.localStorage.getItem('discordAccessToken')
                this.oauth.getUserGuilds(access_token).then((user_guilds) => {
                    resolve(user_guilds);
                })
            } catch(error) {
                reject(error)
            }
        })
    }

    setLoggedIn(loggedIn)
    {
        this.loggedIn = loggedIn;
        this.serviceHandler.setLinked(loggedIn);
    }
}