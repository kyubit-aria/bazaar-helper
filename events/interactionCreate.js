const {Events} = require('discord.js');
module.exports =
{
    name: Events.InteractionCreate,

    async execute(interaction) 
    {
        if(!interaction.isChatInputCommand()) return;
        const command = interaction.client.commands.get(interaction.commandName);

        if(!command) 
        {
            console.error(`No Command matches ${interaction.commandName}`);
        }
        else 
        {
            try 
            {
                await command.execute(interaction);
            }
            catch (error)
            {
                console.error(error);
                await interaction.reply({content: 'Error executing command.', ephemeral: true});
            }
        }
    }
}
