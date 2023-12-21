import { ApplicationCommandOptionType } from "discord.js";
import { inspect } from "util";

/** @param {TbChatInputCommandInteraction} interaction */
export async function callback(interaction) {
	const { options, user, client } = interaction;
	if (user.id !== client.owner?.id) return;
	const code = options.getString("code", true);
	const output = inspect(await eval(code), true, options.getInteger("depth") ?? 0);
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
			name: "code",
			description: "code to eval",
			required: true
		},
		{
			type: ApplicationCommandOptionType.Integer,
			name: "depth",
			description: "recursion depth for output"
		}
	]
};
