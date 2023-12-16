/**
 * @param {import("discord.js").Interaction & { client: Trustybot }} interaction
 */
export default (interaction) => {
	try {
		if (interaction.isChatInputCommand())
			interaction.client.commands[interaction.commandName].callback(interaction);
	} catch (err) {
		if (interaction.isRepliable())
			interaction.reply(`**this is an error**\`\`\`js\n${err.stack}\`\`\``);
		interaction.client.handleError(err);
	}
};