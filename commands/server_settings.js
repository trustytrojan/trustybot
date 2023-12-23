import { ApplicationCommandOptionType, EmbedBuilder, resolveColor } from "discord.js";
import TGuild from "../TGuild.js";

/** @param {TbChatInputCommandInteraction} interaction */
export async function callback(interaction) {
	// don't deal with uncached guilds
	if (!interaction.inCachedGuild()) return;

	const { client, options, guild, guildId, member } = interaction;
	const tg = client.tguilds.ensure(guildId, () => new TGuild(guildId));
	
	const embed = new EmbedBuilder({
		color: resolveColor(tg.embedColor),
		author: { iconURL: guild.iconURL() }
	});
	
	if (options.data.length === 0) {
		embed.setTitle("Server settings");
		embed.addFields(
			{
				name: "Embed color",
				value: `Currently set to: \`${tg.embedColor}\`\n*Default color of embeds*`
			},
			{
				name: "Log channel",
				value: `Currently set to: ${tg.logChannelString}\n*Channel for sending server event logs*`
			},
			{
				name: "Bump reminder channel",
				value: `Currently set to: ${tg.bumpChannelString}\n*Channel where Disboard bumps are, so I can remind people*`
			},
			{
				name: "Counting channel",
				value: `Currently set to: ${tg.countChannelString}\n*Self-explanatory*`
			}
		);
	} else {
		if (!member.permissions.has("ManageGuild")) {
			interaction.replyEphemeral("You don't have the `Manage Server` permission!");
			return;
		}

		embed.setTitle("Changing server settings");

		for (const { name, value } of options.data) {
			embed.addFields({ name, value: await tg[name](value, interaction) });
		}
	}

	interaction.reply({ embeds: [embed] });
}

/** @type {import("discord.js").APIApplicationCommand} */
export const data = {
	dm_permission: false,
	description: "view or modify server settings",
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: "log_channel",
			description: `the server's log channel. to set: mention a channel; to clear: type "clear"`
		},
		{
			type: ApplicationCommandOptionType.String,
			name: "embed_color",
			description: "set the default embed color",
		}
	]
};
