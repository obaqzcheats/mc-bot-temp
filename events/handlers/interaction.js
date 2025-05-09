const { EmbedBuilder } = require('discord.js');

const { log } = require('../../functions/util');
const config = require('../../config.json');

const { user, createuser } = require('../../loaders/database');

module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (!interaction.isCommand()) return


        // you should do ratelimiting, and db checks here, not provided in this example
            // could do with more handling

        let dbuser = await user.findOne({ id: interaction.user.id })
        if(!dbuser) dbuser = await createuser(interaction.user.id)

        const command = client.commands.get(interaction.commandName)
        if (!command) return

        try {        
            log('info', `${interaction.user.username} (${interaction.user.id}) used /${interaction.commandName}${interaction.options.data.length ? ` - ${interaction.options.data.map(opt => `${opt.name} > ${opt.value}`).join(', ')}` : ''} - (${interaction?.guild?.name ?? "dms"} ${interaction?.guild?.id ?? ""})`);
            await command.execute(interaction, client, dbuser); 
        } catch (error) {
            if (error.code === 10008) return; // unknown interaction code
            if (error.code === 50007) return; // unknown application command
    
            log('error', `${interaction.user.username} / ${interaction.commandName} - error while executing the command ${interaction.commandName} - ${error}`)

            if (interaction.replied || interaction.deferred) {
                await interaction?.followUp({ content: 'there was an error while executing this command.', flags: 64 }).catch(() => {}); 
            } else { // catch is as if message doesnt exist discord js doesnt handle it 
                await interaction?.reply({ content: 'there was an error while executing this command.', flags: 64 }).catch(() => {});
            }
        }
    }
}

