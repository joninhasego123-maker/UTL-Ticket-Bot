const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    PermissionFlagsBits
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

const VALID_TEAM_ROLE_IDS = Object.keys(TEAM_ROLES);

// =====================================================
// COMANDOS
// =====================================================

const contractCommands = [

    // =========================
    // /perm
    // =========================

    new SlashCommandBuilder()
        .setName("perm")
        .setDescription("Permite um Manager usar o sistema de contratos.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
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
        ),

    // =========================
    // /unperm
    // =========================

    new SlashCommandBuilder()
        .setName("unperm")
        .setDescription("Remove a permissão de contratos de um Manager.")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator.toString()
        )
        .addUserOption(option =>
            option
                .setName("manager")
                .setDescription("Manager que perderá a permissão.")
                .setRequired(true)
        ),

    // =========================
    // /contract
    // =========================

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
                .addChoices(
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
                )
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

    // =========================
    // /release
    // =========================

    new SlashCommandBuilder()
        .setName("release")
        .setDescription("Libera um jogador do seu time.")
        .addUserOption(option =>
            option
                .setName("player")
                .setDescription("Jogador que será liberado.")
                .setRequired(true)
        )
];

// =====================================================
// VERIFICAR CANAL
// =====================================================

function verificarCanal(interaction) {
    if (
        interaction.channelId !==
        config.CONTRACT_CHANNEL_ID
    ) {
        return false;
    }

    return true;
}

// =====================================================
// PEGAR PERMISSÃO DO MANAGER
// =====================================================

async function pegarPermissaoManager(managerId) {

    const { data, error } = await supabase
        .from("manager_permissions")
        .select("manager_id, team_role_id")
        .eq("manager_id", managerId)
        .maybeSingle();

    if (error) {
        console.error(
            "Erro ao buscar permissão:",
            error
        );

        return null;
    }

    return data;
}

// =====================================================
// VERIFICAR SE É TIME VÁLIDO
// =====================================================

