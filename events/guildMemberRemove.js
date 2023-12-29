import { TextChannel } from "discord.js";
import { doNothing, msToHighestLevelTime } from "../util.js";
import assert from "assert";

/** @param {import("discord.js").GuildMember & { client: import("../Trustybot.js").default }} */
export default async ({ client, guild, user, joinedTimestamp }) => {
	const tg = client.tguilds.get(guild.id);
	if (!tg?.logChannel) return;
	const channel = await guild.channels.fetch(tg.logChannel);
	// assertion is necessary as only text channels can be the logChannel
	assert(channel instanceof TextChannel);
	channel.send({ embeds: [{
		title: "Member left",
		thumbnail: { url: user.displayAvatarURL() },
		fields: [
			{ name: "Username", value: user.tag, inline: true },
			{ name: "Mention", value: user.toString(), inline: true },
			{ name: "Membership duration", value: msToHighestLevelTime(Date.now() - joinedTimestamp) }
		]
	}] }).catch(client.boundHandleError);
};