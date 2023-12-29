import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import TGuild from "./TGuild.js";
import assert from "assert";
import "./prototypes.js";
import { doNothing } from "./util.js";

export default class Trustybot extends Client {
	constructor() {
		super({ intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"] });

		this.tguilds = TGuild.loadTGuilds();

		this.bumpReminders = new Collection();

		/**
		 * This is assigned in the `ready` event listener defined in `events/ready.js`.
		 * @type {import("discord.js").User?}
		 */
		this.owner = null;

		/** @type {(err: Error) => Promise<void>} */
		this.boundHandleError = this.handleError.bind(this);

		Promise.all([this.loadCommands(), this.registerEventListeners()])
			.then(() => import("./secrets.json", { with: { type: "json" } }))
			.then(secrets => this.login(secrets.default.discord));
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

		process.on("uncaughtException", (err) => this.handleError(err).then(this.handleExit.bind(this)));
		this.on("error", this.boundHandleError);

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
		this.owner?.send(`\`\`\`js\n${err.stack}\`\`\``).catch(doNothing);
	}

	async handleExit() {
		await this.destroy();
		console.log("Destroyed client");
		TGuild.saveTGuilds(this.tguilds);
		console.log("Saved TGuilds");
		process.exit();
	}
}
