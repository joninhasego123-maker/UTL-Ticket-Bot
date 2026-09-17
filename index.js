const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    PermissionFlagsBits
} = require("discord.js");

const http = require("http");
const path = require("path");

const config = require("./config");

const {
    criarPainelTickets,
    criarTicket,
    modalOwnar,
    modalParceria,
    modalOutros,
    OWNAR,
    PARCERIA,
    DENUNCIA,
    OUTROS
} = require("./ticket");

const {
    contractCommands,
    executarPerm,
    executarUnperm,
    executarContract,
    executarRelease,
    processarBotaoContrato
} = require("./contract");

// =============================================
// CLIENT
// =============================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// =============================================
// RENDER
// =============================================

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Bot online!");
});

server.listen(PORT, () => {
    console.log(`🌐 Servidor HTTP iniciado na porta ${PORT}`);
});

// =============================================
// READY
// =============================================

client.once("ready", async () => {

    console.log(`✅ Bot conectado como ${client.user.tag}`);

    const rest = new REST({
        version: "10"
    }).setToken(config.TOKEN);

    try {

        const commands = [
            {
                name: "ticket",
                description: "Envia o painel de Tickets da UTL.",
                default_member_permissions:
                    PermissionFlagsBits.Administrator.toString()
            },

            ...contractCommands.map(command =>
                command.toJSON()
            )
        ];

        await rest.put(
            Routes.applicationCommands(client.user.id),
            {
                body: commands
            }
        );

        console.log("✅ Comandos Slash registrados com sucesso.");

    } catch (error) {

        console.error(
            "❌ Erro ao registrar comandos Slash:",
            error
        );
    }
});

// =============================================
// INTERAÇÕES
// =============================================

client.on("interactionCreate", async interaction => {

    try {

        // =========================================
        // BOTÕES
        // =========================================

        if (interaction.isButton()) {

            // Contract
            if (
                interaction.customId.startsWith("contract_accept_") ||
                interaction.customId.startsWith("contract_decline_")
            ) {

                await processarBotaoContrato(interaction);
                return;
            }

            // Fechar ticket
            if (
                interaction.customId === "fechar_ticket"
            ) {

                await interaction.reply({
                    content: "🔒 Este ticket será fechado...",
                    ephemeral: true
                });

                setTimeout(async () => {

                    await interaction.channel
                        .delete()
                        .catch(() => {});

                }, 2000);

                return;
            }
        }

        // =========================================
        // SLASH COMMANDS
        // =========================================

        if (interaction.isChatInputCommand()) {

            // =====================================
            // TICKET
            // =====================================

            if (interaction.commandName === "ticket") {

                if (
                    !interaction.memberPermissions.has(
                        PermissionFlagsBits.Administrator
                    )
                ) {

                    return interaction.reply({
                        content:
                            "❌ Você não possui permissão para usar este comando.",
                        ephemeral: true
                    });
                }

                const channel = await client.channels.fetch(
                    config.TICKET_PANEL_CHANNEL_ID
                );

                if (!channel) {

                    return interaction.reply({
                        content:
                            "❌ Não encontrei o canal do painel de Tickets.",
                        ephemeral: true
                    });
                }

                await channel.send({

                    components: [
                        criarPainelTickets()
                    ],

                    files: [
                        {
                            attachment: path.join(
                                __dirname,
                                "imagens",
                                "ticket_topo.png"
                            ),
                            name: "ticket_topo.png"
                        },

                        {
                            attachment: path.join(
                                __dirname,
                                "imagens",
                                "utl_logo.png"
                            ),
                            name: "utl_logo.png"
                        }
                    ],

                    flags: 32768
                });

                return interaction.reply({
                    content:
                        "✅ Painel de Tickets enviado!",
                    ephemeral: true
                });
            }

            // =====================================
            // PERM
            // =====================================

            if (interaction.commandName === "perm") {

                return executarPerm(
                    interaction
                );
            }

            // =====================================
            // UNPERM
            // =====================================

            if (interaction.commandName === "unperm") {

                return executarUnperm(
                    interaction
                );
            }

            // =====================================
            // CONTRACT
            // =====================================

            if (interaction.commandName === "contract") {

                return executarContract(
                    interaction
                );
            }

            // =====================================
            // RELEASE
            // =====================================

            if (interaction.commandName === "release") {

                return executarRelease(
                    interaction
                );
            }
        }

        // =========================================
        // MENU DE TICKETS
        // =========================================

        if (interaction.isStringSelectMenu()) {

            if (
                interaction.customId === "ticket_menu"
            ) {

                const value =
                    interaction.values[0];

                // OWNAR
                if (value === OWNAR) {

                    return interaction.showModal(
                        modalOwnar()
                    );
                }

                // PARCERIA
                if (value === PARCERIA) {

                    return interaction.showModal(
                        modalParceria()
                    );
                }

                // DENÚNCIA
                if (value === DENUNCIA) {

                    return criarTicket(
                        interaction,
                        "denuncia"
                    );
                }

                // OUTROS
                if (value === OUTROS) {

                    return interaction.showModal(
                        modalOutros()
                    );
                }
            }
        }

        // =========================================
        // MODAIS
        // =========================================

        if (interaction.isModalSubmit()) {

            // OWNAR
            if (
                interaction.customId === "modal_ownar"
            ) {

                const time =
                    interaction.fields.getTextInputValue(
                        "time"
                    );

                const squadsheet =
                    interaction.fields.getTextInputValue(
                        "squadsheet"
                    );

                return criarTicket(
                    interaction,
                    "ownar",
                    `**Time/Seleção:** ${time}\n**Squadsheet:** ${squadsheet}`
                );
            }

            // PARCERIA
            if (
                interaction.customId === "modal_parceria"
            ) {

                const parceria =
                    interaction.fields.getTextInputValue(
                        "parceria"
                    );

                return criarTicket(
                    interaction,
                    "parceria",
                    parceria
                );
            }

            // OUTROS
            if (
                interaction.customId === "modal_outros"
            ) {

                const assunto =
                    interaction.fields.getTextInputValue(
                        "assunto"
                    );

                return criarTicket(
                    interaction,
                    "outros",
                    assunto
                );
            }
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
                content:
                    "❌ Ocorreu um erro ao processar esta interação.",
                ephemeral: true
            }).catch(() => {});
        }
    }
});

// =============================================
// LOGIN
// =============================================

client.login(config.TOKEN);