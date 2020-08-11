# Conjure Prototype

[Try it out](https://dev.conjure.world/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/cc732b95-d887-4a2d-8a33-2a8e94d46808/deploy-status)](https://app.netlify.com/sites/devconjureworld/deploys)

## Install guide

Install the latest versions of Git, node and yarn if you haven't, then navigate to the folder you want to download conjure to.

2.25.0 or higher https://git-scm.com/book/en/v2/Getting-Started-Installing-Git	

14.4.0 or higher https://nodejs.org/en/download/package-manager/	

1.22.4 or higher https://classic.yarnpkg.com/en/docs/install/ (on windows you will need to restart cmd)	

```	
git clone https://github.com/hexafield/conjure
cd conjure/	
yarn install	
```	

**Launch**

Run browser and node on development network

`yarn dev`

Run browser and node on production network

`yarn start`

To run production network seperately 

```
yarn start-browser
yarn start-node
```

To run development network seperately

```
yarn dev-browser
yarn dev-node
```

**Updating Conjure**	

Simply navigate to the root project directory and pull the source.	
```	
git pull	
```	

If you become stuck, simply delete the folder and download the branch again.

Support me here https://ko-fi.com/joshfield