import { APIEmbedAuthor, TimestampStylesString, User } from 'discord.js';
import { readdirSync } from 'node:fs';

const mentionPatterns = {
	channel: /<#|>/g,
	userOrRole: /<@&?!?|>/g,
	emoji: /<:.+:|>/g
};

/**
 * @param type Mention type
 * @param mention Channel, user, role, or emoji mention
 * @returns Resource id
 */
export const extractIdFromMention = (type: keyof typeof mentionPatterns, mention: string): string => mention.replaceAll(mentionPatterns[type], '');

/**
 * @param ms Unix time in milliseconds
 */
export const msToDiscordTimestamp = (ms: number, style: TimestampStylesString) => `<t:${Math.round(ms / 1_000)}:${style}>`;

/**
 * Self-explanatory, meant for use with `Promise.catch()`
 */
export const doNothing = () => {};

/**
 * Converts Unix time in milliseconds to a high-level readable phrase, such as "3 days", "6 hours", or "2 years"
 *
 * Precision: from seconds to years: seconds, minutes, hours, days, weeks, months, years
 * @param ms Unix time in milliseconds
 */
export const msToHighestLevelTime = (ms: number) => {
	const seconds = Math.round(ms / 1_000);
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
 * @param dir Directory containing modules
 * @param callback Callback taking in the filepath, filename, and module name (filename minus the `.js` extension)
 */
export const forEachModuleIn = (dir: string, callback: (path: string, file: string, name: string) => void) =>
	readdirSync(dir)
		.filter(v => v.endsWith('.js'))
		.forEach(file => callback(`${dir}/${file}`, file, file.substring(0, file.length - 3)));

export const makeExecutorEmbedAuthor = (executor: User): APIEmbedAuthor => ({
	name: executor.username,
	icon_url: executor.displayAvatarURL()
});