function ehTimeValido(roleId) {
    return VALID_TEAM_ROLE_IDS.includes(
        String(roleId)
    );
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

    const manager =
        interaction.options.getUser("manager");

    const teamRole =
        interaction.options.getRole("team");

    if (!ehTimeValido(teamRole.id)) {
        return interaction.reply({
            content:
                "❌ Esse cargo não está configurado como um dos times da UTL.",
            ephemeral: true
        });
    }

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
            "Erro ao salvar permissão:",
            error
        );

        return interaction.reply({
            content:
                "❌ Erro ao salvar a permissão.",
            ephemeral: true
        });
    }

    return interaction.reply({
        content:
            `✅ ${manager} agora possui permissão para usar o time **${TEAM_ROLES[teamRole.id]}** nos contratos.`,
        ephemeral: true
    });
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

    const manager =
        interaction.options.getUser("manager");

    const { data } = await supabase
        .from("manager_permissions")
        .select("manager_id")
        .eq("manager_id", manager.id)
        .maybeSingle();

    if (!data) {
        return interaction.reply({
            content:
                "❌ Esse Manager não possui uma permissão cadastrada.",
            ephemeral: true
        });
    }

    const { error } = await supabase
        .from("manager_permissions")
        .delete()
        .eq("manager_id", manager.id);

    if (error) {
        console.error(
            "Erro ao remover permissão:",
            error
        );

        return interaction.reply({
            content:
                "❌ Erro ao remover a permissão.",
            ephemeral: true
        });
    }

    return interaction.reply({
        content:
            `✅ A permissão de ${manager} foi removida.`,
        ephemeral: true
    });
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

    const managerId =
        interaction.user.id;

    const player =
        interaction.options.getUser("player");

    const position =
        interaction.options.getString("position");

    const functionName =
        interaction.options.getString("function");

    // =============================================
    // PEGAR PERMISSÃO
    // =============================================

    const permission =
        await pegarPermissaoManager(managerId);

    if (!permission) {
        return interaction.reply({
            content:
                "❌ Você não possui permissão para usar o sistema de contratos.",
            ephemeral: true
        });
    }

    const teamRoleId =
        permission.team_role_id;

    if (!ehTimeValido(teamRoleId)) {
        return interaction.reply({
            content:
                "❌ O time autorizado para você não é válido.",
            ephemeral: true
        });
    }

    // =============================================
    // VERIFICAR SE O MANAGER AINDA TEM O CARGO
    // =============================================

    const managerMember =
        interaction.guild.members.cache.get(
            managerId
        ) ||
        await interaction.guild.members
            .fetch(managerId)
            .catch(() => null);

    if (!managerMember) {
        return interaction.reply({
            content:
                "❌ Não consegui encontrar você no servidor.",
            ephemeral: true
        });
    }

    if (
        !managerMember.roles.cache.has(
            teamRoleId
        )
    ) {
        return interaction.reply({
            content:
                `❌ Você não possui atualmente o cargo de **${TEAM_ROLES[teamRoleId]}**.`,
            ephemeral: true
        });
    }

    // =============================================
    // VERIFICAR SE O JOGADOR É O PRÓPRIO MANAGER
    // =============================================

    if (player.id === managerId) {
        return interaction.reply({
            content:
                "❌ Você não pode fazer um contrato consigo mesmo.",
            ephemeral: true
        });
    }

    // =============================================
    // CRIAR CONTRATO NO SUPABASE
    // =============================================

    const { data: contract, error } =
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

    if (error) {
        console.error(
            "Erro ao criar contrato:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não foi possível criar o contrato.",
            ephemeral: true
        });
    }

    // =============================================
    // MONTAR CONTRATO
    // =============================================

    const contratoContainer =
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
                        "-# UTL - CONTRACT SYSTEM"
                    )
            );

    // =============================================
    // ENVIAR DM
    // =============================================

    try {

        await player.send({
            components: [
                contratoContainer
            ],
            flags: 32768
        });

    } catch (error) {

        console.error(
            "Erro ao enviar contrato por DM:",
            error
        );

        // Se não conseguiu enviar a DM,
        // remove o contrato criado.

        await supabase
            .from("contracts")
            .delete()
            .eq("id", contract.id);

        return interaction.reply({
            content:
                `❌ Não consegui enviar uma DM para ${player}.\n` +
                `Verifique se ele permite mensagens diretas.`,
            ephemeral: true
        });
    }

    // =============================================
    // CONFIRMAÇÃO
    // =============================================

    return interaction.reply({
        content:
            `✅ Contrato enviado para ${player} por DM.`,
        ephemeral: true
    });
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

    // =============================================
    // PEGAR PERMISSÃO DO MANAGER
    // =============================================

    const permission =
        await pegarPermissaoManager(managerId);

    if (!permission) {
        return interaction.reply({
            content:
                "❌ Você não possui permissão para usar o sistema.",
            ephemeral: true
        });
    }

    const teamRoleId =
        permission.team_role_id;

    if (!ehTimeValido(teamRoleId)) {
        return interaction.reply({
            content:
                "❌ Seu time configurado não é válido.",
            ephemeral: true
        });
    }

    // =============================================
    // PEGAR MEMBRO
    // =============================================

    const member =
        interaction.guild.members.cache.get(
            player.id
        ) ||
        await interaction.guild.members
            .fetch(player.id)
            .catch(() => null);

    if (!member) {
        return interaction.reply({
            content:
                "❌ Não encontrei esse jogador no servidor.",
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
                `❌ ${player} não possui o cargo de **${TEAM_ROLES[teamRoleId]}**.`,
            ephemeral: true
        });
    }

    // =============================================
    // REMOVER CARGO
    // =============================================

    try {

        await member.roles.remove(
            teamRoleId,
            `Release realizado por ${interaction.user.tag}`
        );

    } catch (error) {

        console.error(
            "Erro ao remover cargo:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não consegui remover o cargo. Verifique se o cargo do bot está acima do cargo do time.",
            ephemeral: true
        });
    }

    // =============================================
    // ATUALIZAR CONTRATOS ATIVOS
    // =============================================

    await supabase
        .from("contracts")
        .update({
            status: "released",
            updated_at: new Date().toISOString()
        })
        .eq("player_id", player.id)
        .eq("team_role_id", teamRoleId)
        .eq("status", "accepted");

    // =============================================
    // RESPOSTA
    // =============================================

    return interaction.reply({
        content:
            `✅ ${player} foi liberado do time **${TEAM_ROLES[teamRoleId]}**.`,
        ephemeral: true
    });
}

