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

// =====================================================
// CANAIS
// =====================================================

// Canal onde os comandos de contrato podem ser usados
const CONTRACT_CHANNEL_ID =
    "1552636518886019072";

// Canal onde ficam SOMENTE os resultados dos contratos
const CONTRACT_LOG_CHANNEL_ID =
    "1552634532262584391";

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
// FUNÇÕES
// =====================================================

const FUNCOES = [
    {
        name: "Titular",
        value: "Titular"
    },
    {
        name: "Reserva",
        value: "Reserva"
    },
    {
        name: "Assist Manager",
        value: "Assist Manager"
    }
];

// =====================================================
// COMANDOS
// =====================================================

const contractCommands = [

    // =================================================
    // /PERM
    // =================================================

    new SlashCommandBuilder()
        .setName("perm")
        .setDescription(
            "Dá permissão para um Manager usar um cargo no /contract."
        )
        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription(
                    "Manager que receberá a permissão."
                )
                .setRequired(true)
        )
        .addRoleOption(option =>
            option
                .setName("team")
                .setDescription(
                    "Cargo que o Manager poderá usar."
                )
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        ),

    // =================================================
    // /UNPERM
    // =================================================

    new SlashCommandBuilder()
        .setName("unperm")
        .setDescription(
            "Remove a permissão de um Manager."
        )
        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription(
                    "Manager que perderá a permissão."
                )
                .setRequired(true)
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        ),

    // =================================================
    // /PERMLIST
    // =================================================

    new SlashCommandBuilder()
        .setName("permlist")
        .setDescription(
            "Mostra todos os Managers que possuem permissão."
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        ),

    // =================================================
    // /CONTRACT
    // =================================================

    new SlashCommandBuilder()
        .setName("contract")
        .setDescription(
            "Envia um contrato para um jogador."
        )
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription(
                    "Jogador que receberá o contrato."
                )
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("position")
                .setDescription(
                    "Posição do jogador."
                )
                .setRequired(true)
                .addChoices(...POSICOES)
        )
        .addStringOption(option =>
            option
                .setName("function")
                .setDescription(
                    "Função do jogador."
                )
                .setRequired(true)
                .addChoices(...FUNCOES)
        ),

    // =================================================
    // /RELEASE
    // =================================================

    new SlashCommandBuilder()
        .setName("release")
        .setDescription(
            "Libera um jogador do seu time."
        )
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription(
                    "Jogador que será liberado."
                )
                .setRequired(true)
        )
];

// =====================================================
// VERIFICAR CANAL DOS COMANDOS
// =====================================================

function verificarCanal(interaction) {

    return (
        interaction.channelId ===
        CONTRACT_CHANNEL_ID
    );
}

// =====================================================
// CONTAINER DO CONTRATO
// =====================================================

function criarContratoContainer(
    contract,
    teamName,
    player,
    manager
) {

    return new ContainerBuilder()

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    "## 📄 CONTRATO"
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

                    `**Team:** ${teamName}\n` +
                    `**Posição:** ${contract.position}\n` +
                    `**Função:** ${contract.function}`
                )
        )

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addActionRowComponents(
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `contract_accept_${contract.id}`
                        )
                        .setLabel("Aceitar")
                        .setEmoji("✅")
                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            `contract_decline_${contract.id}`
                        )
                        .setLabel("Recusar")
                        .setEmoji("❌")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                )
        )

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    "-# VTL - CONTRACT SYSTEM"
                )
        );
}

// =====================================================
// /PERM
// =====================================================

