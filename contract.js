const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder
} = require("discord.js");

const supabase = require("./supabase");
const config = require("./config");

// =====================================================
// TIMES DA UTL
// =====================================================

const TEAM_ROLES = {
    "1550260388866691213": "Corinthians",
    "1550259753903718450": "Flamengo",
    "1550259441054654494": "Cruzeiro",
    "1550259517105766410": "Grêmio",
    "1550259846010380368": "Atlético",
    "1550260303474729061": "Vitória",
    "1550260226551185508": "Bahia",
    "1550260711979221062": "São Paulo",
    "1550260057021882508": "Palmeiras",
    "1550259618889072650": "Internacional"
};

// =====================================================
// POSIÇÕES
// =====================================================

const POSICOES = [
    {
        name: "Goleiro",
        value: "Goleiro"
    },
    {
        name: "Zagueiro",
        value: "Zagueiro"
    },
    {
        name: "Volante",
        value: "Volante"
    },
    {
        name: "Meia",
        value: "Meia"
    },
    {
        name: "Atacante",
        value: "Atacante"
    }
];

// =====================================================
// COMANDOS
// =====================================================

const contractCommands = [

    // =================================================
    // /perm
    // =================================================

    new SlashCommandBuilder()
        .setName("perm")
        .setDescription("Dá permissão para um Manager usar um time no /contract.")
        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription("Manager que receberá a permissão.")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("team")
                .setDescription("Time que o Manager poderá usar.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        ),

    // =================================================
    // /unperm
    // =================================================

    new SlashCommandBuilder()
        .setName("unperm")
        .setDescription("Remove a permissão de um Manager.")
        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription("Manager que perderá a permissão.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        ),

    // =================================================
    // /contract
    // =================================================

    new SlashCommandBuilder()
        .setName("contract")
        .setDescription("Envia um contrato para um jogador.")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Jogador que receberá o contrato.")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("position")
                .setDescription("Posição do jogador.")
                .setRequired(true)
                .addChoices(...POSICOES)
        )
        .addStringOption(option =>
            option
                .setName("function")
                .setDescription("Função do jogador.")
                .setRequired(true)
                .addChoices(
                    {
                        name: "Titular",
                        value: "Titular"
                    },
                    {
                        name: "Reserva",
                        value: "Reserva"
                    }
                )
        ),

    // =================================================
    // /release
    // =================================================

    new SlashCommandBuilder()
        .setName("release")
        .setDescription("Libera um jogador do seu time.")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Jogador que será liberado.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
].map(command => command.toJSON());

// =====================================================
// VERIFICAR CANAL
// =====================================================

function verificarCanal(interaction) {
    return interaction.channelId === config.CONTRACT_CHANNEL_ID;
}

// =====================================================
// /PERM
// =====================================================

async function executarPerm(interaction) {

    if (!verificarCanal(interaction)) {
        return interaction.reply({
            content:
                `❌ Este comando só pode ser usado em <#${config.CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const manager = interaction.options.getUser("manager");
    const teamRole = interaction.options.getRole("team");

    // Verificar se o cargo é um dos 10 times
    if (!TEAM_ROLES[teamRole.id]) {
        return interaction.reply({
            content:
                "❌ Esse cargo não é um dos times da UTL.",
            ephemeral: true
        });
    }

    try {

        const { error } = await supabase
            .from("manager_permissions")
            .upsert(
                {
                    manager_id: manager.id,
                    team_role_id: teamRole.id
                },
                {
                    onConflict: "manager_id"
                }
            );

        if (error) {
            console.error(
                "❌ ERRO SUPABASE /perm:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Não foi possível salvar a permissão.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                `✅ <@${manager.id}> agora possui permissão para usar o **${TEAM_ROLES[teamRole.id]}** no \`/contract\`.`,
            ephemeral: true
        });

    } catch (error) {

        console.error(
            "❌ ERRO GERAL /perm:",
            error
        );

        return interaction.reply({
            content:
                "❌ Ocorreu um erro ao salvar a permissão.",
            ephemeral: true
        });
    }
}

// =====================================================
// /UNPERM
// =====================================================

async function executarUnperm(interaction) {

    if (!verificarCanal(interaction)) {
        return interaction.reply({
            content:
                `❌ Este comando só pode ser usado em <#${config.CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const manager = interaction.options.getUser("manager");

    try {

        const { error } = await supabase
            .from("manager_permissions")
            .delete()
            .eq("manager_id", manager.id);

        if (error) {
            console.error(
                "❌ ERRO SUPABASE /unperm:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Não foi possível remover a permissão.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                `✅ A permissão de <@${manager.id}> foi removida.`,
            ephemeral: true
        });

    } catch (error) {

        console.error(
            "❌ ERRO GERAL /unperm:",
            error
        );

        return interaction.reply({
            content:
                "❌ Ocorreu um erro ao remover a permissão.",
            ephemeral: true
        });
    }
}

// =====================================================
// /CONTRACT
// =====================================================

async function executarContract(interaction) {

    if (!verificarCanal(interaction)) {
        return interaction.reply({
            content:
                `❌ Este comando só pode ser usado em <#${config.CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const managerId = interaction.user.id;
    const player = interaction.options.getUser("player");
    const position = interaction.options.getString("position");
    const functionName = interaction.options.getString("function");

    // Não permitir contrato para si mesmo
    if (player.id === managerId) {
        return interaction.reply({
            content:
                "❌ Você não pode enviar um contrato para si mesmo.",
            ephemeral: true
        });
    }

    try {

        // =============================================
        // BUSCAR PERMISSÃO DO MANAGER
        // =============================================

        const {
            data: permission,
            error: permissionError
        } = await supabase
            .from("manager_permissions")
            .select("manager_id, team_role_id")
            .eq("manager_id", managerId)
            .maybeSingle();

        if (permissionError) {

            console.error(
                "❌ ERRO SUPABASE AO BUSCAR PERMISSÃO:",
                permissionError
            );

            return interaction.reply({
                content:
                    "❌ Não foi possível verificar sua permissão.",
                ephemeral: true
            });
        }

        if (!permission) {
            return interaction.reply({
                content:
                    "❌ Você não possui permissão para usar o `/contract`.",
                ephemeral: true
            });
        }

        const teamRoleId = permission.team_role_id;
        const teamName = TEAM_ROLES[teamRoleId];

        if (!teamName) {
            return interaction.reply({
                content:
                    "❌ O time da sua permissão não é válido.",
                ephemeral: true
            });
        }

        // =============================================
        // VERIFICAR SE JOGADOR ESTÁ NO SERVIDOR
        // =============================================

        const playerMember =
            await interaction.guild.members
                .fetch(player.id)
                .catch(() => null);

        if (!playerMember) {
            return interaction.reply({
                content:
                    "❌ Esse jogador precisa estar dentro do servidor da UTL.",
                ephemeral: true
            });
        }

        // =============================================
        // SALVAR CONTRATO
        // =============================================

        const { data: contract, error: insertError } =
            await supabase
                .from("contracts")
                .insert({
                    guild_id: interaction.guildId,
                    manager_id: managerId,
                    manager_role_id: teamRoleId,
                    player_id: player.id,
                    team_role_id: teamRoleId,
                    position: position,
                    function: functionName,
                    status: "pending"
                })
                .select()
                .single();

        if (insertError) {

            console.error(
                "❌ ERRO SUPABASE AO CRIAR CONTRATO:",
                insertError
            );

            return interaction.reply({
                content:
                    "❌ Não foi possível criar o contrato.",
                ephemeral: true
            });
        }

        // =============================================
        // CONTAINER DO CONTRATO
        // =============================================

        const contractContainer = new ContainerBuilder()

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        "# 📄 CONTRATO"
                    )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `**Player:** ${player}\n` +
                        `**ID:** ${player.id}\n\n` +

                        `**Manager:** ${interaction.user}\n` +
                        `**ID:** ${managerId}\n\n` +

                        `**Posição:** ${position}\n` +
                        `**Função:** ${functionName}`
                    )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            .addActionRowComponents(
                new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `contract_accept_${contract.id}`
                        )
                        .setLabel("Aceitar")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Success),

                    new ButtonBuilder()
                        .setCustomId(
                            `contract_decline_${contract.id}`
                        )
                        .setLabel("Recusar")
                        .setEmoji("❌")
                        .setStyle(ButtonStyle.Danger)
                )
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        "-# UTL - CONTRACT SYSTEM"
                    )
            );

        // =============================================
        // ENVIAR DM
        // =============================================

        try {

            await player.send({
                components: [contractContainer],
                flags: 32768
            });

        } catch (dmError) {

            console.error(
                "❌ ERRO AO ENVIAR DM DO CONTRATO:",
                dmError
            );

            // Se não conseguiu mandar DM,
            // apagar o contrato criado
            await supabase
                .from("contracts")
                .delete()
                .eq("id", contract.id);

            return interaction.reply({
                content:
                    "❌ Não foi possível enviar o contrato na DM do jogador. Verifique se ele permite mensagens diretas.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                `✅ Contrato enviado para ${player} referente ao **${teamName}**.`,
            ephemeral: true
        });

    } catch (error) {

        console.error(
            "❌ ERRO GERAL AO CRIAR CONTRATO:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não foi possível criar o contrato.",
            ephemeral: true
        });
    }
}

