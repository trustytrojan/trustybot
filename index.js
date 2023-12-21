import { MongoClient } from "mongodb";
import Trustybot from "./Trustybot.js";
import secrets from "./secrets.json" assert { type: "json" };

const mdb_uri = `mongodb+srv://t:${secrets.mongodb}@cluster0.11u8ijc.mongodb.net/?retryWrites=true&w=majority`;

global.client = new Trustybot({
	intents: ["Guilds", "GuildMembers", "GuildModeration"],
	tguilds: (await MongoClient.connect(mdb_uri)).db("tguilds").collection("tguilds")
});
