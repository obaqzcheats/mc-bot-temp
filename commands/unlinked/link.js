const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const { Authflow, Titles, RelyingParty } = require('prismarine-auth');
const { RealmAPI, BedrockRealmAPI } = require('prismarine-realms');

const config = require('../../config.json');

let linking = new Set()
let timeout
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('link to ' + config.embeds.title), // yes i fucking use the embed title lMFAO
    async execute(interaction, client, user) {
        // this needs the embeds, and some other stuff adding, i aint here to do all that
        if (user.linked) return interaction.reply('you are already linked!');
        if (linking.has(interaction.user.id)) return interaction.reply('you are already linking!');
        linking.add(interaction.user.id)

        await interaction.reply({ content: "please wait...", flags: 64 })

        try {
            const flow = new Authflow(undefined, './data/users/'+ interaction.user.id,
                { flow: "sisu", authTitle: Titles.MinecraftPlaystation, deviceType: "PlayStation" },
                async (code) => {
                    // console.log(code)
                    await interaction.editReply({ content: `\`\`\`json\n${JSON.stringify(code, null, 2)}\`\`\``, flags: 64 });

                    timeout = setTimeout(async () => {
                        linking.delete(interaction.user.id)
                        await interaction.editReply({ content: 'auth timed out', flags: 64 });
                        return clearTimeout(timeout);
                    }, 300000);
                });

            let token = await flow.getXboxToken()
            if(!token || typeof token.userXUID != 'string') return interaction.editReply({ content: 'something went wrong', flags: 64 });

            const xbox = await fetch(`https://peoplehub.xboxlive.com/users/me/people/xuids(${token.userXUID})/decoration/detail,preferredColor,presenceDetail`, {
                method: "GET",
                headers: {
                    "x-xbl-contract-version": 4,
                    "Accept-Encoding": "gzip, deflate",
                    "Accept": "application/json",
                    "User-Agent": "WindowsGameBar/5.823.1271.0",
                    "Accept-Language": "en-US",
                    "Authorization": `XBL3.0 x=${token.userHash};${token.XSTSToken}`,
                    "Host": "peoplehub.xboxlive.com",
                    "Connection": "Keep-Alive"
                }
            });

            clearTimeout(timeout) // linking timeout as we just sent a request this should be fine

            if (!xbox.ok){
                linking.delete(interaction.user.id)
                return interaction.editReply({ content: 'there was an error while linking your account.', flags: 64 })
            }

            const xboxdata = await xbox.json()
            console.log(xboxdata.people[0])
            user.xbox = xboxdata.people[0]

            // do playfab here i aint doing althat now

            user.linked = true
            user.coins = 1000
            await user.save()

            linking.delete(interaction.user.id)
            return interaction.editReply({ content: `${xboxdata.people[0].gamertag} has been linked`, flags: 64 })

        } catch (error) {
            clearTimeout(timeout)
            console.log(error)
            linking.delete(interaction.user.id)
            return interaction.editReply({ content: 'there was an error while linking your account.', flags: 64 })
        }

    }
}
