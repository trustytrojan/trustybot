import { Client } from "discord.js";
import { readFileSync, readdirSync } from "fs";
import TGuild from "./TGuild.js";
import assert from "assert";
import "./prototypes.js";

export default class Trustybot extends Client {
	/**
	 * @param {{ 
	 *   intents: import("discord.js").GatewayIntentsString[],
	 *   tokenPath: string
	 * }}
	 */
	constructor({ intents, tokenPath }) {
		assert(intents instanceof Array);
		assert(typeof tokenPath === "string");
		super({ intents });
		this.tguilds = TGuild.load();
		/** @type {import("discord.js").User?} */
		this.owner = null;
		this.loadCommands()
			.then(this.registerEventListeners.bind(this))
			.then(() => this.login(readFileSync(tokenPath, "utf8")));
	}

	async loadCommands() {
		/** @type {{ [_: string]: CommandModule }} */
		this.commands = {};

		for (const file of readdirSync("commands").filter(v => v.endsWith(".js"))) {
			const name = file.substring(0, file.length - 3);
			const { data, callback } = this.commands[name] = await import(`./commands/${file}`);
			assert(typeof data === "object");
			assert(typeof callback === "function");
			data.name = name;
		}
	}

	async registerEventListeners() {
		for (const file of readdirSync("events").filter(v => v.endsWith(".js"))) {
			const name = file.substring(0, file.length - 3);
			const callback = (await import(`./events/${file}`)).default;
			assert(typeof callback === "function");
			this.on(name, callback);
		}

		process.on("uncaughtException", (err) => { this.handleError(err).then(this.handleExit.bind(this)); });
		this.on("error", this.handleError.bind(this));

		/**
		 * @param {this | NodeJS.Process} x 
		 * @param {keyof import("discord.js").ClientEvents | NodeJS.Signals} v 
		 */
		const handleExitEvent = (x, v) => x.on(v, () => { console.log(v); this.handleExit(); });
		handleExitEvent(this, "invalidated");
		handleExitEvent(process, "SIGINT");
		handleExitEvent(process, "SIGTERM");
	}

	/**
	 * @param {Error} err 
	 */
	async handleError(err) {
		console.error(err);
		await this.application.owner.send(`\`\`\`${err.stack}\`\`\``);
	}

	async handleExit() {
		await this.destroy();
		console.log("Destroyed client");
		TGuild.save(this.tguilds);
		console.log("Saved TGuilds");
		process.exit();
	}
}
