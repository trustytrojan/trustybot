/**
 * @param {PropertyKey} key 
 */
export const setReadonly = (o, key, value) => Object.defineProperty(o, key, { enumerable: true, writable: false, value });

/**
 * @param {string} s 
 * @returns {string}
 */
export const extractChannelId = (s) => s.replaceAll(/<#|>/g, "");

/**
 * @param {string} s 
 */
export const isChannelId = (s) => s.match(/<#\d+>/g);
