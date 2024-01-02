import { TextChannel } from "discord.js";
import { readdirSync } from "fs";

/**
 * Meant for use in `extractIdFromMention`
 */
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
	const seconds = ms / 1000;
	if (seconds < 60) return `${seconds} seconds`;

	const minutes = seconds / 60;
	if (minutes < 60) return `${minutes} minutes`;

	const hours = minutes / 60;
	if (hours < 24) return `${hours} hours`;

	const days = hours / 24;
	if (days < 7) return `${days} days`;

	const weeks = days / 7;
	if (weeks < 4) return `${weeks} weeks`;

	const months = days / 30;
	if (months < 12) return `${months} months`;

	const years = days / 365;
	return `${years} years`;
};

/**
 * For each `.js` module in `dir`, call `callback` with the module's filename and name.
 * @param {string} dir Directory containing modules
 * @param {(file: string, name: string) => *} callback Callback taking in the filename and module name (filename minus the .js extension)
 */
export const forEachModuleIn = (dir, callback) =>
	readdirSync(dir)
		.filter(v => v.endsWith(".js"))
		.forEach(file => callback(file, file.substring(0, file.length - 3)));
