import assert from 'assert';
import { User } from 'discord.js';

/**
 * @param {import("discord.js").Client<true> & import("../classes/Trustybot.js").default} tb 
 */
export default (tb) => {
	console.log(`Logged in as ${tb.user.tag}`);

	tb.application.fetch().then(({ owner }) => {
		assert(owner instanceof User);
		tb.owner = owner;
		console.log('Fetched owner');
	});

	// const commandData = Object.values(tb.commands).map(command => command.data);

	// tb.guilds.cache.forEach(async guild => {
	// 	await guild.commands.set(commandData);
	// 	console.log(`Set commands for guild "${guild.name}"`);
	// });
};
