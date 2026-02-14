// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token, channelId, messages, intervalMin, intervalMax } = require('./config.json');
const readline = require('node:readline');
const { stdin: input, stdout: output } = require('node:process');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rl = readline.createInterface({ input, output });

// Fonction pour obtenir un message aléatoire
function getRandomMessage() {
    return messages[Math.floor(Math.random() * messages.length)];
}

// Fonction pour obtenir un intervalle aléatoire
function getRandomInterval() {
    return Math.floor(Math.random() * (intervalMax - intervalMin)) + intervalMin;
}

// Fonction pour envoyer un message automatique
async function sendRandomMessage() {


    // Programmer le prochain message
    const nextInterval = getRandomInterval();
    console.log(`Prochain message dans ${Math.round(nextInterval / 1000)} secondes`);
    setTimeout(sendRandomMessage, nextInterval);
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    console.log('Tu peux écrire des messages dans la console pour les envoyer sur Discord.');
});

// Écouter les entrées de la console
rl.on('line', async (input) => {
    if (input.trim() === '') return;
    
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            await channel.send(input);
            console.log(`Message envoyé: "${input}"`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
    }
});

// Log in to Discord with your client's token
client.login(token);