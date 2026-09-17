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
// TEAMS
// =====================================================

const TEAMS = {
    Corinthians: "1550260388866691213",
    Flamengo: "1550259753903718450",
    Cruzeiro: "1550259441054654494",
    Grêmio: "1550259517105766410",
    Atlético: "1550259846010380368",
    Vitória: "1550260303474729061",
    Bahia: "1550260226551185508",
    "São Paulo": "1550260711979221062",
    Palmeiras: "1550260057021882508",
    Internacional: "1550259618889072650"
};

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function teamRoleIdByName(teamName) {
    return TEAMS[teamName];
}

function teamNameByRoleId(roleId) {
    return Object.keys(TEAMS).find(
        name => TEAMS[name] === roleId
    );
}

function isValidTeamRole(roleId) {
    return Object.values(TEAMS).includes(roleId);
}

function isContractChannel(interaction) {
    return interaction.channelId === config.CONTRACT_CHANNEL_ID;
}

async function getManagerPermission(managerId) {

    const { data, error } = await supabase
        .from("manager_permissions")
        .select("manager_id, team_role_id")
        .eq("manager_id", managerId)
        .maybeSingle();

    if (error) {
        console.error(
            "❌ Erro ao buscar permissão:",
            error
        );

        return null;
    }

    return data;
}

// =====================================================
// /PERM
// =====================================================

const permCommand = new SlashCommandBuilder()
    .setName("perm")
    .setDescription(
        "Permite que um Manager use um Team no Contract."
    )
    .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
    )
    .addUserOption(option =>
        option
            .setName("usuario")
            .setDescription(
                "Manager que receberá a permissão."
            )
            .setRequired(true)
    )
    .addRoleOption(option =>
        option
            .setName("team")
            .setDescription(
                "Cargo do Team que o Manager poderá usar."
            )
            .setRequired(true)
    );

// =====================================================
// /UNPERM
// =====================================================

const unpermCommand = new SlashCommandBuilder()
    .setName("unperm")
    .setDescription(
        "Remove a permissão de Contract de um Manager."
    )
    .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
    )
    .addUserOption(option =>
        option
            .setName("usuario")
            .setDescription(
                "Manager que perderá a permissão."
            )
            .setRequired(true)
    );

// =====================================================
// /CONTRACT
// =====================================================

const contractCommand = new SlashCommandBuilder()
    .setName("contract")
    .setDescription(
        "Cria um contrato para um jogador."
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
            .setName("posicao")
            .setDescription(
                "Posição do jogador."
            )
            .setRequired(true)
            .addChoices(
                {
                    name: "🧤 Goleiro",
                    value: "Goleiro"
                },
                {
                    name: "🛡️ Zagueiro",
                    value: "Zagueiro"
                },
                {
                    name: "🏃 Volante",
                    value: "Volante"
                },
                {
                    name: "🎯 Meia",
                    value: "Meia"
                },
                {
                    name: "⚡ Atacante",
                    value: "Atacante"
                }
            )
    )
    .addStringOption(option =>
        option
            .setName("function")
            .setDescription(
                "Função do jogador."
            )
            .setRequired(true)
            .addChoices(
                {
                    name: "⭐ Titular",
                    value: "Titular"
                },
                {
                    name: "🔄 Reserva",
                    value: "Reserva"
                }
            )
    );

// =====================================================
// /RELEASE
// =====================================================

const releaseCommand = new SlashCommandBuilder()
    .setName("release")
    .setDescription(
        "Remove o Team de um jogador."
    )
    .addUserOption(option =>
        option
            .setName("player")
            .setDescription(
                "Jogador que será liberado."
            )
            .setRequired(true)
    );

// =====================================================
// LISTA DOS COMANDOS
// =====================================================

const contractCommands = [
    permCommand,
    unpermCommand,
    contractCommand,
    releaseCommand
];

// =====================================================
// CONTRATO CV2
// =====================================================

