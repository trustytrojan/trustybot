import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, resolveColor } from 'discord.js';
import TGuild from '../classes/TGuild.js';

const humanReadableSettingNames = {
	embed_color: 'Embed color',
	log_channel: 'Logging channel',
	bump_channel: 'Bump reminder channel',
	counting_channel: 'Counting channel'
};

/** @param {TbChatInputCommandInteraction} interaction */
export const callback = async (interaction) => {
	// don't deal with uncached guilds
	if (!interaction.inCachedGuild()) return;

	const { client: tb, options, guild, guildId, member } = interaction;
	const tg = tb.tguilds.ensure(guildId, () => new TGuild);

	if (!member.permissions.has('ManageGuild')) {
		interaction.replyEphemeral("You don't have the `Manage Server` permission!");
		return;
	}

	const embed = new EmbedBuilder({
		color: resolveColor(tg.embedColor),
		author: { iconURL: guild.iconURL() }
	});

	/*
	if (options.data.length === 0) {
		embed.setTitle("Server settings");
		const makeFieldValue = (val, desc, wrap) => `**Value:** ${wrap ? `\`${val}\`` : val}\n*${desc}*`;
		embed.addFields(
			{
				name: "Embed color",
				value: makeFieldValue(tg.embedColor, "Default color of embeds", true)
			},
			{
				name: "Log channel",
				value: makeFieldValue(tg.logChannelString, "Channel for sending server event logs")
			},
			{
				name: "Bump reminder channel",
				value: makeFieldValue(tg.bumpChannelString, "Channel where Disboard bumps are, so I can remind people")
			},
			{
				name: "Counting channel",
				value: makeFieldValue(tg.counting.channelString, "Self-explanatory")
			}
		);
	} else {
		if (!member.permissions.has("ManageGuild")) {
			interaction.replyEphemeral("You don't have the `Manage Server` permission!");
			return;
		}

		embed.setTitle("Changing server settings");

		for (const { name, value } of options.data) {
			embed.addFields({
				name: humanReadableSettingNames[name],
				value: await tg[`set_${name}`](value, interaction, embed)
			});
		}
	}
	*/

	switch (options.getSubcommand(true)) {
		case 'view': {
			const makeFieldValue = (val, desc, wrap) => `**Value:** ${wrap ? `\`${val}\`` : val}\n*${desc}*`;
			embed.setTitle('Server settings');
			embed.addFields(
				{
					name: 'Embed color',
					value: makeFieldValue(tg.embedColor, 'Default color of embeds', true)
				},
				{
					name: 'Log channel',
					value: makeFieldValue(tg.logChannelString, 'Channel for sending server event logs')
				},
				{
					name: 'Bump reminder channel',
					value: makeFieldValue(tg.bumpChannelString, 'Channel where Disboard bumps are, so I can remind people')
				},
				{
					name: 'Counting channel',
					value: makeFieldValue(tg.counting.channelString, 'Self-explanatory')
				}
			);
		} break;

		case 'set':
			embed.setTitle('Changing server settings');

			for (const { name, value, type } of options.data) {
				embed.addFields({
					name: humanReadableSettingNames[name],
					value: await tg[`set_${name}`](value, interaction, embed)
				});
			}

			break;
	}

	interaction.reply({ embeds: [embed] });
};

/** @type {import('discord.js').APIApplicationCommand} */
export const data = {
	dm_permission: false,
	description: 'view or modify server settings',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'view server settings'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set',
			description: 'modify server settings',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'embed_color',
					description: 'set the default embed color i use'
				},
				{
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					name: 'log_channel',
					description: 'set the channel i send server event logs in'
				},
				{
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					name: 'bump_channel',
					description: 'set the channel i send bump reminders in'
				},
				{
					type: ApplicationCommandOptionType.Channel,
					channel_types: [ChannelType.GuildText],
					name: 'counting_channel',
					description: 'set the counting channel'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'clear',
			description: 'clear/reset a server setting to its default value, disabling the functionality of that setting',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'setting'
				}
			]
		}
	]
};

data.options.find(v => v.name === 'clear').options[0].choices =
	Object.entries(humanReadableSettingNames)
		.map(([name, value]) => ({ name, value }));
