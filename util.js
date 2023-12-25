import { TextChannel } from "discord.js";

/**
 * @param {string} s String containing a channel mention, e.g. `<#1234567890>`
 * @returns {string} The channel id inside the mention, e.g. `1234567890`
 */
export const extractChannelId = (s) => s.replaceAll(/<#|>/g, "");

/**
 * @param {string} s 
 */
export const isChannelId = (s) => s.match(/<#\d+>/g);

/**
 * @param {string} mention Channel mention in the form `<#id>`
 * @param {import("discord.js").Guild | import("discord.js").Client} 
 * @returns {Promise<string | import("discord.js").TextChannel>}
 */
export const ssGetTextChannelFromMention = async (mention, { channels }) => {
	const channelId = extractChannelId(mention);
	let channel;
	try { channel = await channels.fetch(channelId) }
	catch { return `**error:** \`${value}\` is not a channel mention` }
	if (!(channel instanceof TextChannel))
		return `**error:** channel ${value} is not a text channel`;
	return channel;
};

/**
 * @param {number} ms 
 * @param {import("discord.js").TimestampStylesString} style
 */
export const formatMsTimestamp = (ms, style) => `<t:${ms}:${style}>`;
