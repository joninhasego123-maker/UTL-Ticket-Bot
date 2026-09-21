const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    PermissionFlagsBits
} = require("discord.js");

const http = require("http");
const https = require("https");
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
    executarPermlist,
    executarContract,
    executarRelease,
    processarBotaoContrato
} = require("./contract");

// =============================================
// FREE AGENCY
// =============================================

const {
    freeagencyCommand,
    executarFreeagency,
    processarFreeagency
} = require("./freeagency");

// =============================================
// CLIENT
// =============================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
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

    console.log(
        `🌐 Servidor HTTP iniciado na porta ${PORT}`
    );

});

// =============================================
// READY
// =============================================

client.once("ready", async () => {

    console.log(
        `✅ Bot conectado como ${client.user.tag}`
    );

    const rest = new REST({
        version: "10"
    }).setToken(config.TOKEN);

    try {

        const commands = [

            // =====================================
            // TICKET
            // =====================================

            {
                name: "ticket",

                description:
                    "Envia o painel de Tickets da UTL.",

                default_member_permissions:
                    PermissionFlagsBits.Administrator.toString()

            },

            // =====================================
            // FREE AGENCY
            // =====================================

            freeagencyCommand.toJSON(),

            // =====================================
            // CONTRACTS
            // =====================================

            ...contractCommands.map(
                command => command.toJSON()
            )

        ];

        console.log(
            `📦 Registrando ${commands.length} comandos Slash...`
        );

        await rest.put(

            Routes.applicationCommands(
                client.user.id
            ),

            {
                body: commands
            }

        );

        console.log(
            "✅ Comandos Slash registrados com sucesso."
        );

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

client.on(
    "interactionCreate",
    async interaction => {

        // =========================================
        // LOG DE INTERAÇÃO RECEBIDA
        // =========================================

        let nomeInteracao = "sem nome";

        if (interaction.isChatInputCommand()) {

            nomeInteracao =
                `/${interaction.commandName}`;

        } else if (
            interaction.isButton()
        ) {

            nomeInteracao =
                `botão: ${interaction.customId}`;

        } else if (
            interaction.isStringSelectMenu()
        ) {

            nomeInteracao =
                `menu: ${interaction.customId}`;

        } else if (
            interaction.isModalSubmit()
        ) {

            nomeInteracao =
                `modal: ${interaction.customId}`;

        }

        console.log(
            `📩 INTERAÇÃO RECEBIDA: ${nomeInteracao}`
        );

        try {

            // =========================================
            // BOTÕES
            // =========================================

            if (interaction.isButton()) {

                // =====================================
                // CONTRACT
                // =====================================

                if (

                    interaction.customId.startsWith(
                        "contract_accept_"
                    )

                    ||

                    interaction.customId.startsWith(
                        "contract_decline_"
                    )

                ) {

                    console.log(
                        `⚙️ Processando botão de contrato: ${interaction.customId}`
                    );

                    await processarBotaoContrato(
                        interaction
                    );

                    console.log(
                        `✅ Botão de contrato processado: ${interaction.customId}`
                    );

                    return;

                }

                // =====================================
                // FECHAR TICKET
                // =====================================

                if (
                    interaction.customId ===
                    "fechar_ticket"
                ) {

                    console.log(
                        "🔒 Fechando ticket..."
                    );

                    await interaction.reply({

                        content:
                            "🔒 Este ticket será fechado...",

                        ephemeral: true

                    });

                    setTimeout(
                        async () => {

                            await interaction.channel
                                .delete()
                                .catch(error => {

                                    console.error(
                                        "❌ Erro ao excluir ticket:",
                                        error
                                    );

                                });

                        },
                        2000
                    );

                    return;

                }

            }

            // =========================================
            // SLASH COMMANDS
            // =========================================

            if (interaction.isChatInputCommand()) {

                console.log(
                    `⚙️ Processando comando ${interaction.commandName}...`
                );

                // =====================================
                // TICKET
                // =====================================

                if (
                    interaction.commandName ===
                    "ticket"
                ) {

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

                    const channel =
                        await client.channels.fetch(
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
                                attachment:
                                    path.join(
                                        __dirname,
                                        "imagens",
                                        "ticket_topo.png"
                                    ),

                                name:
                                    "ticket_topo.png"
                            },

                            {
                                attachment:
                                    path.join(
                                        __dirname,
                                        "imagens",
                                        "utl_logo.png"
                                    ),

                                name:
                                    "utl_logo.png"
                            }

                        ],

                        flags: 32768

                    });

                    console.log(
                        "✅ Painel de Tickets enviado."
                    );

                    return interaction.reply({

                        content:
                            "✅ Painel de Tickets enviado!",

                        ephemeral: true

                    });

                }

                // =====================================
                // FREE AGENCY
                // =====================================

                if (
                    interaction.commandName ===
                    "freeagency"
                ) {

                    console.log(
                        "⚙️ Abrindo Free Agency..."
                    );

                    return executarFreeagency(
                        interaction
                    );

                }

                // =====================================
                // PERM
                // =====================================

                if (
                    interaction.commandName ===
                    "perm"
                ) {

                    console.log(
                        "⚙️ Executando /perm..."
                    );

                    return executarPerm(
                        interaction
                    );

                }

                // =====================================
                // UNPERM
                // =====================================

                if (
                    interaction.commandName ===
                    "unperm"
                ) {

                    console.log(
                        "⚙️ Executando /unperm..."
                    );

                    return executarUnperm(
                        interaction
                    );

                }

                // =====================================
                // PERMLIST
                // =====================================

                if (
                    interaction.commandName ===
                    "permlist"
                ) {

                    console.log(
                        "⚙️ Executando /permlist..."
                    );

                    return executarPermlist(
                        interaction
                    );

                }

                // =====================================
                // CONTRACT
                // =====================================

                if (
                    interaction.commandName ===
                    "contract"
                ) {

                    console.log(
                        "⚙️ Executando /contract..."
                    );

                    return executarContract(
                        interaction
                    );

                }

                // =====================================
                // RELEASE
                // =====================================

                if (
                    interaction.commandName ===
                    "release"
                ) {

                    console.log(
                        "⚙️ Executando /release..."
                    );

                    return executarRelease(
                        interaction
                    );

                }

            }

            // =========================================
            // MENU DE TICKETS
            // =========================================

            if (
                interaction.isStringSelectMenu()
            ) {

                if (
                    interaction.customId ===
                    "ticket_menu"
                ) {

                    const value =
                        interaction.values[0];

                    console.log(
                        `🎫 Opção de ticket selecionada: ${value}`
                    );

                    // =================================
                    // OWNAR
                    // =================================

                    if (
                        value === OWNAR
                    ) {

                        console.log(
                            "👑 Abrindo modal Ownar..."
                        );

                        return interaction.showModal(
                            modalOwnar()
                        );

                    }

                    // =================================
                    // PARCERIA
                    // =================================

                    if (
                        value === PARCERIA
                    ) {

                        console.log(
                            "🤝 Abrindo modal Parceria..."
                        );

                        return interaction.showModal(
                            modalParceria()
                        );

                    }

                    // =================================
                    // DENÚNCIA
                    // =================================

                    if (
                        value === DENUNCIA
                    ) {

                        console.log(
                            "🚨 Criando ticket de denúncia..."
                        );

                        return criarTicket(
                            interaction,
                            "denuncia"
                        );

                    }

                    // =================================
                    // OUTROS
                    // =================================

                    if (
                        value === OUTROS
                    ) {

                        console.log(
                            "📩 Abrindo modal Outros..."
                        );

                        return interaction.showModal(
                            modalOutros()
                        );

                    }

                }

            }

            // =========================================
            // MODAIS
            // =========================================

            if (
                interaction.isModalSubmit()
            ) {

                console.log(
                    `📝 Modal recebido: ${interaction.customId}`
                );

                // =====================================
                // FREE AGENCY
                // =====================================

                if (
                    interaction.customId ===
                    "modal_freeagency"
                ) {

                    console.log(
                        "⚽ Processando formulário Free Agency..."
                    );

                    return processarFreeagency(
                        interaction
                    );

                }

                // =====================================
                // OWNAR
                // =====================================

                if (
                    interaction.customId ===
                    "modal_ownar"
                ) {

                    const time =
                        interaction.fields.getTextInputValue(
                            "time"
                        );

                    const squadsheet =
                        interaction.fields.getTextInputValue(
                            "squadsheet"
                        );

                    console.log(
                        "👑 Criando ticket de Ownar..."
                    );

                    return criarTicket(
                        interaction,
                        "ownar",
                        JSON.stringify({
                            time: time,
                            squadsheet: squadsheet
                        })
                    );

                }

                // =====================================
                // PARCERIA
                // =====================================

                if (
                    interaction.customId ===
                    "modal_parceria"
                ) {

                    const parceria =
                        interaction.fields.getTextInputValue(
                            "parceria"
                        );

                    console.log(
                        "🤝 Criando ticket de Parceria..."
                    );

                    return criarTicket(
                        interaction,
                        "parceria",
                        parceria
                    );

                }

                // =====================================
                // OUTROS
                // =====================================

                if (
                    interaction.customId ===
                    "modal_outros"
                ) {

                    const assunto =
                        interaction.fields.getTextInputValue(
                            "assunto"
                        );

                    console.log(
                        "📩 Criando ticket de Outros..."
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
                "❌ ERRO NA INTERAÇÃO:",
                error
            );

            console.error(
                "📌 Tipo:",
                interaction.type
            );

            console.error(
                "📌 ID:",
                interaction.id
            );

            console.error(
                "📌 Custom ID:",
                interaction.customId || "nenhum"
            );

            console.error(
                "📌 Comando:",
                interaction.commandName || "nenhum"
            );

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                await interaction.reply({

                    content:
                        "❌ Ocorreu um erro ao processar esta interação.",

                    ephemeral: true

                }).catch(
                    replyError => {

                        console.error(
                            "❌ Não foi possível responder à interação:",
                            replyError
                        );

                    }
                );

            }

        }

    }
);

// =============================================
// ERROS / DIAGNÓSTICO
// =============================================

client.on(
    "error",
    error => {

        console.error(
            "❌ CLIENT ERROR:",
            error
        );

    }
);

client.on(
    "shardError",
    error => {

        console.error(
            "❌ SHARD ERROR:",
            error
        );

    }
);

client.on(
    "warn",
    warning => {

        console.warn(
            "⚠️ DISCORD WARNING:",
            warning
        );

    }
);

client.on(
    "debug",
    info => {

        console.log(
            "🔎 DISCORD DEBUG:",
            info
        );

    }
);

// =============================================
// TESTE DE CONEXÃO HTTP COM DISCORD
// =============================================

console.log(
    "🌐 Testando conexão HTTP com o Discord..."
);

https.get(
    "https://discord.com/api/v10/gateway",
    response => {

        console.log(
            `🌐 Discord API respondeu: HTTP ${response.statusCode}`
        );

        response.resume();

    }
).on(
    "error",
    error => {

        console.error(
            "❌ ERRO NA CONEXÃO HTTP COM DISCORD:",
            error
        );

    }
);

// =============================================
// TESTE AUTENTICADO DO TOKEN
// =============================================

console.log(
    "🔐 Testando TOKEN na Discord API..."
);

const tokenRequest = https.request(

    {
        hostname: "discord.com",

        path: "/api/v10/gateway/bot",

        method: "GET",

        headers: {
            Authorization:
                `Bot ${config.TOKEN}`
        }

    },

    response => {

        console.log(
            `🔐 Gateway Bot respondeu: HTTP ${response.statusCode}`
        );

        let data = "";

        response.on(
            "data",
            chunk => {

                data += chunk;

            }
        );

        response.on(
            "end",
            () => {

                try {

                    const result =
                        JSON.parse(data);

                    // =================================
                    // TOKEN OK
                    // =================================

                    if (
                        response.statusCode ===
                        200
                    ) {

                        console.log(
                            "✅ TOKEN ACEITO PELA DISCORD API."
                        );

                        console.log(
                            `🌐 Gateway: ${result.url}`
                        );

                        console.log(
                            `🤖 Shards recomendados: ${result.shards}`
                        );

                        if (
                            result.session_start_limit
                        ) {

                            console.log(
                                `📊 Sessões restantes: ${result.session_start_limit.remaining}`
                            );

                            console.log(
                                `📊 Limite total: ${result.session_start_limit.total}`
                            );

                            console.log(
                                `📊 Reset em: ${result.session_start_limit.reset_after}ms`
                            );

                        }

                    }

                    // =================================
                    // TOKEN INVÁLIDO
                    // =================================

                    else {

                        console.error(
                            "❌ TOKEN REJEITADO PELA DISCORD API:"
                        );

                        console.error(
                            result
                        );

                    }

                } catch (error) {

                    console.error(
                        "❌ Resposta inesperada da Discord API:"
                    );

                    console.error(
                        data
                    );

                }

            }
        );

    }

);

tokenRequest.on(
    "error",
    error => {

        console.error(
            "❌ ERRO AO TESTAR TOKEN:",
            error
        );

    }
);

tokenRequest.end();

// =============================================
// LOGIN DO BOT
// =============================================

console.log(
    "🔑 Tentando conectar ao Discord..."
);

client.login(
    config.TOKEN
)

.then(
    () => {

        console.log(
            "🔑 Login enviado ao Discord."
        );

    }
)

.catch(
    error => {

        console.error(
            "❌ ERRO AO FAZER LOGIN:",
            error
        );

    }
);