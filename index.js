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

// =====================================================
// CLIENT
// =====================================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

// =====================================================
// SERVIDOR HTTP - RENDER
// =====================================================

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

// =====================================================
// BOT ONLINE
// =====================================================

client.once("ready", async () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);

    const rest = new REST({
        version: "10"
    }).setToken(config.TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            {
                body: [
                    {
                        name: "ticket",
                        description: "Envia o painel de Tickets da UTL.",
                        default_member_permissions:
                            PermissionFlagsBits.Administrator.toString()
                    },

                    ...contractCommands.map(command =>
                        command.toJSON()
                    )
                ]
            }
        );

        console.log("✅ Comandos Slash registrados.");
    } catch (error) {
        console.error("❌ Erro ao registrar comandos:", error);
    }
});

// =====================================================
// INTERAÇÕES
// =====================================================

client.on("interactionCreate", async interaction => {

    try {

        // =============================================
        // BOTÕES DE CONTRACT
        // =============================================

        if (interaction.isButton()) {
            const processed = await processarBotaoContrato(
                interaction
            );

            if (processed) return;
        }

        // =============================================
        // COMANDOS SLASH
        // =============================================

        if (interaction.isChatInputCommand()) {

            // -------------------------
            // TICKET
            // -------------------------

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
                    components: [criarPainelTickets()],
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

            // -------------------------
            // PERM
            // -------------------------

            if (interaction.commandName === "perm") {
                return executarPerm(interaction);
            }

            // -------------------------
            // UNPERM
            // -------------------------

            if (interaction.commandName === "unperm") {
                return executarUnperm(interaction);
            }

            // -------------------------
            // CONTRACT
            // -------------------------

            if (interaction.commandName === "contract") {
                return executarContract(interaction);
            }

            // -------------------------
            // RELEASE
            // -------------------------

            if (interaction.commandName === "release") {
                return executarRelease(interaction);
            }
        }

        // =============================================
        // SELECT MENU DOS TICKETS
        // =============================================

        if (interaction.isStringSelectMenu()) {

            if (
                interaction.customId ===
                "f82c784a00f548f1ee6b66c4d7383ae1"
            ) {

                const value = interaction.values[0];

                if (value === OWNAR) {
                    return interaction.showModal(
                        modalOwnar()
                    );
                }

                if (value === PARCERIA) {
                    return interaction.showModal(
                        modalParceria()
                    );
                }

                if (value === DENUNCIA) {
                    return criarTicket(
                        interaction,
                        "denuncia"
                    );
                }

                if (value === OUTROS) {
                    return interaction.showModal(
                        modalOutros()
                    );
                }
            }
        }

        // =============================================
        // MODAIS DOS TICKETS
        // =============================================

        if (interaction.isModalSubmit()) {

            if (interaction.customId === "modal_ownar") {

                const time =
                    interaction.fields.getTextInputValue("time");

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

            if (interaction.customId === "modal_parceria") {

                const texto =
                    interaction.fields.getTextInputValue(
                        "texto"
                    );

                return criarTicket(
                    interaction,
                    "parceria",
                    texto
                );
            }

            if (interaction.customId === "modal_outros") {

                const texto =
                    interaction.fields.getTextInputValue(
                        "texto"
                    );

                return criarTicket(
                    interaction,
                    "outros",
                    texto
                );
            }
        }

        // =============================================
        // BOTÃO FECHAR TICKET
        // =============================================

        if (
            interaction.isButton() &&
            interaction.customId === "fechar_ticket"
        ) {

            await interaction.reply({
                content:
                    "🔒 Este ticket será fechado...",
                ephemeral: true
            });

            setTimeout(async () => {
                await interaction.channel.delete().catch(() => {});
            }, 2000);

            return;
        }

    } catch (error) {

        console.error(
            "❌ Erro na interação:",
            error
        );

        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content:
                    "❌ Ocorreu um erro ao processar esta interação.",
                ephemeral: true
            }).catch(() => {});
        }
    }
});

// =====================================================
// LOGIN
// =====================================================

client.login(config.TOKEN);