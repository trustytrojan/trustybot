import assert from "assert";
import { User } from "discord.js";

/**
 * @param {import("discord.js").Client<true> & import("../Trustybot.js").default} client 
 */
export default (client) => {
	console.log(`Logged in as ${client.user.tag}`);
	client.application.fetch()
		.then(({ owner }) => {
			assert(owner instanceof User);
			client.owner = owner;
		});
	// client.application.commands.set(Object.values(client.commands).map(command => command.data))
	// 	.then(() => console.log("Set global commands"));
};