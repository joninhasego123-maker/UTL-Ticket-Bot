const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const http = require("http");
const path = require("path");

const config = require("./config");

const {
    criarTicket,
    criarPainelTickets,
    modalOwnar,
    modalParceria,
    modalOutros,
    OWNAR,
    PARCERIA,
    DENUNCIA,
    OUTROS
} = require("./ticket");


// ===============================
// CLIENT
// ===============================

const client = new Client({

    intents: [
        GatewayIntentBits.Guilds
    ]

});


// ===============================
// SERVIDOR HTTP — RENDER
// ===============================

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {

    res.writeHead(200);

    res.end("Bot online!");

}).listen(PORT, () => {

    console.log(
        `🌐 Servidor HTTP iniciado na porta ${PORT}`
    );

});


// ===============================
// READY
// ===============================

client.once("ready", async () => {

    console.log(
        `✅ Bot conectado como ${client.user.tag}`
    );


    // ===============================
    // REGISTRAR /TICKET
    // ===============================

    const commands = [

        new SlashCommandBuilder()

            .setName("ticket")

            .setDescription(
                "Envia o painel de tickets da UTL"
            )

            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )

            .toJSON()

    ];


    const rest = new REST({
        version: "10"
    }).setToken(config.TOKEN);


    try {

        await rest.put(

            Routes.applicationCommands(
                client.user.id
            ),

            {
                body: commands
            }

        );

        console.log(
            "✅ Comando /ticket registrado"
        );

    } catch (error) {

        console.error(
            "❌ Erro ao registrar /ticket:",
            error
        );

    }

});


// ===============================
// INTERAÇÕES
// ===============================

client.on("interactionCreate", async (interaction) => {

    try {


        // ===============================
        // /TICKET
        // ===============================

        if (
            interaction.isChatInputCommand() &&
            interaction.commandName === "ticket"
        ) {

            const canal = await client.channels.fetch(
                config.TICKET_PANEL_CHANNEL_ID
            );


            if (!canal) {

                return interaction.reply({

                    content:
                        "❌ Não encontrei o canal do painel.",

                    ephemeral: true

                });

            }


            await canal.send({

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
                    "✅ Painel de tickets enviado!",

                ephemeral: true

            });

        }


        // ===============================
        // MENU DE TICKETS
        // ===============================

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId === "ticket_menu"
        ) {


            const escolha = interaction.values[0];


            // ===============================
            // OWNAR
            // ===============================

            if (escolha === OWNAR) {

                return interaction.showModal(
                    modalOwnar()
                );

            }


            // ===============================
            // PARCERIA
            // ===============================

            if (escolha === PARCERIA) {

                return interaction.showModal(
                    modalParceria()
                );

            }


            // ===============================
            // DENÚNCIA
            // ===============================

            if (escolha === DENUNCIA) {

                const canal = await criarTicket(
                    interaction,
                    "denuncia"
                );


                return interaction.reply({

                    content:
                        `🚨 Denúncia criada: ${canal}`,

                    ephemeral: true

                });

            }


            // ===============================
            // OUTROS
            // ===============================

            if (escolha === OUTROS) {

                return interaction.showModal(
                    modalOutros()
                );

            }

        }


        // ===============================
        // MODAL OWNAR
        // ===============================

        if (
            interaction.isModalSubmit() &&
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


            const informacoes =
                `**Qual time ou seleção deseja ownar:**\n${time}\n\n` +
                `**Squadsheet:**\n${squadsheet}`;


            const canal = await criarTicket(

                interaction,

                "ownar",

                informacoes

            );


            return interaction.reply({

                content:
                    `👑 Ticket de Ownar criado: ${canal}`,

                ephemeral: true

            });

        }


        // ===============================
        // MODAL PARCERIA
        // ===============================

        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_parceria"
        ) {

            const parceria =
                interaction.fields.getTextInputValue(
                    "parceria"
                );


            const canal = await criarTicket(

                interaction,

                "parceria",

                parceria

            );


            return interaction.reply({

                content:
                    `🤝 Ticket de parceria criado: ${canal}`,

                ephemeral: true

            });

        }


        // ===============================
        // MODAL OUTROS
        // ===============================

        if (
            interaction.isModalSubmit() &&
            interaction.customId === "modal_outros"
        ) {

            const assunto =
                interaction.fields.getTextInputValue(
                    "assunto"
                );


            const canal = await criarTicket(

                interaction,

                "outros",

                assunto

            );


            return interaction.reply({

                content:
                    `❔ Ticket criado: ${canal}`,

                ephemeral: true

            });

        }


        // ===============================
        // FECHAR TICKET
        // ===============================

        if (
            interaction.isButton() &&
            interaction.customId === "fechar_ticket"
        ) {

            await interaction.reply({

                content:
                    "🔒 Este ticket será fechado em 2 segundos.",

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


        if (!interaction.replied && !interaction.deferred) {

            await interaction.reply({

                content:
                    "❌ Ocorreu um erro ao processar essa ação.",

                ephemeral: true

            });

        }

    }

});


// ===============================
// LOGIN
// ===============================

client.login(config.TOKEN);