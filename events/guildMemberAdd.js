import { TextChannel } from "discord.js";
import { msToDiscordTimestamp } from "../util.js";
import assert from "assert";

/** @param {import("discord.js").GuildMember & { client: import("../Trustybot.js").default }} */
export default async ({ client, guild, user }) => {
	const tg = client.tguilds.get(guild.id);
	if (!tg?.logChannel) return;
	const channel = await guild.channels.fetch(tg.logChannel);
	assert(channel instanceof TextChannel);
	channel.send({ embeds: [{
		title: "User joined",
		thumbnail: { url: user.displayAvatarURL() },
		fields: [
			{ name: "Username", value: user.tag, inline: true },
			{ name: "Mention", value: user.toString(), inline: true },
			{ name: "Account created", value: msToDiscordTimestamp(user.createdTimestamp, "R") }
		]
	}] }).catch(client.boundHandleError);
};