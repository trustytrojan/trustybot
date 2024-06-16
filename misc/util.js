import { AuditLogEvent, TextChannel } from "discord.js";
import { readdirSync } from "fs";

const mentionPatterns = {
	channel: /<#|>/g,
	userOrRole: /<@&?!?|>/g,
	emoji: /<:.+:|>/g
};

/**
 * @param {"channel" | "userOrRole" | "emoji"} type Mention type
 * @param {string} mention Channel, user, role, or emoji mention
 * @returns {string} Resource id
 */
export const extractIdFromMention = (type, mention) => mention.replaceAll(mentionPatterns[type], "");

/**
 * @param {string} mention Channel mention in the form `<#id>`
 * @param {import("discord.js").Guild | import("discord.js").Client} 
 * @returns {Promise<string | import("discord.js").TextChannel>}
 */
export const ssGetTextChannelFromMention = async (mention, { channels }) => {
	const channelId = extractIdFromMention("channel", mention);
	let channel;
	try { channel = await channels.fetch(channelId); }
	catch { return `**error:** \`${value}\` is not a channel mention`; }
	if (!(channel instanceof TextChannel))
		return `**error:** channel ${value} is not a text channel`;
	return channel;
};

/**
 * @param {number} ms Unix time in milliseconds
 * @param {import("discord.js").TimestampStylesString} style 
 */
export const msToDiscordTimestamp = (ms, style) => `<t:${Math.round(ms / 1000)}:${style}>`;

/**
 * Self-explanatory, meant for use with `Promise.catch()`
 */
export const doNothing = () => {};

/**
 * Converts Unix time in milliseconds to a high-level readable phrase, such as "3 days", "6 hours", or "2 years"
 * 
 * Precision: from seconds to years: seconds, minutes, hours, days, weeks, months, years
 * @param {number} ms Unix time in milliseconds
 */
export const msToHighestLevelTime = (ms) => {
	const seconds = Math.round(ms / 1000);
	if (seconds < 60) return `${seconds} seconds`;

	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} minutes`;

	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} hours`;

	const days = Math.round(hours / 24);
	if (days < 7) return `${days} days`;

	const weeks = Math.round(days / 7);
	if (weeks < 4) return `${weeks} weeks`;

	const months = Math.round(days / 30);
	if (months < 12) return `${months} months`;

	const years = Math.round(days / 365);
	return `${years} years`;
};

/**
 * For each `.js` module in `dir`, call `callback` with the module's filename and name.
 * @param {string} dir Directory containing modules
 * @param {(file: string, name: string) => *} callback Callback taking in the filename and module name (filename minus the `.js` extension)
 */
export const forEachModuleIn = (dir, callback) =>
	readdirSync(dir)
		.filter(v => v.endsWith(".js"))
		.forEach(file => callback(file, file.substring(0, file.length - 3)));

/**
 * Return the audit log entry of `type` in `guild` created within the last 5 seconds.
 * Returns `undefined` if no such entry is found.
 * @param {import('discord.js').Guild} guild 
 * @param {keyof typeof import('discord.js').AuditLogEvent} type 
 */
export const getLatestAuditLogEntry = async (guild, type) => {
	const entry = (await guild.fetchAuditLogs({ type: AuditLogEvent[type], limit: 1 })).entries.first();
	if (Date.now() - entry.createdTimestamp > 5_000)
		return;
	return entry;
}

/**
 * @param {import('discord.js').User} executor 
 * @returns {import('discord.js').APIEmbedAuthor}
 */
export const makeExecutorEmbedAuthor = (executor) =>
	({ name: `Executor: ${executor.username}`, icon_url: executor.displayAvatarURL() });
