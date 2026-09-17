const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const http = require("http");

const config = require("./config");

const {
    criarTicket,
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

// ==========================
// SERVIDOR PARA O RENDER
// ==========================

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    res.end("UTL Ticket Bot está online.");
}).listen(PORT, () => {
    console.log(`🌐 Servidor HTTP iniciado na porta ${PORT}`);
});

// ==========================
// BOT DISCORD
// ==========================

client.once("ready", () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// ==========================
// INTERAÇÕES
// ==========================

client.on("interactionCreate", async (interaction) => {

    try {

        // ==========================
        // SELECT MENU
        // ==========================

        if (interaction.isStringSelectMenu()) {

            if (interaction.customId !== "ticket_menu") return;

            const escolha = interaction.values[0];

            if (escolha === OWNAR) {
                return interaction.showModal(modalOwnar());
            }

            if (escolha === PARCERIA) {
                return interaction.showModal(modalParceria());
            }

            if (escolha === DENUNCIA) {
                return interaction.showModal(modalDenuncia());
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

        // ==========================
        // MODAL — OWNAR
        // ==========================

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

        // ==========================
        // MODAL — PARCERIA
        // ==========================

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

        // ==========================
        // MODAL — DENÚNCIA
        // ==========================

        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_denuncia"
        ) {

            await interaction.deferReply({
                ephemeral: true
            });

            const idPessoa =
                interaction.fields.getTextInputValue("id_pessoa");

            const prova =
                interaction.fields.getTextInputValue("prova");

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

        // ==========================
        // FECHAR TICKET
        // ==========================

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
                        "Erro ao fechar ticket:",
                        error
                    );
                }

            }, 2000);
        }

    } catch (error) {

        console.error("❌ Erro na interação:", error);

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

// ==========================
// LOGIN
// ==========================

client.login(config.TOKEN);