async function executarPerm(interaction) {

    if (!verificarCanal(interaction)) {

        return interaction.reply({
            content:
                `❌ Este comando só pode ser usado em <#${CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const manager =
        interaction.options.getUser("manager");

    const teamRole =
        interaction.options.getRole("team");

    if (!teamRole) {

        return interaction.reply({
            content:
                "❌ Você precisa selecionar um cargo.",
            ephemeral: true
        });
    }

    try {

        const { error } =
            await supabase
                .from("manager_permissions")
                .upsert(
                    {
                        manager_id:
                            manager.id,

                        team_role_id:
                            teamRole.id
                    },
                    {
                        onConflict:
                            "manager_id"
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
                `✅ <@${manager.id}> agora possui permissão para usar o **${teamRole.name}** no \`/contract\`.`,
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
                `❌ Este comando só pode ser usado em <#${CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const manager =
        interaction.options.getUser("manager");

    try {

        const { error } =
            await supabase
                .from("manager_permissions")
                .delete()
                .eq(
                    "manager_id",
                    manager.id
                );

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
// /PERMLIST
// =====================================================

async function executarPermlist(interaction) {

    if (!verificarCanal(interaction)) {

        return interaction.reply({
            content:
                `❌ Este comando só pode ser usado em <#${CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    try {

        const {
            data: permissions,
            error
        } = await supabase
            .from("manager_permissions")
            .select(
                "manager_id, team_role_id"
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );

        if (error) {

            console.error(
                "❌ ERRO SUPABASE /permlist:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Não foi possível carregar a lista de permissões.",
                ephemeral: true
            });
        }

        if (
            !permissions ||
            permissions.length === 0
        ) {

            return interaction.reply({
                content:
                    "📋 **LISTA DE PERMISSÕES**\n\nNenhum Manager possui permissão atualmente.",
                ephemeral: true
            });
        }

        let lista = "";

        for (
            const permission of permissions
        ) {

            let managerNome =
                `<@${permission.manager_id}>`;

            let roleNome =
                "Cargo não encontrado";

            const role =
                await interaction.guild.roles
                    .fetch(
                        permission.team_role_id
                    )
                    .catch(() => null);

            if (role) {

                roleNome =
                    role.name;
            }

            lista +=
                `**${managerNome}** - ${roleNome}\n`;
        }

        const container =
            new ContainerBuilder()

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            "## 📋 LISTA DE PERMISSÕES"
                        )
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            lista
                        )
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            "-# VTL - CONTRACT SYSTEM"
                        )
                );

        return interaction.reply({
            components: [
                container
            ],
            flags: 32768,
            ephemeral: true
        });

    } catch (error) {

        console.error(
            "❌ ERRO GERAL /permlist:",
            error
        );

        return interaction.reply({
            content:
                "❌ Ocorreu um erro ao carregar a lista de permissões.",
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
                `❌ Este comando só pode ser usado em <#${CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const managerId =
        interaction.user.id;

    const player =
        interaction.options.getUser("player");

    const position =
        interaction.options.getString("position");

    const functionName =
        interaction.options.getString("function");

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
            .select(
                "manager_id, team_role_id"
            )
            .eq(
                "manager_id",
                managerId
            )
            .maybeSingle();

        if (permissionError) {

            console.error(
                "❌ ERRO AO BUSCAR PERMISSÃO:",
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

        const teamRoleId =
            permission.team_role_id;

        // =============================================
        // BUSCAR CARGO
        // =============================================

        const teamRole =
            await interaction.guild.roles
                .fetch(teamRoleId)
                .catch(() => null);

        if (!teamRole) {

            return interaction.reply({
                content:
                    "❌ O cargo da sua permissão não existe mais no servidor.",
                ephemeral: true
            });
        }

        const teamName =
            teamRole.name;

        // =============================================
        // VERIFICAR JOGADOR
        // =============================================

        const playerMember =
            await interaction.guild.members
                .fetch(player.id)
                .catch(() => null);

        if (!playerMember) {

            return interaction.reply({
                content:
                    "❌ Esse jogador precisa estar no servidor da VTL.",
                ephemeral: true
            });
        }

        // =============================================
        // CRIAR CONTRATO NO BANCO
        // =============================================

        const {
            data: contract,
            error: insertError
        } = await supabase
            .from("contracts")
            .insert({

                guild_id:
                    interaction.guildId,

                manager_id:
                    managerId,

                manager_role_id:
                    teamRoleId,

                player_id:
                    player.id,

                team_role_id:
                    teamRoleId,

                position:
                    position,

                function:
                    functionName,

                status:
                    "pending"
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
        // CRIAR CONTRATO VISUAL
        // =============================================

        const contractContainer =
            criarContratoContainer(
                contract,
                teamName,
                player,
                interaction.user
            );

        // =============================================
        // ENVIAR NO MESMO CHAT DO COMANDO
        // =============================================

        let canalEnviado = false;

        try {

            const channel =
                interaction.channel;

            if (!channel) {

                throw new Error(
                    "Canal da interação não encontrado."
                );
            }

            console.log(
                `📢 Enviando contrato no chat ${channel.id}...`
            );

            await channel.send({

                components: [
                    contractContainer
                ],

                flags: 32768
            });

            canalEnviado = true;

            console.log(
                `✅ Contrato enviado no chat ${channel.id}.`
            );

        } catch (channelError) {

            console.error(
                "❌ ERRO AO ENVIAR CONTRATO NO CHAT:",
                channelError
            );
        }

        // =============================================
        // ENVIAR NA DM
        // =============================================

        let dmEnviada = false;

        try {

            await player.send({

                components: [
                    contractContainer
                ],

                flags: 32768
            });

            dmEnviada = true;

            console.log(
                `✅ Contrato enviado na DM de ${player.tag}.`
            );

        } catch (dmError) {

            console.log(
                `⚠️ Não foi possível enviar DM para ${player.tag}.`
            );
        }

        // =============================================
        // RESULTADO
        // =============================================

        if (
            dmEnviada &&
            canalEnviado
        ) {

            return interaction.reply({
                content:
                    `✅ Contrato enviado no chat e na DM de ${player}.`,
                ephemeral: true
            });
        }

        if (
            !dmEnviada &&
            canalEnviado
        ) {

            return interaction.reply({
                content:
                    `✅ Contrato enviado no chat.\n⚠️ A DM de ${player} está fechada ou indisponível.`,
                ephemeral: true
            });
        }

        if (
            dmEnviada &&
            !canalEnviado
        ) {

            return interaction.reply({
                content:
                    `⚠️ Contrato enviado para ${player} na DM, mas não consegui enviar no chat.`,
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Não consegui enviar o contrato.",
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

    const customId =
        interaction.customId;

    const isAccept =
        customId.startsWith(
            "contract_accept_"
        );

    const isDecline =
        customId.startsWith(
            "contract_decline_"
        );

    if (!isAccept && !isDecline) {
        return;
    }

    const contractId =
        customId
            .replace(
                "contract_accept_",
                ""
            )
            .replace(
                "contract_decline_",
                ""
            );

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
            .eq(
                "id",
                contractId
            )
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
        // SOMENTE PLAYER
        // =============================================

        if (
            interaction.user.id !==
            contract.player_id
        ) {

            return interaction.reply({
                content:
                    "❌ Apenas o jogador que recebeu este contrato pode responder.",
                ephemeral: true
            });
        }

        // =============================================
        // JÁ RESPONDIDO
        // =============================================

        if (
            contract.status !==
            "pending"
        ) {

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

                    status:
                        "declined",

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    contract.id
                )
                .eq(
                    "status",
                    "pending"
                );

            if (updateError) {

                console.error(
                    "❌ ERRO AO RECUSAR:",
                    updateError
                );

                return interaction.reply({
                    content:
                        "❌ Não foi possível recusar o contrato.",
                    ephemeral: true
                });
            }

            // =========================================
            // LOG SOMENTE DO RESULTADO
            // =========================================

            await registrarContrato(
                interaction,
                contract,
                "❌ RECUSADO"
            );

            // =========================================
            // ATUALIZAR CONTRATO NO CHAT
            // =========================================

            return interaction.update({

                components: [

                    new ContainerBuilder()

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "## 📄 CONTRATO"
                                )
                        )

                        .addSeparatorComponents(
                            new SeparatorBuilder()
                        )

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "## ❌ CONTRATO RECUSADO"
                                )
                        )

                        .addSeparatorComponents(
                            new SeparatorBuilder()
                        )

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "-# VTL - CONTRACT SYSTEM"
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

            if (!contract.guild_id) {

                return interaction.reply({
                    content:
                        "❌ Este contrato não possui o servidor vinculado.",
                    ephemeral: true
                });
            }

            // =========================================
            // BUSCAR SERVIDOR
            // =========================================

            const guild =
                await interaction.client.guilds
                    .fetch(
                        contract.guild_id
                    )
                    .catch(() => null);

            if (!guild) {

                return interaction.reply({
                    content:
                        "❌ Não consegui encontrar o servidor da VTL.",
                    ephemeral: true
                });
            }

            // =========================================
            // BUSCAR PLAYER
            // =========================================

            const member =
                await guild.members
                    .fetch(
                        contract.player_id
                    )
                    .catch(() => null);

            if (!member) {

                return interaction.reply({
                    content:
                        "❌ Você precisa estar no servidor da VTL para aceitar o contrato.",
                    ephemeral: true
                });
            }

            // =========================================
            // BUSCAR CARGO
            // =========================================

            const role =
                await guild.roles
                    .fetch(
                        contract.team_role_id
                    )
                    .catch(() => null);

            if (!role) {

                return interaction.reply({
                    content:
                        "❌ O cargo deste time não existe mais.",
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
                        "❌ Não consegui adicionar o cargo do time. Verifique a hierarquia de cargos do bot.",
                    ephemeral: true
                });
            }

            // =========================================
            // ATUALIZAR BANCO
            // =========================================

            const {
                error: updateError
            } = await supabase
                .from("contracts")
                .update({

                    status:
                        "accepted",

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    contract.id
                )
                .eq(
                    "status",
                    "pending"
                );

            if (updateError) {

                console.error(
                    "❌ ERRO AO ATUALIZAR CONTRATO:",
                    updateError
                );

                await member.roles
                    .remove(
                        contract.team_role_id
                    )
                    .catch(() => {});

                return interaction.reply({
                    content:
                        "❌ Ocorreu um erro ao salvar o contrato.",
                    ephemeral: true
                });
            }

            // =========================================
            // LOG SOMENTE DO RESULTADO
            // =========================================

            await registrarContrato(
                interaction,
                contract,
                "✅ ACEITO"
            );

            // =========================================
            // BUSCAR NOME DO CARGO
            // =========================================

            const acceptedRole =
                await guild.roles
                    .fetch(
                        contract.team_role_id
                    )
                    .catch(() => null);

            const acceptedTeamName =
                acceptedRole
                    ? acceptedRole.name
                    : "Cargo";

            // =========================================
            // ATUALIZAR CONTRATO NO CHAT
            // =========================================

            return interaction.update({

                components: [

                    new ContainerBuilder()

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "## 📄 CONTRATO"
                                )
                        )

                        .addSeparatorComponents(
                            new SeparatorBuilder()
                        )

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    "## ✅ CONTRATO ACEITO"
                                )
                        )

                        .addSeparatorComponents(
                            new SeparatorBuilder()
                        )

                        .addTextDisplayComponents(
                            new TextDisplayBuilder()
                                .setContent(
                                    `**Team:** ${acceptedTeamName}\n` +
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
                                    "-# VTL - CONTRACT SYSTEM"
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

        if (
            !interaction.replied &&
            !interaction.deferred
        ) {

            return interaction.reply({
                content:
                    "❌ Ocorreu um erro ao processar o contrato.",
                ephemeral: true
            });
        }
    }
}

// =====================================================
// LOG DOS RESULTADOS
// =====================================================

async function registrarContrato(
    interaction,
    contract,
    resultado
) {

    try {

        const channel =
            await interaction.client.channels
                .fetch(
                    CONTRACT_LOG_CHANNEL_ID
                )
                .catch(() => null);

        if (!channel) {

            console.error(
                `❌ Canal de log ${CONTRACT_LOG_CHANNEL_ID} não encontrado.`
            );

            return;
        }

        // =============================================
        // BUSCAR SERVIDOR
        // =============================================

        let teamName =
            "Desconhecido";

        if (contract.guild_id) {

            const guild =
                await interaction.client.guilds
                    .fetch(
                        contract.guild_id
                    )
                    .catch(() => null);

            if (guild) {

                const role =
                    await guild.roles
                        .fetch(
                            contract.team_role_id
                        )
                        .catch(() => null);

                if (role) {
                    teamName = role.name;
                }
            }
        }

        // =============================================
        // CRIAR LOG
        // =============================================

        const container =
            new ContainerBuilder()

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `## 📄 CONTRATO ${resultado}`
                        )
                )

                .addSeparatorComponents(
                    new SeparatorBuilder()
                )

                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `**Player:** <@${contract.player_id}>\n` +
                            `**ID:** ${contract.player_id}\n\n` +

                            `**Manager:** <@${contract.manager_id}>\n` +
                            `**ID:** ${contract.manager_id}\n\n` +

                            `**Team:** ${teamName}\n` +
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
                            "-# VTL - CONTRACT SYSTEM"
                        )
                );

        await channel.send({

            components: [
                container
            ],

            flags: 32768
        });

        console.log(
            `📋 Log do contrato enviado: ${resultado}`
        );

    } catch (error) {

        console.error(
            "❌ ERRO AO ENVIAR LOG:",
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
                `❌ Este comando só pode ser usado em <#${CONTRACT_CHANNEL_ID}>.`,
            ephemeral: true
        });
    }

    const player =
        interaction.options.getUser(
            "player"
        );

    const managerId =
        interaction.user.id;

    try {

        // =============================================
        // BUSCAR PERMISSÃO
        // =============================================

        const {
            data: permission,
            error: permissionError
        } = await supabase
            .from("manager_permissions")
            .select(
                "team_role_id"
            )
            .eq(
                "manager_id",
                managerId
            )
            .maybeSingle();

        if (permissionError) {

            console.error(
                "❌ ERRO /release:",
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

        // =============================================
        // BUSCAR CARGO
        // =============================================

        const teamRole =
            await interaction.guild.roles
                .fetch(teamRoleId)
                .catch(() => null);

        if (!teamRole) {

            return interaction.reply({
                content:
                    "❌ O cargo da sua permissão não existe mais no servidor.",
                ephemeral: true
            });
        }

        const teamName =
            teamRole.name;

        // =============================================
        // BUSCAR PLAYER
        // =============================================

        const member =
            await interaction.guild.members
                .fetch(
                    player.id
                )
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

        if (
            !member.roles.cache.has(
                teamRoleId
            )
        ) {

            return interaction.reply({
                content:
                    `❌ ${player} não possui o cargo **${teamName}**.`,
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
                    "❌ Não consegui remover o cargo. Verifique a hierarquia do bot.",
                ephemeral: true
            });
        }

        // =============================================
        // ATUALIZAR BANCO
        // =============================================

        const {
            error: updateError
        } = await supabase
            .from("contracts")
            .update({

                status:
                    "released",

                updated_at:
                    new Date().toISOString()

            })
            .eq(
                "player_id",
                player.id
            )
            .eq(
                "team_role_id",
                teamRoleId
            )
            .eq(
                "status",
                "accepted"
            );

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
    executarPermlist,
    executarContract,
    executarRelease,
    processarBotaoContrato
};