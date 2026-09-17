const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const http = require("http");

const config = require("./config");

const {
    criarTicket,
    criarPainelTickets,
    modalOwnar,
    modalParceria,
    modalDenuncia,
    OWNAR,
    PARCERIA,
    DENUNCIA,
    OUTROS
} = require("./ticket");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ==========================================
// SERVIDOR HTTP PARA O RENDER
// ==========================================

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {

    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end("UTL Ticket Bot está online.");

}).listen(PORT, () => {

    console.log(`🌐 Servidor HTTP iniciado na porta ${PORT}`);

});

// ==========================================
// COMANDO /TICKET
// ==========================================

const comandoTicket = new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Envia o painel de tickets da UTL")
    .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator.toString()
    );

const rest = new REST({
    version: "10"
}).setToken(config.TOKEN);

// ==========================================
// BOT ONLINE
// ==========================================

client.once("ready", async () => {

    console.log(`✅ Bot conectado como ${client.user.tag}`);

    try {

        await rest.put(
            Routes.applicationCommands(client.user.id),
            {
                body: [
                    comandoTicket.toJSON()
                ]
            }
        );

        console.log("✅ Comando /ticket registrado.");

    } catch (error) {

        console.error(
            "❌ Erro ao registrar /ticket:",
            error
        );

    }

});

// ==========================================
// INTERAÇÕES
// ==========================================

client.on("interactionCreate", async (interaction) => {

    try {

        // ==========================================
        // /TICKET
        // ==========================================

        if (interaction.isChatInputCommand()) {

            if (interaction.commandName !== "ticket") return;

            const canal =
                await client.channels.fetch(
                    config.TICKET_PANEL_CHANNEL_ID
                );

            if (!canal) {

                return interaction.reply({
                    content: "❌ O canal do painel não foi encontrado.",
                    ephemeral: true
                });

            }

            await canal.send({
                components: [
                    criarPainelTickets()
                ],
                flags: 32768
            });

            return interaction.reply({
                content: `✅ Painel de tickets enviado em ${canal}.`,
                ephemeral: true
            });
        }

        // ==========================================
        // SELECT MENU
        // ==========================================

        if (interaction.isStringSelectMenu()) {

            if (interaction.customId !== "ticket_menu") return;

            const escolha = interaction.values[0];

            if (escolha === OWNAR) {
                return interaction.showModal(
                    modalOwnar()
                );
            }

            if (escolha === PARCERIA) {
                return interaction.showModal(
                    modalParceria()
                );
            }

            if (escolha === DENUNCIA) {
                return interaction.showModal(
                    modalDenuncia()
                );
            }

            if (escolha === OUTROS) {

                await interaction.deferReply({
                    ephemeral: true
                });

                const canal = await criarTicket(
                    interaction,
                    "outros"
                );

                return interaction.editReply({
                    content: `✅ Seu ticket foi criado: ${canal}`
                });
            }
        }

        // ==========================================
        // MODAL — OWNAR
        // ==========================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_ownar"
        ) {

            await interaction.deferReply({
                ephemeral: true
            });

            const time =
                interaction.fields.getTextInputValue("time");

            const squadsheet =
                interaction.fields.getTextInputValue("squadsheet");

            const canal = await criarTicket(
                interaction,
                "ownar",
                [
                    `### 👑 Qual time ou seleção deseja ownar?\n${time}`,
                    `### 📋 Squadsheet\n${squadsheet}`
                ]
            );

            return interaction.editReply({
                content: `✅ Seu ticket foi criado: ${canal}`
            });
        }

        // ==========================================
        // MODAL — PARCERIA
        // ==========================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_parceria"
        ) {

            await interaction.deferReply({
                ephemeral: true
            });

            const parceria =
                interaction.fields.getTextInputValue("parceria");

            const canal = await criarTicket(
                interaction,
                "parceria",
                [
                    `### 🤝 Proposta de Parceria\n${parceria}`
                ]
            );

            return interaction.editReply({
                content: `✅ Seu ticket foi criado: ${canal}`
            });
        }

        // ==========================================
        // MODAL — DENÚNCIA
        // ==========================================

        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_denuncia"
        ) {

            await interaction.deferReply({
                ephemeral: true
            });

            const idPessoa =
                interaction.fields.getTextInputValue(
                    "id_pessoa"
                );

            const prova =
                interaction.fields.getTextInputValue(
                    "prova"
                );

            const canal = await criarTicket(
                interaction,
                "denuncia",
                [
                    `### 🚨 ID da pessoa denunciada\n${idPessoa}`,
                    `### 📎 Prova\n${prova}`
                ]
            );

            return interaction.editReply({
                content: `✅ Seu ticket foi criado: ${canal}`
            });
        }

        // ==========================================
        // FECHAR TICKET
        // ==========================================

        if (
            interaction.isButton() &&
            interaction.customId === "fechar_ticket"
        ) {

            await interaction.reply({
                content: "🔒 Este ticket será encerrado.",
                ephemeral: true
            });

            setTimeout(async () => {

                try {

                    await interaction.channel.delete();

                } catch (error) {

                    console.error(
                        "❌ Erro ao fechar ticket:",
                        error
                    );

                }

            }, 2000);
        }

    } catch (error) {

        console.error(
            "❌ Erro na interação:",
            error
        );

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            await interaction.reply({
                content: "❌ Ocorreu um erro ao processar esta ação.",
                ephemeral: true
            });

        }
    }
});

// ==========================================
// LOGIN
// ==========================================

client.login(config.TOKEN);