import { Client } from "discord.js";
import { readFileSync } from "fs";
import { loadCommandModules } from "./util.js";
import { TGuild } from "./dataclasses.js";
import { setReadonly } from "./util.js";
import "./prototypes.js";

/** @type {Trustybot} */
const client = new Client({
	intents: [
		"Guilds",
		"GuildMessages"
	]
});

setReadonly(client, "tguilds", TGuild.load());
const commandModules = await loadCommandModules();

client.on("ready", client => {
	// client.application.commands.set(Object.values(commandModules).map(command => command.data))
	// 	.then(() => console.log("Set commands"));
});

client.on("interactionCreate", async interaction => {
	if (interaction.isChatInputCommand())
		commandModules[interaction.commandName].callback(client, interaction);
});

const handleExit = async () => {
	await client.destroy();
	TGuild.save(client.tguilds);
	process.exit();
};

process.on("exit", handleExit);
process.on("SIGINT", handleExit);

client.login(readFileSync("token").toString());
