const { server } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const getLocalCommands = require('../../utils/getLocalCommands');
const getApplicationCommands = require('../../utils/getApplicationCommands');

module.exports = async (client) => {

    try {
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client, server);

        for(const localCommand of localCommands){
            const {name, description, options, cooldown} = localCommand;

            const existingCommand = await applicationCommands.cache.find(
                (cmd) => cmd.name === name
            );

            if(existingCommand){
                if(localCommand.deleted){
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`Deleted command ${name}.`)
                    return;
                }

                if(areCommandsDifferent(existingCommand, localCommand)){
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                        cooldown
                    });

                    console.log(`Edited command ${name}.`);
                }
            } else{
        
                if(localCommand.deleted){
                    console.log(`Skipping restering command ${name} as it's set to delete.`);
                    continue;
                }

                await applicationCommands.create({
                  name, 
                  description,
                  options,
                  cooldown
                })

                console.log(`Registered command ${name}.`);
            }
        }
    } catch (error) {
        console.log("There was an error.", error)
    }
};