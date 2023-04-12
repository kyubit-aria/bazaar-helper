const fs = require('node:fs');
const path = require('node:path');
const {Client, Collection, Events, GatewayIntentBits} = require('discord.js');
require('dotenv/config');

//Initialise Client
const client  = new Client(
    {
        intents: 
        [
            GatewayIntentBits.Guilds,
        ]
    }
);

function getJSFiles(relative_path) 
{
    return fs.readdirSync(relative_path).filter(file => file.endsWith('.js'));
}

function constructPath(local_path) 
{
    return path.join(__dirname, local_path);
}

client.commands = new Collection();
const commandsPath = constructPath('commands');
const commandFiles = getJSFiles(commandsPath);
for(const file of commandFiles)
{
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command)
    {
        client.commands.set(command.data.name, command);
    }
    else
    {
        console.log(`Command at ${filePath} missing`);
    }
}

const eventsPath = constructPath('events');
const eventsFiles = getJSFiles(eventsPath);
for(const file of eventsFiles)
{
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log(event);
    if (event.once)
    {
        client.once(event.name, (...args) => event.execute(...args))
    }
    else
    {
        client.on(event.name, (...args) => event.execute(...args))
    }
}



client.login(process.env.TOKEN);


