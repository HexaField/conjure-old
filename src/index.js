const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
const isProduction = process.env.NODE_ENV === 'development';
console.log('Launched ' + (isBrowser ? 'browser' : 'node') + ' on ' + process.env.NODE_ENV + ' network');