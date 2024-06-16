/**
 * @param {import('discord.js').BaseInteraction & { client: import('../classes/Trustybot').default }} interaction
 */
export default async (interaction) => {
	const { client: tb } = interaction;
	try {
		if (interaction.isChatInputCommand())
			await tb.commands[interaction.commandName].callback(interaction);
		if (interaction.isChannelSelectMenu())
			tb.emit("channelSelectMenu", interaction);
	} catch (err) {
		if (interaction.isRepliable())
			interaction.reply(`**this is an error**\`\`\`js\n${err.stack}\`\`\``);
		tb.handleError(err);
	}
};