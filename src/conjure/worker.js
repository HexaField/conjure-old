// import { elementProxyReceiver } from './offscreencanvas';
// async function start() {
//     const { default: conjure } = await import('./conjure')
//     elementProxyReceiver(conjure);
// }
// start()

import { elementProxyReceiver } from './offscreencanvas';
import app from './App';

elementProxyReceiver(app);