function criarContratoCV2({
    teamName,
    manager,
    managerId,
    player,
    playerId,
    position,
    playerFunction,
    contractId
}) {

    const container =
        new ContainerBuilder();

    // =============================================
    // TÍTULO
    // =============================================

    container.addTextDisplayComponents(
        new TextDisplayBuilder()
            .setContent(
                "# 📋 CONTRATO DE JOGADOR\n" +
                "### ULTIMATE TCS LEAGUE\n\n" +
                "Este documento representa uma proposta oficial de contrato dentro da UTL."
            )
    );

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    // =============================================
    // INFORMAÇÕES
    // =============================================

    container.addTextDisplayComponents(
        new TextDisplayBuilder()
            .setContent(

                `## 🏆 TEAM\n` +
                `<@&${teamRoleIdByName(teamName)}>\n\n` +

                `## 👔 MANAGER\n` +
                `${manager}\n` +
                `**Manager ID:** \`${managerId}\`\n\n` +

                `## 👤 PLAYER\n` +
                `${player}\n` +
                `**Player ID:** \`${playerId}\`\n\n` +

                `## ⚽ POSIÇÃO\n` +
                `${position}\n\n` +

                `## 📌 FUNÇÃO\n` +
                `${playerFunction}`
            )
    );

    // =============================================
    // STATUS
    // =============================================

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder()
            .setContent(
                "### 📄 Status do contrato\n" +
                "🟡 **Aguardando resposta do jogador**"
            )
    );

    // =============================================
    // BOTÕES
    // =============================================

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    const buttons =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `contract_accept_${contractId}`
                    )
                    .setLabel("Aceitar")
                    .setEmoji("✅")
                    .setStyle(
                        ButtonStyle.Success
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `contract_decline_${contractId}`
                    )
                    .setLabel("Recusar")
                    .setEmoji("❌")
                    .setStyle(
                        ButtonStyle.Danger
                    )
            );

    container.addActionRowComponents(
        buttons
    );

    // =============================================
    // RODAPÉ
    // =============================================

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder()
            .setContent(
                "-# UTL - CONTRACT SYSTEM"
            )
    );

    return container;
}

// =====================================================
// /PERM
// =====================================================

