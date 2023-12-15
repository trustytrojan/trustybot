import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, resolveColor } from "discord.js";
import { TGuild } from "../dataclasses.js";

/** @type {ChatInputCommandCallback} */
export async function callback(client, interaction) {
	// don't deal with uncached guilds
	if (!interaction.inCachedGuild()) return;

	const { options, guild, guildId, member } = interaction;
	const tg = client.tguilds.ensure(guildId, () => new TGuild(guildId));
	
	const embed = new EmbedBuilder({
		color: resolveColor(tg.embedColor),
		author: { iconURL: guild.iconURL() }
	});
	
	if (options.getSubcommand() === "view") {
		embed.setTitle("Server settings");
		embed.addFields(
			{
				name: `**\`embed_color:\`** \`${tg.embedColor}\``,
				value: "The default color of embeds"
			},
			{
				name: `**\`logging.enabled:\`** \`${tg.logging.enabled}\``, 
				value: "Whether logging is enabled"
			},
			{
				name: `**\`logging.channel:\`** ${tg.logging.channel ? `<#${tg.logging.channel}>` : "(not set)"}`,
				value: "Where to send logging messages"
			}
		);
	} else {
		if (!member.permissions.has("ManageGuild")) {
			interaction.reply("you don't have `Manage Server` perms!");
			return;
		}

		embed.setTitle("Changing server settings");
		let value, fieldValue;

		if (value = options.getString("embed_color")) {
			try { // Verify that the value is a hex color code
				resolveColor(value);
				fieldValue = `${tg.embedColor} ➡️ ${tg.embedColor = value}`;
			} catch (err) {
				fieldValue = `**error:** \`${value}\` is not a hex color code`;
			}

			embed.addFields({ name: `embed_color`, value: fieldValue });
		}

		if (options.getSubcommand() === "logging") {
			if (value = options.getBoolean("enabled"))
				embed.addFields({ name: `logging.enabled`, value: `\`${tg.logging.enabled}\` ➡️ \`${tg.logging.enabled = value}\`` });
			if (value = options.getChannel("channel", false, [ChannelType.GuildText])) {
				try {
					await value.send("i will now send logging messages here!");
					fieldValue = `<#${tg.logging.channel}> ➡️ <#${tg.logging.channel = value.id}>`;
				} catch (err) {
					fieldValue = `**error:** i cannot send messages in ${value}`;
				}

				embed.addFields({ name: `logging.channel`, value: fieldValue });
			}
		}
	}

	interaction.replyEmbed(embed);
}

/** @type {import("discord.js").APIApplicationCommand} */
export const data = {
	dm_permission: false,
	description: "change server settings",
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "view",
			description: "view all server settings"
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "general",
			description: "change general server settings",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "embed_color",
					description: "set the default color of embeds"
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "logging",
			description: "change logging settings",
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: "enabled",
					description: "set whether event logging is enabled"
				},
				{
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					name: "channel",
					description: "the channel where event logging messages are sent to"
				}
			]
		}
	]
};
