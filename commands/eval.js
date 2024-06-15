import { ApplicationCommandOptionType } from 'discord.js';
import { inspect } from 'util';
import TGuild from '../classes/TGuild.js';

/** @param {TbChatInputCommandInteraction} interaction */
export async function callback(interaction) {
	const { options, user, client: tb, guild, guildId, channel, channelId } = interaction;

	const tg = tb.tguilds.ensure(guildId, () => new TGuild);

	if (user.id !== tb.owner?.id)
		return;

	const code = options.getString("code", true);

	let returnValue;
	try { returnValue = await eval(code); }
	catch (err) {
		tb.handleError(err);
		interaction.reply(`\`\`\`js\n${err}\`\`\``);
		return;
	}

	const output = inspect(returnValue, options.getBoolean('show_hidden'), options.getInteger("depth") ?? 0);
	const outputFormatted = `\`\`\`js\n${output}\`\`\``;

	if (outputFormatted.length <= 2000)
		interaction.reply(outputFormatted);
	else if (outputFormatted.length > 2000 && outputFormatted.length <= 4096)
		interaction.reply({ embeds: [{ description: outputFormatted }] });
	else
		interaction.reply({ files: [{ data: Buffer.from(output), name: "output.js" }] });
}

/** @type {import("discord.js").APIApplicationCommand} */
export const data = {
	description: "owner-only command!",
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
