/**
 * @param {import("discord.js").Message & { client: import("../Trustybot").default }} message
 */
export default async (message) => {
	const { client, channelId, channel, content, author } = message;

	if (message.inGuild()) {
		const { guildId } = message;
		const tg = client.tguilds.get(guildId);

		if (channelId === tg?.bumpChannel &&
			author.id === '302050872383242240' && // DISBOARD bot id
			message.embeds[0].description.startsWith('Bump done!')
		) {
			// Reset this server's timer
			clearTimeout(client.bumpReminders.get(guildId));
			client.bumpReminders.set(guildId,
				setTimeout(
					() => channel.send('bump reminder'),
					2 * 3600 * 1e3 // 2 hours
				));
		}

		if (author.bot)
			return;

		if (channelId === tg?.counting.channel) {
			const number = Number.parseInt(content);

			if (isNaN(number))
				return;

			if (number === tg.counting.count && author.id !== tg.counting.lastUser) {
				tg.counting.lastUser = author.id;
				++tg.counting.count;
				message.react("✅");
			} else {
				tg.counting.lastUser = null;
				tg.counting.count = 1;
				channel.send(`:x: ${author} ruined the count! counter reset back to 1.`);
			}
		}
	}
};