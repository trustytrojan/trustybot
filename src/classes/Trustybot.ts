import { ChatInputApplicationCommandData, ChatInputCommandInteraction, Client, User } from 'discord.js';
import assert from 'node:assert';
import process from 'node:process';
import { TbCommandInteraction } from '../misc/prototypes.js';
import { doNothing, forEachModuleIn } from '../misc/util.js';
import TGuild from './TGuild.js';

export type TbOwned = { client: Trustybot };
export type TbChatInputCommandInteraction = ChatInputCommandInteraction<'cached'> & TbOwned & TbCommandInteraction;

export interface CommandModule {
	callback(interaction: TbChatInputCommandInteraction): unknown;
	data: ChatInputApplicationCommandData;
}

export default class Trustybot extends Client {
	public tguilds = TGuild.loadTGuilds();
	public owner: User | null = null;
	public boundHandleError = this.handleError.bind(this);
	public commands: NodeJS.Dict<CommandModule> = {};

	constructor() {
		super({
			intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'GuildModeration', 'MessageContent']
		});

		this.loadCommands();
		this.registerEventListeners();
		import(`${process.cwd()}/data/secrets.json`, {
			with: { type: 'json' }
		}).then(secrets => {
			console.log('Trustybot: Imported secrets, logging in...');
			this.login(secrets.default.discord);
		});
	}

	async fetchOwner() {
		if (!this.application) {
			throw Error('this.application is null');
		}
		const { owner } = await this.application.fetch();
		assert(owner instanceof User);
		this.owner = owner;
		console.log('Trustybot: Fetched owner');
	}

	loadCommands() {
		forEachModuleIn(`${import.meta.dirname}/../commands`, async (path, file, name) => {
			const { data, callback } = (this.commands[name] = await import(path));
			assert(typeof data === 'object');
			assert(typeof callback === 'function');
			data.name = name;
		});
		console.log('Trustybot: Loaded commands');
	}

	registerEventListeners() {
		forEachModuleIn(`${import.meta.dirname}/../events`, async (path, _, name) => {
			const callback = (await import(path)).default;
			assert(typeof callback === 'function');
			this.on(name, callback);
		});

		process.on('uncaughtException', err => this.handleError(err).then(this.handleExit.bind(this)));
		this.on('error', this.handleError.bind(this));

		const handleExitEvent = (x: NodeJS.EventEmitter, v: string) =>
			x.on(v, () => {
				console.log(v);
				this.handleExit();
			});
		handleExitEvent(this, 'invalidated');
		handleExitEvent(process, 'SIGINT');
		handleExitEvent(process, 'SIGTERM');

		console.log('Trustybot: Registered event listeners');
	}

	async handleError(err: Error) {
		console.error(err);
		return await this.owner?.send(`\`\`\`js\n${err.stack}\`\`\``).catch(doNothing);
	}

	async handleExit() {
		await this.destroy();
		console.log('Trustybot: Destroyed client');
		TGuild.saveTGuilds(this.tguilds);
		console.log('Trustybot: Saved TGuilds');
		process.exit();
	}
}
