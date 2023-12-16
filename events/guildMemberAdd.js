import { TextChannel, time } from "discord.js";
import assert from "assert";

/**
 * @param {import("discord.js").GuildMember & { client: Trustybot }} member
 */
export default async ({ client, guild, user }) => {
	const tg = client.tguilds.get(guild.id);
	if (!tg?.logging.enabled) return;
	const channel = await guild.channels.fetch(tg.logging.channel);
	assert(channel instanceof TextChannel);
	channel.send({ embeds: [{
		title: "User joined",
		thumbnail: { url: user.displayAvatarURL() },
		fields: [
			{ name: "Username", value: user.tag, inline: true },
			{ name: "Mention", value: user.toString(), inline: true },
			{ name: "Account created", value: time(user.createdTimestamp, "R") }
		]
	}] });
};