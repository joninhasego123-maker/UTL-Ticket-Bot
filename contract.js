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
        console.error("Erro ao buscar permissão:", error);
        return null;
    }

    return data;
}

// =====================================================
// COMANDOS
// =====================================================

const permCommand = new SlashCommandBuilder()
    .setName("perm")
    .setDescription("Permite que um Manager use um Team no Contract.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
        option
            .setName("usuario")
            .setDescription("Manager que receberá a permissão.")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("team")
            .setDescription("Team que o Manager poderá usar.")
            .setRequired(true)
            .addChoices(
                { name: "Corinthians", value: "Corinthians" },
                { name: "Flamengo", value: "Flamengo" },
                { name: "Cruzeiro", value: "Cruzeiro" },
                { name: "Grêmio", value: "Grêmio" },
                { name: "Atlético", value: "Atlético" },
                { name: "Vitória", value: "Vitória" },
                { name: "Bahia", value: "Bahia" },
                { name: "São Paulo", value: "São Paulo" },
                { name: "Palmeiras", value: "Palmeiras" },
                { name: "Internacional", value: "Internacional" }
            )
    );

const unpermCommand = new SlashCommandBuilder()
    .setName("unperm")
    .setDescription("Remove a permissão de Contract de um Manager.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
        option
            .setName("usuario")
            .setDescription("Manager que perderá a permissão.")
            .setRequired(true)
    );

const contractCommand = new SlashCommandBuilder()
    .setName("contract")
    .setDescription("Cria um contrato para um jogador.")
    .addUserOption(option =>
        option
            .setName("player")
            .setDescription("Jogador que receberá o contrato.")
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName("posicao")
            .setDescription("Posição do jogador.")
            .setRequired(true)
            .addChoices(
                { name: "🧤 Goleiro", value: "Goleiro" },
                { name: "🛡️ Zagueiro", value: "Zagueiro" },
                { name: "🏃 Volante", value: "Volante" },
                { name: "🎯 Meia", value: "Meia" },
                { name: "⚡ Atacante", value: "Atacante" }
            )
    )
    .addStringOption(option =>
        option
            .setName("function")
            .setDescription("Função do jogador.")
            .setRequired(true)
            .addChoices(
                { name: "⭐ Titular", value: "Titular" },
                { name: "🔄 Reserva", value: "Reserva" }
            )
    );

const releaseCommand = new SlashCommandBuilder()
    .setName("release")
    .setDescription("Remove o Team de um jogador.")
    .addUserOption(option =>
        option
            .setName("player")
            .setDescription("Jogador que será liberado.")
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
    player,
    position,
    playerFunction,
    contractId
}) {
    const container = new ContainerBuilder();

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            "# 📋 CONTRATO DE JOGADOR\n" +
            "### ULTIMATE TCS LEAGUE\n\n" +
            "Este documento representa uma proposta oficial de contrato dentro da UTL."
        )
    );

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `## 🏆 TEAM\n` +
            `<@&${teamRoleIdByName(teamName)}>\n\n` +

            `## 👔 MANAGER\n` +
            `${manager}\n` +
            `**ID:** \`${manager.replace(/[<@!>]/g, "")}\`\n\n` +

            `## 👤 PLAYER\n` +
            `${player}\n` +
            `**ID:** \`${player.replace(/[<@!>]/g, "")}\`\n\n` +

            `## ⚽ POSIÇÃO\n` +
            `${position}\n\n` +

            `## 📌 FUNÇÃO\n` +
            `${playerFunction}`
        )
    );

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            "### 📄 Status do contrato\n" +
            "🟡 **Aguardando resposta do jogador**"
        )
    );

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`contract_accept_${contractId}`)
            .setLabel("Aceitar")
            .setEmoji("✅")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId(`contract_decline_${contractId}`)
            .setLabel("Recusar")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger)
    );

    container.addActionRowComponents(buttons);

    container.addSeparatorComponents(
        new SeparatorBuilder()
    );

    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            "-# UTL - CONTRACT SYSTEM"
        )
    );

    return container;
}

