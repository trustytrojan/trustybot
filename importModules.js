import { randomInt } from "crypto";
import { readdirSync } from "fs";

/**
 * Very basic implementation using async/await
 * @param {string} dir 
 */
const importModulesAsync = async (dir) => {
	const modules = {};
	for (const file of readdirSync(dir))
		modules[file.substring(0, file.length - 3)] = await import(`${dir}/${file}`);
	return modules;
};

/**
 * SO CLOSE TO BEING ONE STATEMENT 😢
 * 
 * one statement is possible using `Array.reduce`, i will do more thinking later
 * @param {string} dir 
 */
const importModulesPromise = (dir) => {
	const modules = {};
	return new Promise(resolve => Promise.all(readdirSync(dir).map(file => import(`${dir}/${file}`).then(module => modules[file.substring(0, file.length - 3)] = module))).then(() => resolve(modules)));
};

// fun way to not let one of my implementations go to waste 😂
export default (randomInt(2) == 0) ? importModulesAsync : importModulesPromise;
