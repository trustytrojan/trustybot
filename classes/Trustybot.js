import { Client, Collection } from 'discord.js';
import TGuild from './TGuild.js';
import assert from 'assert';
import '../misc/prototypes.js';
import { doNothing, forEachModuleIn } from '../misc/util.js';

export default class Trustybot extends Client {
	constructor() {
		super({
			intents: [
				'Guilds',
				'GuildMembers',
				'GuildMessages',
				'GuildModeration',
				'MessageContent'
			]
		});

		this.tguilds = TGuild.loadTGuilds();

		/** @type {Collection<string, NodeJS.Timeout>} */
		this.bumpReminders = new Collection();

		/**
		 * This is assigned in [`events/ready.js`](../events/ready.js).
		 * @type {import("discord.js").User?}
		 */
		this.owner = null;

		/** @type {typeof this.handleError} */
		this.boundHandleError = this.handleError.bind(this);

		Promise.all([this.loadCommands(), this.registerEventListeners()])
			.then(() => import('../secrets.json', { with: { type: 'json' } }))
			.then(secrets => this.login(secrets.default.discord));
	}

	async loadCommands() {
		/** @type {{ [_: string]: CommandModule }} */
		this.commands = {};

		forEachModuleIn('commands', async (file, name) => {
			const { data, callback } = this.commands[name] = await import(`../commands/${file}`);
			assert(typeof data === 'object');
			assert(typeof callback === 'function');
			data.name = name;
		});
	}

	async registerEventListeners() {
		forEachModuleIn('events', async (file, name) => {
			const callback = (await import(`../events/${file}`)).default;
			assert(typeof callback === 'function');
			this.on(name, callback);
		});

		process.on('uncaughtException', (err) => this.handleError(err).then(this.handleExit.bind(this)));
		this.on('error', this.boundHandleError);

		const handleExitEvent = (x, v) => x.on(v, () => { console.log(v); this.handleExit(); });
		handleExitEvent(this, 'invalidated');
		handleExitEvent(process, 'SIGINT');
		handleExitEvent(process, 'SIGTERM');
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
		console.log('Destroyed client');
		TGuild.saveTGuilds(this.tguilds);
		console.log('Saved TGuilds');
		process.exit();
	}
}