// =====================================================
// /PERM
// =====================================================

async function executarPerm(interaction) {
    if (!isContractChannel(interaction)) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: "❌ Você não possui permissão para usar este comando.",
            ephemeral: true
        });
    }

    const user = interaction.options.getUser("usuario");
    const teamName = interaction.options.getString("team");
    const teamRoleId = teamRoleIdByName(teamName);

    const { error } = await supabase
        .from("manager_permissions")
        .upsert({
            manager_id: user.id,
            team_role_id: teamRoleId
        });

    if (error) {
        console.error(error);

        return interaction.reply({
            content: "❌ Não foi possível salvar a permissão.",
            ephemeral: true
        });
    }

    return interaction.reply({
        content:
            `✅ ${user} agora está autorizado a criar contratos usando o Team **${teamName}**.\n\n` +
            `🏆 Team: <@&${teamRoleId}>`,
        ephemeral: true
    });
}

// =====================================================
// /UNPERM
// =====================================================

async function executarUnperm(interaction) {
    if (!isContractChannel(interaction)) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
            content: "❌ Você não possui permissão para usar este comando.",
            ephemeral: true
        });
    }

    const user = interaction.options.getUser("usuario");

    const { error } = await supabase
        .from("manager_permissions")
        .delete()
        .eq("manager_id", user.id);

    if (error) {
        console.error(error);

        return interaction.reply({
            content: "❌ Não foi possível remover a permissão.",
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
    if (!isContractChannel(interaction)) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

    const permission = await getManagerPermission(interaction.user.id);

    if (!permission) {
        return interaction.reply({
            content:
                "❌ Você não possui nenhum Team autorizado para criar contratos.",
            ephemeral: true
        });
    }

    const player = interaction.options.getUser("player");
    const position = interaction.options.getString("posicao");
    const playerFunction = interaction.options.getString("function");

    const teamName = teamNameByRoleId(permission.team_role_id);

    if (!teamName) {
        return interaction.reply({
            content: "❌ O Team autorizado não é mais válido.",
            ephemeral: true
        });
    }

    // Impede contrato para si mesmo
    if (player.id === interaction.user.id) {
        return interaction.reply({
            content: "❌ Você não pode criar um contrato para si mesmo.",
            ephemeral: true
        });
    }

    // Cria o contrato no banco
    const { data, error } = await supabase
        .from("contracts")
        .insert({
            manager_id: interaction.user.id,
            manager_role_id: permission.team_role_id,
            player_id: player.id,
            team_role_id: permission.team_role_id,
            position: position,
            function: playerFunction,
            status: "pending"
        })
        .select()
        .single();

    if (error) {
        console.error("Erro ao criar contrato:", error);

        return interaction.reply({
            content: "❌ Não foi possível criar o contrato.",
            ephemeral: true
        });
    }

    const managerMention = `<@${interaction.user.id}>`;
    const playerMention = `<@${player.id}>`;

    const container = criarContratoCV2({
        teamName,
        manager: managerMention,
        player: playerMention,
        position,
        playerFunction,
        contractId: data.id
    });

    // Envia no canal
    const contractMessage = await interaction.channel.send({
        components: [container],
        flags: 32768
    });

    // Envia DM
    try {
        await player.send({
            components: [
                criarContratoCV2({
                    teamName,
                    manager: managerMention,
                    player: playerMention,
                    position,
                    playerFunction,
                    contractId: data.id
                })
            ],
            flags: 32768
        });
    } catch (error) {
        console.log(
            `Não foi possível enviar DM para ${player.tag}.`
        );
    }

    // Salva a mensagem do contrato
    await supabase
        .from("contracts")
        .update({
            updated_at: new Date().toISOString()
        })
        .eq("id", data.id);

    return interaction.reply({
        content:
            `✅ Contrato enviado para ${player}!\n` +
            `🏆 Team: **${teamName}**\n` +
            `📋 Contrato #${data.id}`,
        ephemeral: true
    });
}

// =====================================================
// /RELEASE
// =====================================================

async function executarRelease(interaction) {
    if (!isContractChannel(interaction)) {
        return interaction.reply({
            content: "❌ Este comando só pode ser usado no canal de Contracts.",
            ephemeral: true
        });
    }

    const player = interaction.options.getUser("player");

    const permission = await getManagerPermission(interaction.user.id);

    if (!permission) {
        return interaction.reply({
            content:
                "❌ Você não possui um Team autorizado para usar o Release.",
            ephemeral: true
        });
    }

    const teamName = teamNameByRoleId(permission.team_role_id);

    const member = await interaction.guild.members.fetch(player.id);

    if (!member.roles.cache.has(permission.team_role_id)) {
        return interaction.reply({
            content:
                `❌ ${player} não possui o cargo <@&${permission.team_role_id}>.`,
            ephemeral: true
        });
    }

    try {
        await member.roles.remove(
            permission.team_role_id,
            `Release realizado por ${interaction.user.tag}`
        );
    } catch (error) {
        console.error(error);

        return interaction.reply({
            content:
                "❌ Não consegui remover o cargo. Verifique se o cargo do bot está acima desse cargo.",
            ephemeral: true
        });
    }

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

async function processarBotaoContrato(interaction) {
    const customId = interaction.customId;

    if (
        !customId.startsWith("contract_accept_") &&
        !customId.startsWith("contract_decline_")
    ) {
        return false;
    }

    const isAccept = customId.startsWith("contract_accept_");

    const contractId = customId.split("_").pop();

    const { data: contract, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();

    if (error || !contract) {
        return interaction.reply({
            content: "❌ Este contrato não existe mais.",
            ephemeral: true
        });
    }

    // Somente o jogador pode responder
    if (interaction.user.id !== contract.player_id) {
        return interaction.reply({
            content:
                "❌ Apenas o jogador que recebeu este contrato pode responder.",
            ephemeral: true
        });
    }

    // Impede responder duas vezes
    if (contract.status !== "pending") {
        return interaction.reply({
            content:
                `❌ Este contrato já foi **${contract.status === "accepted" ? "aceito" : "recusado"}**.`,
            ephemeral: true
        });
    }

    const newStatus = isAccept ? "accepted" : "declined";

    // Atualiza banco
    const { error: updateError } = await supabase
        .from("contracts")
        .update({
            status: newStatus,
            updated_at: new Date().toISOString()
        })
        .eq("id", contractId);

    if (updateError) {
        console.error(updateError);

        return interaction.reply({
            content: "❌ Não foi possível atualizar o contrato.",
            ephemeral: true
        });
    }

    const teamName = teamNameByRoleId(contract.team_role_id);

    // Se aceitou, adiciona o cargo
    if (isAccept) {
        try {
            const member = await interaction.guild.members.fetch(
                contract.player_id
            );

            await member.roles.add(
                contract.team_role_id,
                `Contrato #${contract.id} aceito`
            );
        } catch (error) {
            console.error("Erro ao adicionar cargo:", error);

            return interaction.reply({
                content:
                    "❌ O contrato foi aceito, mas não consegui adicionar o cargo. Verifique a hierarquia de cargos do bot.",
                ephemeral: true
            });
        }
    }

    // Resposta para o jogador
    await interaction.reply({
        content: isAccept
            ? `✅ Você aceitou o contrato com **${teamName}**!`
            : `❌ Você recusou o contrato com **${teamName}**.`,
        ephemeral: true
    });

    // Mensagem de log
    const logChannel = await interaction.client.channels.fetch(
        config.CONTRACT_LOG_CHANNEL_ID
    ).catch(() => null);

    if (logChannel) {
        const logContainer = new ContainerBuilder();

        logContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                isAccept
                    ? "# ✅ CONTRATO ACEITO"
                    : "# ❌ CONTRATO RECUSADO"
            )
        );

        logContainer.addSeparatorComponents(
            new SeparatorBuilder()
        );

        logContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
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
            new TextDisplayBuilder().setContent(
                "-# UTL - CONTRACT SYSTEM"
            )
        );

        await logChannel.send({
            components: [logContainer],
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