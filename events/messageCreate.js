/**
 * @param {import("discord.js").Message & { client: import("../Trustybot").default }} message
 */
export default async (message) => {
	const { client, channelId, channel, content, author } = message;
	if (author.bot) return;
	
	if (message.inGuild()) {
		const { guildId } = message;
		const tg = client.tguilds.get(guildId);

		if (channelId === tg?.counting.channel) {
			const number = Number.parseInt(content);
			if (isNaN(number)) return;
			if (number === tg.counting.count && author.id !== tg.counting.lastUser) {
				tg.counting.lastUser = author.id;
				++tg.counting.count;
				message.react("✅");
			} else {
				tg.counting.lastUser = null;
				tg.counting.count = 1;
				channel.send(`${author} ruined the count! counter reset back to 1.`);
			}
		}

		else if (channelId === tg?.bumpChannel) {
			// Check if it is the DISBOARD bot
			if (author.id !== "302050872383242240") return;

			// Check if this is a "Bump done!" embed
			if (!message.embeds[0].description.startsWith("Bump done!")) return;

			// Reset this server's timer
			client.bumpReminders.set(guildId, setTimeout(() => channel.send1))

			// UNFINISHED
		}
	}
};