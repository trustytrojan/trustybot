import { Client } from 'discord.js';
import Trustybot from '../classes/Trustybot.js';

export default (tb: Trustybot & Client<true>) => {
	console.log(`Logged in as ${tb.user.tag}`);
	tb.fetchOwner();

	const commandData = Object.values(tb.commands).map((command) => command!.data);

	tb.guilds.cache.forEach(async (guild) => {
		await guild.commands.set(commandData);
		console.log(`Set commands for guild "${guild.name}"`);
	});
};
