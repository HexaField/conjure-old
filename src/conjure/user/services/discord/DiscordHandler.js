import { THREE } from 'enable3d'
import * as DiscordOauth2 from 'discord-oauth2'
import crypto from 'crypto'

export default class DiscordHandler
{  
    constructor(service)
    {
        this.serviceHandler = service;
        this.loader = new THREE.FileLoader();
        this.userData = undefined;
        this.accessDiscord = this.accessDiscord.bind(this);
        this.loggedIn = false;
    }

    tryConnect()
    {
        this.load('discord-info.txt', this.accessDiscord);
    }

    load(file, callback)
    {
        this.loader.load(
            file,
            ( data ) => { callback(data) },
            ( xhr ) => { 
                // console.log( (xhr.loaded / xhr.total * 100) + '% loaded' ); 
            },
            ( err ) => { console.error( 'Failed to load discord key, could not log in.' ); }
        );
    }

    logOut()
    {
        if(!this.loggedIn) return;
        let accessToken = JSON.parse(window.localStorage.getItem('discordAccessToken'));
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64"); 
        this.oauth.revokeToken(accessToken.access_token, credentials).then((response) => {
            window.localStorage.removeItem('discordAccessToken');
            this.userData = undefined;
            this.setLoggedIn(false);
        }); 
    }

    accessDiscord(data)
    {
        let data_split = data.split('\n');
        this.clientId = data_split[0];
        this.clientSecret = data_split[1];

        this.oauth = new DiscordOauth2({
            clientId: this.clientId,
            clientSecret: this.clientSecret,
            redirectUri: window.location.href+"success.html",
        });

        this.url = this.oauth.generateAuthUrl({
            scope: "identify guilds",
            state: crypto.randomBytes(16).toString("hex"), 
        });

        if(window.localStorage.getItem('discordAccessToken'))
        {
            let accessToken = JSON.parse(window.localStorage.getItem('discordAccessToken'));
            this.oauth.tokenRequest({
                refreshToken: accessToken.refresh_token,
                grantType: "refresh_token",
                scope: "identify guilds",
            }).then((access_token) => {
                console.log("Successfully logged into discord with refresh token!");
                window.localStorage.setItem('discordAccessToken', JSON.stringify(access_token));
                this.setLoggedIn(true);
                this.getUser(access_token);
            }).catch((error) => {
                console.log(error);
                window.localStorage.removeItem('discordAccessToken');
                this.userData = undefined;
                this.setLoggedIn(false);
            });
        }
    }

    logInToDiscord()
    {
        if(this.loggedIn)
            this.logOut();
        else
        {
            window.addEventListener("message", function(ev) {
                if (ev.data.message === "deliverResult") {
                    let params = (new URL(ev.data.result)).searchParams;
                    this.logIn(params.get('code'), params.get('state'))
                    ev.source.close();
                }
            }.bind(this));
            
            //let authWindow = 
            window.open(this.url, 'Login');
        }
    }

    logIn(code, state)
    {
        this.oauth.tokenRequest({
            code: code,
            scope: "identity guilds",
            grantType: "authorization_code",
        }).then((access_token) => {
            console.log("Successfully logged into discord!");
            window.localStorage.setItem('discordAccessToken', JSON.stringify(access_token));
            this.setLoggedIn(true);
            this.getUser(access_token);
        }).catch((error) => {
            console.log(error);
            window.localStorage.removeItem('discordAccessToken');
            this.userData = undefined;
            this.setLoggedIn(false);
        });
    }

    getUser(access_token)
    {
        this.oauth.getUser(access_token.access_token).then((user_data) => {
            this.userData = user_data;
            this.serviceHandler.setData({ discordName: this.userData.username, discordID: this.userData.id });
        });
    }

    async getUserGuilds()
    {
        return await new Promise((resolve, reject) => {
            try{
                this.oauth.getUserGuilds(JSON.parse(window.localStorage.getItem('discordAccessToken')).access_token).then((user_guilds) => {
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