import { readdirSync } from "fs";

const commandsPath = "./commands";

export async function loadCommandModules() {
	/** @type {{ [_: string]: CommandModule }} */
	const commands = {};

	for (const file of readdirSync(commandsPath).filter(v => v.endsWith(".js"))) {
		const moduleName = file.substring(0, file.length - 3);
		commands[moduleName] = await import(`${commandsPath}/${file}`);
		commands[moduleName].data.name = moduleName;
	}

	return Object.freeze(commands);
}

/**
 * @param {PropertyKey} key 
 */
export const setReadonly = (o, key, value) => Object.defineProperty(o, key, { writable: false, value });
