const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    PermissionFlagsBits,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder
} = require("discord.js");

const config = require("./config");

// IDs do Select Menu
const OWNAR = "cbda69e8d47d4bfacd52cc61947715da";
const PARCERIA = "fe8064d9c3434287d0595be8a7375819";
const DENUNCIA = "b270250acb7e4d07fcf7da4f4bff0024";
const OUTROS = "0bbd775bc3454cb48519ba583feef317";

// Cria o canal do ticket
async function criarTicket(interaction, tipo, informacoes = []) {

    const guild = interaction.guild;
    const user = interaction.user;

    const nomeCanal = `${tipo}-${user.username}`
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "")
        .slice(0, 90);

    const canal = await guild.channels.create({
        name: nomeCanal,
        type: ChannelType.GuildText,
        parent: config.TICKET_CATEGORY_ID,

        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            },
            {
                id: config.STAFF_ROLE_ID,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            }
        ]
    });

    const textoInformacoes = informacoes.length
        ? informacoes.join("\n\n")
        : "Nenhuma informação adicional foi fornecida.";

    const infoContainer = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent("## 🎫 INFORMAÇÕES DO TICKET")
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(textoInformacoes)
        );

    const fecharContainer = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent("## 🔒 ENCERRAMENTO DO TICKET")
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent("Gostaria de fechar o ticket?")
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("fechar_ticket")
                    .setLabel("Fechar Ticket")
                    .setEmoji("🔒")
                    .setStyle(ButtonStyle.Danger)
            )
        );

    await canal.send({
        content: `${user} <@&${config.STAFF_ROLE_ID}>`,
        components: [
            infoContainer,
            fecharContainer
        ],
        flags: 1 << 15
    });

    return canal;
}

// Select Menu
function criarMenuTickets() {

    const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_menu")
        .setPlaceholder("Selecione uma opção")
        .addOptions(
            {
                label: "Ownar",
                value: OWNAR,
                emoji: "👑"
            },
            {
                label: "Parceria",
                value: PARCERIA,
                emoji: "🤝"
            },
            {
                label: "Denúncia",
                value: DENUNCIA,
                emoji: "🚨"
            },
            {
                label: "Outros",
                value: OUTROS,
                emoji: "❔"
            }
        );

    return new ActionRowBuilder().addComponents(menu);
}

// Modal de Ownar
function modalOwnar() {

    return new ModalBuilder()
        .setCustomId("modal_ownar")
        .setTitle("👑 Solicitação de Ownar")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("time")
                    .setLabel("Qual time ou seleção deseja ownar?")
                    .setPlaceholder("Digite o nome do time ou seleção")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("squadsheet")
                    .setLabel("Squadsheet")
                    .setPlaceholder("Informe a Squadsheet")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );
}

// Modal de Parceria
function modalParceria() {

    return new ModalBuilder()
        .setCustomId("modal_parceria")
        .setTitle("🤝 Proposta de Parceria")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("parceria")
                    .setLabel("Texto da sua parceria")
                    .setPlaceholder("Descreva sua proposta de parceria")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );
}

// Modal de Denúncia
function modalDenuncia() {

    return new ModalBuilder()
        .setCustomId("modal_denuncia")
        .setTitle("🚨 Denúncia")
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("id_pessoa")
                    .setLabel("ID da pessoa que deseja denunciar")
                    .setPlaceholder("Digite o ID do usuário")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId("prova")
                    .setLabel("Prova")
                    .setPlaceholder("Informe a prova ou link da prova")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            )
        );
}

module.exports = {
    criarTicket,
    criarMenuTickets,
    modalOwnar,
    modalParceria,
    modalDenuncia,
    OWNAR,
    PARCERIA,
    DENUNCIA,
    OUTROS
};