// =====================================================
// PROCESSAR BOTÕES
// =====================================================

async function processarBotaoContrato(interaction) {

    const customId = interaction.customId;

    const isAccept =
        customId.startsWith("contract_accept_");

    const isDecline =
        customId.startsWith("contract_decline_");

    if (!isAccept && !isDecline) {
        return;
    }

    const contractId = customId
        .replace("contract_accept_", "")
        .replace("contract_decline_", "");

    try {

        // =============================================
        // BUSCAR CONTRATO
        // =============================================

        const {
            data: contract,
            error
        } = await supabase
            .from("contracts")
            .select("*")
            .eq("id", contractId)
            .maybeSingle();

        if (error) {

            console.error(
                "❌ ERRO AO BUSCAR CONTRATO:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Não foi possível encontrar o contrato.",
                ephemeral: true
            });
        }

        if (!contract) {
            return interaction.reply({
                content:
                    "❌ Este contrato não existe mais.",
                ephemeral: true
            });
        }

        // =============================================
        // SOMENTE O PLAYER PODE RESPONDER
        // =============================================

        if (interaction.user.id !== contract.player_id) {
            return interaction.reply({
                content:
                    "❌ Apenas o jogador que recebeu este contrato pode responder.",
                ephemeral: true
            });
        }

        // =============================================
        // CONTRATO JÁ PROCESSADO
        // =============================================

        if (contract.status !== "pending") {
            return interaction.reply({
                content:
                    "❌ Este contrato já foi respondido.",
                ephemeral: true
            });
        }

        // =============================================
        // RECUSAR
        // =============================================

        if (isDecline) {

            const {
                error: updateError
            } = await supabase
                .from("contracts")
                .update({
                    status: "declined",
                    updated_at: new Date().toISOString()
                })
                .eq("id", contract.id)
                .eq("status", "pending");

            if (updateError) {

                console.error(
                    "❌ ERRO AO RECUSAR CONTRATO:",
                    updateError
                );

                return interaction.reply({
                    content:
                        "❌ Não foi possível recusar o contrato.",
                    ephemeral: true
                });
            }

            await registrarContrato(
                interaction,
                contract,
                "❌ RECUSADO"
            );

            return interaction.update({
                components: [
                    new ContainerBuilder()
                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "# 📄 CONTRATO\n\n" +
                                    "❌ **Contrato recusado.**\n\n" +
                                    "-# UTL - CONTRACT SYSTEM"
                                )
                        )
                ],
                flags: 32768
            });
        }

        // =============================================
        // ACEITAR
        // =============================================

        if (isAccept) {

            const guildId = contract.guild_id;

            if (!guildId) {
                return interaction.reply({
                    content:
                        "❌ Este contrato não possui o servidor vinculado.",
                    ephemeral: true
                });
            }

            // Buscar servidor
            const guild =
                await interaction.client.guilds
                    .fetch(guildId)
                    .catch(() => null);

            if (!guild) {
                return interaction.reply({
                    content:
                        "❌ Não consegui encontrar o servidor da UTL.",
                    ephemeral: true
                });
            }

            // Buscar jogador
            const member =
                await guild.members
                    .fetch(contract.player_id)
                    .catch(() => null);

            if (!member) {
                return interaction.reply({
                    content:
                        "❌ Você precisa estar dentro do servidor da UTL para aceitar o contrato.",
                    ephemeral: true
                });
            }

            // =========================================
            // VERIFICAR CARGO
            // =========================================

            const role =
                await guild.roles
                    .fetch(contract.team_role_id)
                    .catch(() => null);

            if (!role) {
                return interaction.reply({
                    content:
                        "❌ O cargo deste time não existe mais no servidor.",
                    ephemeral: true
                });
            }

            // =========================================
            // ADICIONAR CARGO
            // =========================================

            try {

                await member.roles.add(
                    contract.team_role_id
                );

            } catch (roleError) {

                console.error(
                    "❌ ERRO AO DAR CARGO:",
                    roleError
                );

                return interaction.reply({
                    content:
                        "❌ Não consegui adicionar o cargo do time. Verifique se o cargo do bot está acima do cargo do time.",
                    ephemeral: true
                });
            }

            // =========================================
            // ATUALIZAR CONTRATO
            // =========================================

            const {
                error: updateError
            } = await supabase
                .from("contracts")
                .update({
                    status: "accepted",
                    updated_at: new Date().toISOString()
                })
                .eq("id", contract.id)
                .eq("status", "pending");

            if (updateError) {

                console.error(
                    "❌ ERRO AO ATUALIZAR CONTRATO:",
                    updateError
                );

                // Tentar remover o cargo caso não consiga salvar
                await member.roles
                    .remove(contract.team_role_id)
                    .catch(() => {});

                return interaction.reply({
                    content:
                        "❌ O contrato foi processado, mas ocorreu um erro ao salvar no banco.",
                    ephemeral: true
                });
            }

            // =========================================
            // LOG
            // =========================================

            await registrarContrato(
                interaction,
                contract,
                "✅ ACEITO"
            );

            // =========================================
            // ATUALIZAR DM
            // =========================================

            return interaction.update({
                components: [
                    new ContainerBuilder()

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "# 📄 CONTRATO"
                                )
                        )

                        .addSeparatorComponents(
                            new SeparatorBuilder()
                        )

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "## ✅ CONTRATO ACEITO\n\n" +
                                    `Você agora faz parte do **${TEAM_ROLES[contract.team_role_id] || "time"}**.\n\n` +
                                    "-# UTL - CONTRACT SYSTEM"
                                )
                        )
                ],
                flags: 32768
            });
        }

    } catch (error) {

        console.error(
            "❌ ERRO AO PROCESSAR CONTRATO:",
            error
        );

        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({
                content:
                    "❌ Ocorreu um erro ao processar o contrato.",
                ephemeral: true
            });
        }
    }
}

