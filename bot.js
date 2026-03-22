const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// CONFIG
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'J2ST-VOID-SECRET-99';
const API_BASE = process.env.BACKEND_BASE_URL || 'https://j2stbaba.pages.dev';

if(!TOKEN || !CLIENT_ID) {
    console.error("❌ DISCORD_TOKEN or CLIENT_ID is missing in .env");
    process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// COMMANDS DEFINITION
const commands = [
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Deploy the j2st.lol access control dashboard')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    new SlashCommandBuilder()
        .setName('genkey')
        .setDescription('Generate a new j2st.lol access key')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('memo')
            .setDescription('Who is this for?')
            .setRequired(false)),

    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('message')
            .setDescription('Message to send')
            .setRequired(true)),

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Make the bot send an announcement embed')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => 
            option.setName('title')
            .setDescription('Embed Title')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('description')
            .setDescription('Embed Description (Use \n for new lines)')
            .setRequired(true))
        .addStringOption(option => 
            option.setName('color')
            .setDescription('Embed Hex Color (e.g. #000000)')
            .setRequired(false)),
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('🔄 Deploying slash commands...');
        if (GUILD_ID && GUILD_ID !== 'YOUR_SERVER_ID_HERE') {
            await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        } else {
            await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        }
        console.log('✅ Commands deployed.');
    } catch (error) {
        console.error('❌ Command Error:', error.message);
    }
})();

client.once('ready', (c) => {
    console.log(`🤖 Logged in as ${c.user.tag}`);
    console.log(`🚀 Sentinel Linked to: ${API_BASE}`);
});

client.on('interactionCreate', async interaction => {
    // Buttons
    if (interaction.isButton()) {
        if (interaction.customId === 'dashboard_gen') {
            const modal = new ModalBuilder().setCustomId('gen_modal').setTitle('Forge New Signature');
            const memoInput = new TextInputBuilder().setCustomId('memo_input').setLabel("Who is this signature for?").setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(memoInput));
            await interaction.showModal(modal);
        }
    }

    // Modal Submit
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'gen_modal') {
            await interaction.deferReply({ ephemeral: true });
            const memo = interaction.fields.getTextInputValue('memo_input');
            const keyVal = `J2ST-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            try {
                const res = await fetch(`${API_BASE}/api/admin/add-key`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: keyVal, memo, secret: ADMIN_SECRET })
                });
                const data = await res.json();

                if (data.success) {
                    const embed = new EmbedBuilder().setTitle('🗝 SIGNATURE FORGED').addFields({ name: 'SIGNATURE:', value: `\`${keyVal}\`` }, { name: 'TARGET:', value: `\`${memo}\`` }).setColor(0xFFFFFF);
                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.editReply({ content: `❌ API Error: ${data.error}` });
                }
            } catch (e) {
                await interaction.editReply({ content: `❌ Failed to connect to Backend: ${API_BASE}` });
            }
        }
    }

    if (!interaction.isChatInputCommand()) return;

    // Command: /setup
    if (interaction.commandName === 'setup') {
        const embed = new EmbedBuilder()
            .setTitle('🗝 VOID CONTROL CENTER')
            .setDescription('Manage j2st.lol access signatures.\n\nGateway status: 🟢 VERIFIED')
            .setColor(0x000000);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('dashboard_gen').setLabel('Forge Signature').setStyle(ButtonStyle.Secondary).setEmoji('🗝'));
        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // Command: /genkey
    if (interaction.commandName === 'genkey') {
        await interaction.deferReply();
        const memo = interaction.options.getString('memo') || 'No memo';
        const keyVal = `J2ST-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        try {
            const res = await fetch(`${API_BASE}/api/admin/add-key`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: keyVal, memo, secret: ADMIN_SECRET })
            });
            const data = await res.json();

            if (data.success) {
                const embed = new EmbedBuilder().setTitle('🗝 SIGNATURE FORGED').addFields({ name: 'SIGNATURE:', value: `\`${keyVal}\`` }, { name: 'TARGET:', value: `\`${memo}\`` }).setColor(0xFFFFFF);
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply({ content: `❌ API Error: ${data.error}` });
            }
        } catch (e) {
            await interaction.editReply({ content: `❌ Failed to connect to Backend: ${API_BASE}` });
        }
    }

    // Command: /say
    if (interaction.commandName === 'say') {
        const msg = interaction.options.getString('message');
        await interaction.channel.send(msg);
        await interaction.reply({ content: '✅ Broadcast sent.', ephemeral: true });
    }

    // Command: /embed
    if (interaction.commandName === 'embed') {
        const title = interaction.options.getString('title');
        const desc  = interaction.options.getString('description').replace(/\\n/g, '\n');
        const color = (interaction.options.getString('color') || '#000000').replace('#', '');
        
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(parseInt(color, 16) || 0x000000);
            
        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: '✅ Embed forged.', ephemeral: true });
    }
});

client.login(TOKEN);
