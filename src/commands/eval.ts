import { ApplicationCommandOptionType, ChatInputApplicationCommandData } from 'discord.js';
import assert from 'node:assert';
import { Buffer } from 'node:buffer';
import { inspect } from 'node:util';
import TGuild from '../classes/TGuild.js';
import { TbChatInputCommandInteraction } from '../classes/Trustybot.js';

export async function callback(interaction: TbChatInputCommandInteraction) {
	// i have some "unused" variables below for eval usage during runtime

	// deno-lint-ignore no-unused-vars
	const { options, user, client: tb, guild, guildId, channel, channelId } = interaction;
	// deno-lint-ignore no-unused-vars
	const tg = tb.tguilds.ensure(guildId, () => new TGuild());

	if (user.id !== tb.owner?.id) {
		return;
	}

	const code = options.getString('code', true);

	let returnValue: unknown;
	try {
		returnValue = await eval(code);
	} catch (err) {
		assert(err instanceof Error);
		tb.handleError(err);
		interaction.reply(`\`\`\`js\n${err}\`\`\``);
		return;
	}

	const output = inspect(returnValue, options.getBoolean('show_hidden') ?? false, options.getInteger('depth') ?? 0);
	const outputFormatted = `\`\`\`js\n${output}\`\`\``;

	if (outputFormatted.length <= 2_000) {
		interaction.reply(outputFormatted);
	} else if (outputFormatted.length > 2_000 && outputFormatted.length <= 4_096) {
		interaction.reply({ embeds: [{ description: outputFormatted }] });
	} else {
		interaction.reply({
			files: [{ attachment: Buffer.from(output), name: 'output.js' }]
		});
	}
}

export const data: ChatInputApplicationCommandData = {
	name: 'eval',
	description: 'owner-only command!',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'code',
			description: 'code to eval',
			required: true
		},
		{
			type: ApplicationCommandOptionType.Boolean,
			name: 'show_hidden',
			description: 'whether to show hidden object properties'
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'depth',
			description: 'object recursion depth'
		}
	]
};
