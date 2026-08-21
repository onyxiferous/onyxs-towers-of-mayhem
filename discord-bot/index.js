const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const onlineEmbed = new EmbedBuilder()
	.setColor('#84ed80')
	.setTitle('I\'m online!')
	.setDescription('Hosted via Oracle Cloud on Ubuntu 24/7. This is just for testing.')
	.setImage('https://media1.tenor.com/m/ckcRbRDEmN8AAAAC/smooth-brain-kitty.gif')
	.setFooter({ text: 'Bot created by Onyx' });

    const channelId = '1535497299252224110';
    const channel = await client.channels.fetch(channelId).catch(console.error);

    if (channel) {
        channel.send({ embeds: [onlineEmbed] });
    } else {
        console.error('Could not find the channel. Make sure the bot is invited to that server!');
    }
});

client.on('messageCreate', async (message) => {
    // Ignore messages sent by bots
    if (message.author.bot) return;
});

client.login(config.token);