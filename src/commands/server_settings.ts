import {
	ApplicationCommandOptionType,
	ChannelType,
	ChatInputApplicationCommandData,
	ColorResolvable,
	EmbedBuilder,
	resolveColor,
	TextChannel,
} from 'discord.js';
import TGuild from '../classes/TGuild.js';
import { TbChatInputCommandInteraction } from '../classes/Trustybot.js';
import assert from 'node:assert';

const humanReadableSettingNames = {
	embed_color: 'Embed color',
	log_channel: 'Logging channel',
	bump_channel: 'Bump reminder channel',
	counting_channel: 'Counting channel',
};

export const callback = (interaction: TbChatInputCommandInteraction) => {
	// don't deal with uncached guilds
	if (!interaction.inCachedGuild()) return;

	const { client: tb, options, guild, guildId, member } = interaction;
	const tg = tb.tguilds.ensure(guildId, () => new TGuild());

	if (!member.permissions.has('ManageGuild')) {
		interaction.replyEphemeral(
			"You don't have the `Manage Server` permission!",
		);
		return;
	}

	const embed = new EmbedBuilder({
		color: resolveColor(tg.embedColor as ColorResolvable),
		author: { name: guild.name, iconURL: guild.iconURL() ?? void 0 },
	});

	if (options.data.length === 0) {
		embed.setTitle('Server settings');
		const makeFieldValue = (val: string, desc: string, wrap?: boolean) =>
			`**Value:** ${wrap ? `\`${val}\`` : val}\n*${desc}*`;
		embed.addFields(
			{
				name: 'Embed color',
				value: makeFieldValue(tg.embedColor, 'Default color of embeds', true),
			},
			{
				name: 'Log channel',
				value: makeFieldValue(tg.logChannelString, 'Channel for sending server event logs'),
			},
		);
	} else {
		if (!member.permissions.has('ManageGuild')) {
			interaction.replyEphemeral("You don't have the `Manage Server` permission!");
			return;
		}

		embed.setTitle('Changing server settings');

		for (const { name, value, channel } of options.data) {
			let embedValue = '';

			switch (name) {
				case 'embed_color':
					{
						assert(typeof value === 'string');
						try {
							embed.setColor(value as ColorResolvable);
						} catch {
							embedValue = `**error:** \`${value}\` is not a hex color code`;
						}
						embedValue = `\`${tg.embedColor}\` ➡️ \`${tg.embedColor = value}\``;
					}
					break;

				case 'log_channel':
					{
						if (!(channel instanceof TextChannel) || !guild.members.me) {
							return `**error:** something went wrong, try again later`;
						}
						if (!channel.permissionsFor(guild.members.me).has('SendMessages')) {
							return `**error:** i cannot send messages in ${value}`;
						}
						embedValue = `${tg.logChannelString} ➡️ <#${tg.logChannel = channel.id}>`;
					}
					break;
			}

			embed.addFields({
				name: humanReadableSettingNames[name as keyof typeof humanReadableSettingNames],
				value: embedValue,
			});
		}
	}

	interaction.reply({ embeds: [embed] });
};

export const data: ChatInputApplicationCommandData = {
	name: 'server_settings',
	dmPermission: false,
	description: 'view or modify server settings',
	options: [
		{
			type: ApplicationCommandOptionType.String,
			name: 'embed_color',
			description: 'set the default embed color i use',
		},
		{
			type: ApplicationCommandOptionType.Channel,
			channel_types: [ChannelType.GuildText],
			name: 'log_channel',
			description: 'set the channel i send server event logs in',
		},
	],
};
