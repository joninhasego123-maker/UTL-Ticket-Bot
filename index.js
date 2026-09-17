const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const config = require("./config");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once("ready", () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.login(config.TOKEN);