async function executarPerm(interaction) {

    // =============================================
    // CANAL
    // =============================================

    if (!isContractChannel(interaction)) {

        return interaction.reply({
            content:
                "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

    // =============================================
    // ADMIN
    // =============================================

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

    // =============================================
    // OPÇÕES
    // =============================================

    const user =
        interaction.options.getUser(
            "usuario"
        );

    const teamRole =
        interaction.options.getRole(
            "team"
        );

    // =============================================
    // VERIFICA TEAM
    // =============================================

    if (!isValidTeamRole(teamRole.id)) {

        return interaction.reply({
            content:
                "❌ Esse cargo não é um Team válido da UTL.",
            ephemeral: true
        });
    }

    const teamName =
        teamNameByRoleId(
            teamRole.id
        );

    // =============================================
    // SALVAR NO SUPABASE
    // =============================================

    const { error } = await supabase
        .from("manager_permissions")
        .upsert({
            manager_id: user.id,
            team_role_id: teamRole.id
        });

    if (error) {

        console.error(
            "❌ Erro ao salvar permissão:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não foi possível salvar a permissão.",
            ephemeral: true
        });
    }

    // =============================================
    // RESPOSTA
    // =============================================

    return interaction.reply({

        content:
            `✅ ${user} agora possui permissão para criar contratos.\n\n` +
            `🏆 **Team:** <@&${teamRole.id}>\n` +
            `📋 **Team:** ${teamName}`,

        ephemeral: true
    });
}

// =====================================================
// /UNPERM
// =====================================================

async function executarUnperm(interaction) {

    if (!isContractChannel(interaction)) {

        return interaction.reply({
            content:
                "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

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

    const user =
        interaction.options.getUser(
            "usuario"
        );

    const { error } = await supabase
        .from("manager_permissions")
        .delete()
        .eq(
            "manager_id",
            user.id
        );

    if (error) {

        console.error(
            "❌ Erro ao remover permissão:",
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
            `✅ A permissão de Contract de ${user} foi removida.`,

        ephemeral: true
    });
}

// =====================================================
// /CONTRACT
// =====================================================

async function executarContract(interaction) {

    // =============================================
    // CANAL
    // =============================================

    if (!isContractChannel(interaction)) {

        return interaction.reply({
            content:
                "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

    // =============================================
    // PERMISSÃO
    // =============================================

    const permission =
        await getManagerPermission(
            interaction.user.id
        );

    if (!permission) {

        return interaction.reply({
            content:
                "❌ Você não possui nenhum Team autorizado para criar contratos.",
            ephemeral: true
        });
    }

    // =============================================
    // OPÇÕES
    // =============================================

    const player =
        interaction.options.getUser(
            "player"
        );

    const position =
        interaction.options.getString(
            "posicao"
        );

    const playerFunction =
        interaction.options.getString(
            "function"
        );

    // =============================================
    // TEAM
    // =============================================

    const teamName =
        teamNameByRoleId(
            permission.team_role_id
        );

    if (!teamName) {

        return interaction.reply({
            content:
                "❌ O Team autorizado não é mais válido.",
            ephemeral: true
        });
    }

    // =============================================
    // NÃO PODE CONTRATAR A SI MESMO
    // =============================================

    if (
        player.id ===
        interaction.user.id
    ) {

        return interaction.reply({
            content:
                "❌ Você não pode criar um contrato para si mesmo.",
            ephemeral: true
        });
    }

    // =============================================
    // CRIAR CONTRATO
    // =============================================

    const {
        data,
        error
    } = await supabase
        .from("contracts")
        .insert({

            manager_id:
                interaction.user.id,

            manager_role_id:
                permission.team_role_id,

            player_id:
                player.id,

            team_role_id:
                permission.team_role_id,

            position:
                position,

            function:
                playerFunction,

            status:
                "pending"
        })
        .select()
        .single();

    if (error) {

        console.error(
            "❌ Erro ao criar contrato:",
            error
        );

        return interaction.reply({
            content:
                "❌ Não foi possível criar o contrato.",
            ephemeral: true
        });
    }

    // =============================================
    // MENÇÕES
    // =============================================

    const managerMention =
        `<@${interaction.user.id}>`;

    const playerMention =
        `<@${player.id}>`;

    // =============================================
    // CV2
    // =============================================

    const container =
        criarContratoCV2({

            teamName,

            manager:
                managerMention,

            managerId:
                interaction.user.id,

            player:
                playerMention,

            playerId:
                player.id,

            position,

            playerFunction,

            contractId:
                data.id
        });

    // =============================================
    // ENVIAR NO CANAL
    // =============================================

    await interaction.channel.send({

        components: [
            container
        ],

        flags: 32768
    });

    // =============================================
    // ENVIAR DM
    // =============================================

    try {

        const dmContainer =
            criarContratoCV2({

                teamName,

                manager:
                    managerMention,

                managerId:
                    interaction.user.id,

                player:
                    playerMention,

                playerId:
                    player.id,

                position,

                playerFunction,

                contractId:
                    data.id
            });

        await player.send({

            components: [
                dmContainer
            ],

            flags: 32768
        });

    } catch (error) {

        console.log(
            `⚠️ Não foi possível enviar DM para ${player.tag}.`
        );
    }

    // =============================================
    // RESPOSTA
    // =============================================

    return interaction.reply({

        content:
            `✅ Contrato enviado para ${player}!\n` +
            `🏆 **Team:** ${teamName}\n` +
            `📋 **Contrato:** #${data.id}`,

        ephemeral: true
    });
}

// =====================================================
// /RELEASE
// =====================================================

async function executarRelease(interaction) {

    // =============================================
    // CANAL
    // =============================================

    if (!isContractChannel(interaction)) {

        return interaction.reply({
            content:
                "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

    // =============================================
    // PLAYER
    // =============================================

    const player =
        interaction.options.getUser(
            "player"
        );

    // =============================================
    // PERMISSÃO DO MANAGER
    // =============================================

    const permission =
        await getManagerPermission(
            interaction.user.id
        );

    if (!permission) {

        return interaction.reply({
            content:
                "❌ Você não possui um Team autorizado para usar o Release.",
            ephemeral: true
        });
    }

    const teamName =
        teamNameByRoleId(
            permission.team_role_id
        );

    // =============================================
    // BUSCAR PLAYER
    // =============================================

    let member;

    try {

        member =
            await interaction.guild.members.fetch(
                player.id
            );

    } catch (error) {

        return interaction.reply({
            content:
                "❌ Não consegui encontrar esse jogador no servidor.",
            ephemeral: true
        });
    }

    // =============================================
    // VERIFICAR CARGO
    // =============================================

    if (
        !member.roles.cache.has(
            permission.team_role_id
        )
    ) {

        return interaction.reply({

            content:
                `❌ ${player} não possui o cargo <@&${permission.team_role_id}>.`,

            ephemeral: true
        });
    }

    // =============================================
    // REMOVER CARGO
    // =============================================

    try {

        await member.roles.remove(

            permission.team_role_id,

            `Release realizado por ${interaction.user.tag}`
        );

    } catch (error) {

        console.error(
            "❌ Erro ao remover cargo:",
            error
        );

        return interaction.reply({

            content:
                "❌ Não consegui remover o cargo. Verifique se o cargo do bot está acima do cargo do Team.",

            ephemeral: true
        });
    }

    // =============================================
    // RESPOSTA
    // =============================================

    return interaction.reply({

        content:
            `✅ ${player} foi liberado do Team **${teamName}**.\n` +
            `🗑️ Cargo removido: <@&${permission.team_role_id}>`,

        ephemeral: false
    });
}

// =====================================================
// BOTÕES DO CONTRATO
// =====================================================

async function processarBotaoContrato(
    interaction
) {

    const customId =
        interaction.customId;

    // =============================================
    // VERIFICAR BOTÃO
    // =============================================

    if (
        !customId.startsWith(
            "contract_accept_"
        ) &&
        !customId.startsWith(
            "contract_decline_"
        )
    ) {

        return false;
    }

    // =============================================
    // TIPO
    // =============================================

    const isAccept =
        customId.startsWith(
            "contract_accept_"
        );

    // =============================================
    // ID
    // =============================================

    const contractId =
        customId.split("_").pop();

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
        .single();

    if (
        error ||
        !contract
    ) {

        await interaction.reply({

            content:
                "❌ Este contrato não existe mais.",

            ephemeral: true
        });

        return true;
    }

    // =============================================
    // SOMENTE PLAYER
    // =============================================

    if (
        interaction.user.id !==
        contract.player_id
    ) {

        await interaction.reply({

            content:
                "❌ Apenas o jogador que recebeu este contrato pode responder.",

            ephemeral: true
        });

        return true;
    }

    // =============================================
    // JÁ RESPONDIDO
    // =============================================

    if (
        contract.status !==
        "pending"
    ) {

        await interaction.reply({

            content:
                `❌ Este contrato já foi **${
                    contract.status === "accepted"
                        ? "aceito"
                        : "recusado"
                }**.`,

            ephemeral: true
        });

        return true;
    }

    // =============================================
    // NOVO STATUS
    // =============================================

    const newStatus =
        isAccept
            ? "accepted"
            : "declined";

    // =============================================
    // ATUALIZAR BANCO
    // =============================================

    const {
        error: updateError
    } = await supabase
        .from("contracts")
        .update({

            status:
                newStatus,

            updated_at:
                new Date().toISOString()
        })
        .eq(
            "id",
            contractId
        );

    if (updateError) {

        console.error(
            "❌ Erro ao atualizar contrato:",
            updateError
        );

        await interaction.reply({

            content:
                "❌ Não foi possível atualizar o contrato.",

            ephemeral: true
        });

        return true;
    }

    // =============================================
    // TEAM
    // =============================================

    const teamName =
        teamNameByRoleId(
            contract.team_role_id
        );

    // =============================================
    // ACEITOU → ADICIONAR CARGO
    // =============================================

    if (isAccept) {

        try {

            // Só funciona se a interação
            // aconteceu dentro do servidor
            if (!interaction.guild) {

                await interaction.reply({

                    content:
                        "❌ O contrato foi aceito, mas a confirmação precisa ser feita dentro do servidor para adicionar o cargo.",

                    ephemeral: true
                });

                return true;
            }

            const member =
                await interaction.guild.members.fetch(
                    contract.player_id
                );

            await member.roles.add(

                contract.team_role_id,

                `Contrato #${contract.id} aceito`
            );

        } catch (error) {

            console.error(
                "❌ Erro ao adicionar cargo:",
                error
            );

            await interaction.reply({

                content:
                    "❌ O contrato foi aceito, mas não consegui adicionar o cargo. Verifique a hierarquia de cargos do bot.",

                ephemeral: true
            });

            return true;
        }
    }

    // =============================================
    // RESPOSTA AO PLAYER
    // =============================================

    await interaction.reply({

        content:
            isAccept

                ? `✅ Você aceitou o contrato com **${teamName}**!`

                : `❌ Você recusou o contrato com **${teamName}**.`,

        ephemeral: true
    });

    // =============================================
    // LOG
    // =============================================

    const logChannel =
        await interaction.client.channels
            .fetch(
                config.CONTRACT_LOG_CHANNEL_ID
            )
            .catch(
                () => null
            );

    if (logChannel) {

        const logContainer =
            new ContainerBuilder();

        // =========================================
        // TÍTULO
        // =========================================

        logContainer.addTextDisplayComponents(

            new TextDisplayBuilder()
                .setContent(

                    isAccept

                        ? "# ✅ CONTRATO ACEITO"

                        : "# ❌ CONTRATO RECUSADO"
                )
        );

        logContainer.addSeparatorComponents(
            new SeparatorBuilder()
        );

        // =========================================
        // DADOS
        // =========================================

        logContainer.addTextDisplayComponents(

            new TextDisplayBuilder()
                .setContent(

                    `🏆 **Team:** <@&${contract.team_role_id}>\n\n` +

                    `👔 **Manager:** <@${contract.manager_id}>\n` +
                    `**Manager ID:** \`${contract.manager_id}\`\n\n` +

                    `👤 **Player:** <@${contract.player_id}>\n` +
                    `**Player ID:** \`${contract.player_id}\`\n\n` +

                    `⚽ **Posição:** ${contract.position}\n` +
                    `📌 **Função:** ${contract.function}\n\n` +

                    `📋 **Contrato:** #${contract.id}`
                )
        );

        logContainer.addSeparatorComponents(
            new SeparatorBuilder()
        );

        logContainer.addTextDisplayComponents(

            new TextDisplayBuilder()
                .setContent(
                    "-# UTL - CONTRACT SYSTEM"
                )
        );

        await logChannel.send({

            components: [
                logContainer
            ],

            flags: 32768
        });
    }

    return true;
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    TEAMS,

    contractCommands,

    executarPerm,
    executarUnperm,
    executarContract,
    executarRelease,

    processarBotaoContrato
};