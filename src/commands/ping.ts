import { ChatInputApplicationCommandData } from 'discord.js';
import { TbChatInputCommandInteraction } from '../classes/Trustybot.js';

export function callback(interaction: TbChatInputCommandInteraction) {
	interaction.reply('`' + interaction.client.ws.ping + 'ms`');
}

export const data: ChatInputApplicationCommandData = {
	name: 'ping',
	description: 'ping',
};
