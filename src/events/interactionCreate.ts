import { Interaction } from 'discord.js';
import { TbChatInputCommandInteraction, TbOwned } from '../classes/Trustybot.js';
import assert from 'node:assert';

export default async (interaction: Interaction & TbOwned) => {
	const { client: tb } = interaction;
	try {
		if (interaction.isChatInputCommand() && interaction.inCachedGuild()) {
			await tb.commands[interaction.commandName]?.callback(interaction as TbChatInputCommandInteraction);
		}
	} catch (err) {
		assert(err instanceof Error);
		if (interaction.isRepliable()) {
			interaction.reply(`**this is an error**\`\`\`js\n${err.stack}\`\`\``);
		}
		tb.handleError(err);
	}
};
