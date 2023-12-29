import assert from "assert";
import { User } from "discord.js";

/**
 * @param {import("discord.js").Client<true> & import("../Trustybot.js").default} client 
 */
export default (client) => {
	console.log(`Logged in as ${client.user.tag}`);

	client.application.fetch().then(({ owner }) => {
		assert(owner instanceof User);
		client.owner = owner;
		console.log("Fetched owner");
	});

	const commandData = Object.values(client.commands).map(command => command.data);

	// client.application.commands.set([]).then(() => console.log("Set global commands"));

	client.guilds.fetch("1184967287439106098").then(async guild => {
		await guild.commands.set(commandData);
		console.log(`Set commands for guild "${guild.name}"`);
	});
};