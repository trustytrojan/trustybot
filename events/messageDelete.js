import assert from 'assert';
import { TextChannel } from 'discord.js';
import { makeExecutorEmbedAuthor } from '../misc/util.js';

/**
 * @typedef {import('discord.js').GuildAuditLogsEntry<import('discord.js').AuditLogEvent.MessageDelete>} MessageDeleteEntry
 */

/** @type {{ [_: string]: number }} */
const msgDelEntryCount = {};

/**
 * @param {import('discord.js').Message & TbOwned} message
 */
export default async (message) => {
	const { client: tb, guild, channel, channelId, author, content, attachments, stickers } = message;
	const tg = tb.tguilds.get(guild.id);

	if (!tg?.logChannel || tg.logChannel === channelId)
		// ignore messages sent in the log channel
		return;

	const logChannel = await guild.channels.fetch(tg.logChannel);
	assert(logChannel instanceof TextChannel);

	/** @type {MessageDeleteEntry | undefined} */
	let entry = await guild.fetchLatestAuditLogEntry(['MessageDelete']);

	if (entry) {
		// get old count
		const oldCount = msgDelEntryCount[entry.id];

		// save new count
		const newCount = msgDelEntryCount[entry.id] = entry.extra.count;

		if (newCount <= oldCount)
			// the count didn't increase! don't display the executor.
			entry = null;
	}

	/** @type {import('discord.js').APIEmbed[]} */
	const embeds = [{
		author: entry ? makeExecutorEmbedAuthor(entry.executor) : null,
		title: 'Message deleted',
		fields: [
			{ name: 'Channel', value: channel.toString(), inline: true },
			{ name: 'Author', value: author.toString(), inline: true },
			...(content.length ? [{ name: 'Content', value: content.slice(0, 1024) }] : []),
			...(attachments.size ? [{ name: 'Attachments', value: 'See embeds below' }] : []),
			...(stickers.size ? [{ name: 'Stickers', value: 'See embeds below' }] : [])
		]
	}];

	/** @type {import('discord.js').AttachmentPayload[]} */
	const files = [];

	let i = 1;
	for (const { url, name, description, contentType, attachment } of attachments.values()) {
		files.push({ attachment, name, description });
		embeds.push({
			title: name,
			url,
			image: contentType.includes('image') ? { url: `attachment://${name}` } : null,
			description,
			footer: { text: `Attachment ${i++}/${attachments.size}` }
		});
	}

	i = 1;
	for (const { name, url } of stickers.values())
		embeds.push({
			title: name,
			url,
			image: { url: url.replace('cdn.discordapp.com', 'media.discordapp.net') },
			footer: { text: `Sticker ${i++}/${stickers.size}` }
		});

	logChannel.send({ embeds, files }).catch(tb.boundHandleError);
};