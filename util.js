/**
 * @param {PropertyKey} key 
 */
export const setReadonly = (o, key, value) => Object.defineProperty(o, key, { enumerable: true, writable: false, value });
