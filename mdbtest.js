import { MongoClient } from "mongodb";
import secrets from "./secrets.json" assert { type: "json" };
import repl from "repl";

const uri = `mongodb+srv://t:${secrets.mongodb}@cluster0.11u8ijc.mongodb.net/?retryWrites=true&w=majority`;
global.coll = (await MongoClient.connect(uri)).db("tguilds").collection("tguilds");

repl.start({
	prompt: "> ",
	useGlobal: true
});