// =====================================================
// LOG DE CONTRATO
// =====================================================

async function registrarContrato(
    interaction,
    contract,
    resultado
) {

    try {

        const channel =
            await interaction.client.channels
                .fetch(config.CONTRACT_LOG_CHANNEL_ID)
                .catch(() => null);

        if (!channel) {
            console.error(
                "❌ Canal de log de contratos não encontrado."
            );
            return;
        }

        const teamName =
            TEAM_ROLES[contract.team_role_id] ||
            "Desconhecido";

        const manager =
            `<@${contract.manager_id}>`;

        const player =
            `<@${contract.player_id}>`;

        const container =
            new ContainerBuilder()

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `# 📄 CONTRATO ${resultado}`
                        )
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `**Player:** ${player}\n` +
                            `**ID:** ${contract.player_id}\n\n` +

                            `**Manager:** ${manager}\n` +
                            `**ID:** ${contract.manager_id}\n\n` +

                            `**Time:** ${teamName}\n` +
                            `**Posição:** ${contract.position}\n` +
                            `**Função:** ${contract.function}`
                        )
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            "-# UTL - CONTRACT SYSTEM"
                        )
                );

        await channel.send({
            components: [container],
            flags: 32768
        });

    } catch (error) {

        console.error(
            "❌ ERRO AO ENVIAR LOG DO CONTRATO:",
            error
        );
    }
}

