/**
 * @param {import("discord.js").Interaction & { client: import("../Trustybot").default }} interaction
 */
export default (interaction) => {
	const { client } = interaction;
	try {
		if (interaction.isChatInputCommand())
			client.commands[interaction.commandName].callback(interaction);
		if (interaction.isChannelSelectMenu())
			client.emit("channelSelectMenu", interaction);
	} catch (err) {
		if (interaction.isRepliable())
			interaction.reply(`**this is an error**\`\`\`js\n${err.stack}\`\`\``);
		client.handleError(err);
	}
};