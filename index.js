new (await import("./Trustybot.js")).default({
	intents: ["Guilds", "GuildMembers", "GuildModeration"],
	tokenPath: "./token"
});