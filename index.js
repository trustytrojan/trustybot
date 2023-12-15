import { Client } from "discord.js";
import { readFileSync } from "fs";
import importModules from "./importModules.js";
import assert from "assert";

let client = new Client({
	intents: [
		"Guilds",
		"GuildMessages"
	]
});

const commands = await importModules("./commands");

client.on("ready", async client => {
	assert((await client.application.fetch()).owner instanceof User);

});

client.on("interactionCreate", async interaction => {
	if (!interaction.inCachedGuild()) return;
	if (interaction.isChatInputCommand())
		commands[interaction.commandName].callback(client, interaction);
});

client.login(readFileSync("token").toString()).then(async () => {
	assert((await client.application.fetch()).owner instanceof User);
});
