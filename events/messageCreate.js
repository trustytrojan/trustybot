/** @type {{ [_: string]: { waiting: boolean, rateLimit: Promise<void> } }} */
const countingState = {};

/**
 * @param {import('discord.js').Message & TbOwned} message
 */
export default async (message) => {
	const { client: tb, channelId, channel, content, author } = message;

	if (message.inGuild()) {
		const { guildId } = message;
		const tg = tb.tguilds.get(guildId);

		if (channelId === tg?.bumpChannel &&
			author.id === '302050872383242240' && // DISBOARD bot id
			message.embeds[0].description.startsWith('Bump done!')
		) {
			// Reset this server's timer
			clearTimeout(tb.bumpReminders.get(guildId));
			tb.bumpReminders.set(guildId,
				setTimeout(
					() => channel.send('bump reminder'),
					2 * 3600 * 1e3 // 2 hours
				));
		}

		if (author.bot)
			return;

		if (channelId === tg?.counting.channel) {
			if (!countingState[guildId])
				countingState[guildId] = { waiting: false, rateLimit: null };

			if (countingState[guildId].waiting)
				return;

			const number = Number.parseInt(content);

			if (isNaN(number))
				return;

			const awaitRateLimit = async () => {
				countingState[guildId].waiting = true;
				await countingState[guildId].rateLimit;
				countingState[guildId].waiting = false;
			};

			if (number === tg.counting.count && author.id !== tg.counting.lastUser) {
				tg.counting.lastUser = author.id;
				++tg.counting.count;
				await awaitRateLimit();
				message.react('✅');
			} else {
				tg.counting.lastUser = null;
				tg.counting.count = 1;
				await awaitRateLimit();
				channel.send(`:x: ${author} ruined the count! counter reset back to 1.`);
			}

			countingState[guildId].rateLimit = new Promise(resolve => setTimeout(resolve, 1e3));
		}
	}
};