// =====================================================
// BOTÕES DO CONTRATO
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

    // =============================================
    // PEGAR ID DO CONTRATO
    // =============================================

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

    // =============================================
    // BUSCAR CONTRATO
    // =============================================

    const { data: contract, error } =
        await supabase
            .from("contracts")
            .select("*")
            .eq("id", contractId)
            .maybeSingle();

    if (error) {
        console.error(
            "Erro ao buscar contrato:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não consegui carregar este contrato."
        });
    }

    if (!contract) {
        return interaction.reply({
            content:
                "❌ Este contrato não existe mais."
        });
    }

    // =============================================
    // VERIFICAR SE É O JOGADOR
    // =============================================

    if (
        interaction.user.id !==
        contract.player_id
    ) {
        return interaction.reply({
            content:
                "❌ Apenas o jogador que recebeu este contrato pode responder."
        });
    }

    // =============================================
    // VERIFICAR STATUS
    // =============================================

    if (
        contract.status !== "pending"
    ) {
        return interaction.reply({
            content:
                "❌ Este contrato já foi respondido."
        });
    }

    // =================================================
    // RECUSAR
    // =================================================

    if (isDecline) {

        const { error: updateError } =
            await supabase
                .from("contracts")
                .update({
                    status: "declined",
                    updated_at:
                        new Date().toISOString()
                })
                .eq("id", contract.id)
                .eq("status", "pending");

        if (updateError) {
            console.error(
                "Erro ao recusar contrato:",
                updateError
            );

            return interaction.reply({
                content:
                    "❌ Não consegui recusar o contrato."
            });
        }

        // =============================================
        // LOG
        // =============================================

        await enviarLogContrato(
            interaction.client,
            contract,
            "declined"
        );

        // =============================================
        // ATUALIZAR DM
        // =============================================

        const recusadoContainer =
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            "# ❌ CONTRATO RECUSADO"
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `**Player:** ${interaction.user}\n` +
                            `**ID:** ${interaction.user.id}\n\n` +
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

        return interaction.update({
            components: [
                recusadoContainer
            ],
            flags: 32768
        });
    }

    // =================================================
    // ACEITAR
    // =================================================

    let guild;

    try {

        guild =
            await interaction.client.guilds.fetch(
                contract.guild_id
            );

    } catch (error) {

        console.error(
            "Erro ao buscar servidor:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não consegui encontrar o servidor onde o contrato foi criado."
        });
    }

    // =============================================
    // PEGAR MEMBRO
    // =============================================

    let member;

    try {

        member =
            await guild.members.fetch(
                contract.player_id
            );

    } catch (error) {

        console.error(
            "Erro ao buscar jogador:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não consegui encontrar você no servidor."
        });
    }

    // =============================================
    // VERIFICAR CARGO DO TIME
    // =============================================

    const teamRole =
        guild.roles.cache.get(
            contract.team_role_id
        ) ||
        await guild.roles.fetch(
            contract.team_role_id
        ).catch(() => null);

    if (!teamRole) {
        return interaction.reply({
            content:
                "❌ O cargo do time não existe mais no servidor."
        });
    }

    // =============================================
    // ADICIONAR CARGO
    // =============================================

    try {

        await member.roles.add(
            contract.team_role_id,
            "Contrato aceito pelo jogador"
        );

    } catch (error) {

        console.error(
            "Erro ao adicionar cargo:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não consegui adicionar o cargo do time.\n\n" +
                "Verifique se o cargo do bot está acima do cargo do time."
        });
    }

    // =============================================
    // ATUALIZAR BANCO
    // =============================================

    const { error: updateError } =
        await supabase
            .from("contracts")
            .update({
                status: "accepted",
                updated_at:
                    new Date().toISOString()
            })
            .eq("id", contract.id)
            .eq("status", "pending");

    if (updateError) {

        console.error(
            "Erro ao atualizar contrato:",
            updateError
        );

        // Se o banco falhou depois do cargo ser
        // adicionado, removemos o cargo para
        // evitar inconsistência.

        await member.roles
            .remove(
                contract.team_role_id,
                "Falha ao registrar contrato"
            )
            .catch(() => {});

        return interaction.reply({
            content:
                "❌ O contrato não pôde ser registrado."
        });
    }

    // =============================================
    // LOG
    // =============================================

    await enviarLogContrato(
        interaction.client,
        contract,
        "accepted"
    );

    // =============================================
    // ATUALIZAR DM
    // =============================================

    const aceitoContainer =
        new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        "# ✅ CONTRATO ACEITO"
                    )
            )
            .addSeparatorComponents(
                new SeparatorBuilder()
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `**Player:** ${interaction.user}\n` +
                        `**ID:** ${interaction.user.id}\n\n` +
                        `**Posição:** ${contract.position}\n` +
                        `**Função:** ${contract.function}\n\n` +
                        `Seu contrato foi aceito e o cargo do time foi adicionado ao seu perfil.`
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

    return interaction.update({
        components: [
            aceitoContainer
        ],
        flags: 32768
    });
}

// =====================================================
// LOG DE CONTRATO
// =====================================================

async function enviarLogContrato(
    client,
    contract,
    status
) {

    try {

        const channel =
            await client.channels.fetch(
                config.CONTRACT_LOG_CHANNEL_ID
            );

        if (!channel) {
            return;
        }

        let titulo;
        let emoji;

        if (status === "accepted") {
            titulo = "CONTRATO ACEITO";
            emoji = "✅";
        } else {
            titulo = "CONTRATO RECUSADO";
            emoji = "❌";
        }

        const teamName =
            TEAM_ROLES[
                contract.team_role_id
            ] || "Desconhecido";

        const logContainer =
            new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `# ${emoji} ${titulo}`
                        )
                )
                .addSeparatorComponents(
                    new SeparatorBuilder()
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent(
                            `**Time:** ${teamName}\n` +
                            `**Manager:** <@${contract.manager_id}>\n` +
                            `**ID:** ${contract.manager_id}\n\n` +
                            `**Player:** <@${contract.player_id}>\n` +
                            `**ID:** ${contract.player_id}\n\n` +
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
            components: [
                logContainer
            ],
            flags: 32768
        });

    } catch (error) {

        console.error(
            "Erro ao enviar log do contrato:",
            error
        );
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
    processarBotaoContrato
};