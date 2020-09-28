module.exports = {
  mount: {
    public: "/",
    src: "/_dist_"
  },
  devOptions: {
    port: 3000
  },
  plugins: [
    ["@snowpack/plugin-optimize"],
    // [
    //   "snowpack-plugin-skypack-replacer", {
    //     "modules": {
    //       "orbit-db": "^0.25.1",
    //       "three": "^0.120.0",
    //       "ipfs": "^0.50.2",
    //       "ipfs-pubsub-room": "^2.0.1",
    //       "libp2p-tcp": "^0.15.1",
    //       "libp2p-webrtc-star": "^0.20.1",
    //       "libp2p-websockets": "^0.14.0",
    //     },
    //     "extensions": [".js"]
    //   }
    // ]
  ],  
  installOptions: {
    treeshake: true,
    polyfillNode: true,
    // rollup: {
    //   plugins: [
    //     // require('@rollup/plugin-node-resolve').nodeResolve({browser:true}),
    //     // require('rollup-plugin-node-polyfills')({crypto: true})
    //   ],
    // },
    namedExports: [
      "@enable3d/ammo-physics",
      "enable3d",
      "omggif"
    ] 
  },
}
