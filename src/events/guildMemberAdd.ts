import { GuildMember, TextChannel } from 'discord.js';
import { msToDiscordTimestamp } from '../misc/util.js';
import assert from 'node:assert';
import { TbOwned } from '../classes/Trustybot.js';

export default async ({ client: tb, guild, user }: GuildMember & TbOwned) => {
	const tg = tb.tguilds.get(guild.id);
	if (!tg?.logChannel) return;
	const channel = await guild.channels.fetch(tg.logChannel);
	assert(channel instanceof TextChannel);
	channel.send({
		embeds: [{
			title: 'User joined',
			thumbnail: { url: user.displayAvatarURL() },
			description: user.toString(),
			fields: [
				{ name: 'Account created', value: msToDiscordTimestamp(user.createdTimestamp, 'R') },
			],
		}],
	}).catch(tb.boundHandleError);
};