// =====================================================
// /RELEASE
// =====================================================

async function executarRelease(interaction) {

    if (!verificarCanal(interaction)) {
        return interaction.reply({
            content:
                `❌ Este comando só pode ser usado em <#${config.CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const player =
        interaction.options.getUser("player");

    const managerId =
        interaction.user.id;

    try {

        // =============================================
        // BUSCAR PERMISSÃO DO MANAGER
        // =============================================

        const {
            data: permission,
            error: permissionError
        } = await supabase
            .from("manager_permissions")
            .select("team_role_id")
            .eq("manager_id", managerId)
            .maybeSingle();

        if (permissionError) {

            console.error(
                "❌ ERRO SUPABASE /release:",
                permissionError
            );

            return interaction.reply({
                content:
                    "❌ Não foi possível verificar sua permissão.",
                ephemeral: true
            });
        }

        if (!permission) {
            return interaction.reply({
                content:
                    "❌ Você não possui permissão para usar o `/release`.",
                ephemeral: true
            });
        }

        const teamRoleId =
            permission.team_role_id;

        const teamName =
            TEAM_ROLES[teamRoleId];

        if (!teamName) {
            return interaction.reply({
                content:
                    "❌ O time da sua permissão não é válido.",
                ephemeral: true
            });
        }

        // =============================================
        // BUSCAR PLAYER
        // =============================================

        const member =
            await interaction.guild.members
                .fetch(player.id)
                .catch(() => null);

        if (!member) {
            return interaction.reply({
                content:
                    "❌ Esse jogador não está no servidor.",
                ephemeral: true
            });
        }

        // =============================================
        // VERIFICAR CARGO
        // =============================================

        if (!member.roles.cache.has(teamRoleId)) {
            return interaction.reply({
                content:
                    `❌ ${player} não possui o cargo do **${teamName}**.`,
                ephemeral: true
            });
        }

        // =============================================
        // REMOVER CARGO
        // =============================================

        try {

            await member.roles.remove(
                teamRoleId
            );

        } catch (roleError) {

            console.error(
                "❌ ERRO AO REMOVER CARGO:",
                roleError
            );

            return interaction.reply({
                content:
                    "❌ Não consegui remover o cargo. Verifique a hierarquia de cargos do bot.",
                ephemeral: true
            });
        }

        // =============================================
        // ATUALIZAR CONTRATOS ATIVOS
        // =============================================

        const {
            error: updateError
        } = await supabase
            .from("contracts")
            .update({
                status: "released",
                updated_at: new Date().toISOString()
            })
            .eq("player_id", player.id)
            .eq("team_role_id", teamRoleId)
            .eq("status", "accepted");

        if (updateError) {
            console.error(
                "❌ ERRO AO ATUALIZAR RELEASE:",
                updateError
            );
        }

        return interaction.reply({
            content:
                `✅ ${player} foi liberado do **${teamName}**.`,
            ephemeral: true
        });

    } catch (error) {

        console.error(
            "❌ ERRO GERAL /release:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não foi possível liberar o jogador.",
            ephemeral: true
        });
    }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    contractCommands,
    executarPerm,
    executarUnperm,
    executarContract,
    executarRelease,
    processarBotaoContrato,
    TEAM_ROLES
};