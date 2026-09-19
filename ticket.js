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
    SeparatorBuilder,
    SectionBuilder,
    ThumbnailBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder
} = require("discord.js");

const config = require("./config");

const OWNAR = "cbda69e8d47d4bfacd52cc61947715da";
const PARCERIA = "fe8064d9c3434287d0595be8a7375819";
const DENUNCIA = "b270250acb7e4d07fcf7da4f4bff0024";
const OUTROS = "0bbd775bc3454cb48519ba583feef317";


// ===============================
// MENU
// ===============================

function criarMenuTickets() {

    return new ActionRowBuilder().addComponents(

        new StringSelectMenuBuilder()
            .setCustomId("ticket_menu")
            .setPlaceholder("Selecione uma opção...")

            .addOptions(
                {
                    label: "Ownar",
                    description: "Para ownar um time ou seleção",
                    value: OWNAR,
                    emoji: "👑"
                },

                {
                    label: "Parceria",
                    description: "Para propostas de parceria",
                    value: PARCERIA,
                    emoji: "🤝"
                },

                {
                    label: "Denúncia",
                    description: "Para realizar uma denúncia",
                    value: DENUNCIA,
                    emoji: "🚨"
                },

                {
                    label: "Outros",
                    description: "Para outros assuntos",
                    value: OUTROS,
                    emoji: "❔"
                }
            )
    );
}


// ===============================
// PAINEL
// ===============================

function criarPainelTickets() {

    const imagemTopo = new MediaGalleryBuilder()
        .addItems(
            new MediaGalleryItemBuilder()
                .setURL("attachment://ticket_topo.png")
        );


    const titulo = new SectionBuilder()

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent("# 🎫 Sistema de Tickets — UTL")
        )

        .setThumbnailAccessory(
            new ThumbnailBuilder()
                .setURL("attachment://utl_logo.png")
        );


    const container = new ContainerBuilder()

        .addMediaGalleryComponents(imagemTopo)

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addSectionComponents(titulo)

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                "Para facilitar o atendimento e manter tudo organizado, o sistema de Tickets contará com quatro opções:\n\n" +

                "**👑 Ownar — Para Ownar um Time ou Seleção.**\n" +

                "**🤝 Parceria — Para propostas e assuntos relacionados a parcerias.**\n" +

                "**🚨 Denúncia — Para realizar denúncias ou relatar situações que precisam de análise.**\n" +

                "**📩 Outros — Para qualquer assunto que não se encaixe nas opções acima.**"
            )
        )

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addActionRowComponents(
            criarMenuTickets()
        )

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent("-# UTL - TICKET SYSTEM")
        );

    return container;
}


// ===============================
// CRIAR TICKET
// ===============================

async function criarTicket(interaction, tipo, informacoes = "") {

    await interaction.deferReply({
        ephemeral: true
    });

    const guild = interaction.guild;
    const user = interaction.user;

    let nomeTipo = tipo;

    if (tipo === "ownar") nomeTipo = "Ownar";
    if (tipo === "parceria") nomeTipo = "Parceria";
    if (tipo === "denuncia") nomeTipo = "Denúncia";
    if (tipo === "outros") nomeTipo = "Outros";


    const channel = await guild.channels.create({

        name: `${tipo}_${user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, ""),

        type: ChannelType.GuildText,

        parent: config.TICKET_CATEGORY_ID,

        permissionOverwrites: [

            {
                id: guild.roles.everyone.id,

                deny: [
                    PermissionFlagsBits.ViewChannel
                ]
            },

            {
                id: user.id,

                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles
                ]
            },

            {
                id: config.STAFF_ROLE_ID,

                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.AttachFiles
                ]
            }
        ]
    });


    // ===============================
    // INFORMAÇÕES
    // ===============================

    let textoInformacoes = "";

    if (informacoes) {

        // OWNAR
        if (tipo === "ownar") {

            const partes = informacoes.split(
                "\n"
            );

            const time =
                partes[0]
                    ?.replace("**Time/Seleção:** ", "")
                    .trim() || "";

            const squadsheet =
                partes[1]
                    ?.replace("**Squadsheet:** ", "")
                    .trim() || "";

            textoInformacoes =
                `\n**Time/Seleção**\n` +
                "```\n" +
                `${time}\n` +
                "```\n" +

                `**Squadsheet**\n` +
                "```\n" +
                `${squadsheet}\n` +
                "```";
        }

        // PARCERIA
        else if (tipo === "parceria") {

            textoInformacoes =
                `\n**Proposta de parceria**\n` +
                "```\n" +
                `${informacoes}\n` +
                "```";
        }

        // OUTROS
        else if (tipo === "outros") {

            textoInformacoes =
                `\n**Assunto**\n` +
                "```\n" +
                `${informacoes}\n` +
                "```";
        }

        // OUTROS TIPOS
        else {

            textoInformacoes =
                `\n${informacoes}`;
        }
    }


    // ===============================
    // DENÚNCIA
    // ===============================

    if (tipo === "denuncia") {

        textoInformacoes =
            "\n**Envie a imagem da prova neste canal.**\n" +
            "Anexe a imagem diretamente na sua próxima mensagem.";
    }


    // ===============================
    // CONTAINER DE INFORMAÇÕES
    // ===============================

    const infoContainer = new ContainerBuilder()

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    `${user} <@&${config.STAFF_ROLE_ID}>`
                )
        )

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    `## 🎫 INFORMAÇÕES DO TICKET\n\n` +
                    `**Tipo:** ${nomeTipo}\n` +
                    `**Usuário:** ${user}\n` +
                    textoInformacoes
                )
        );


    // ===============================
    // FECHAR TICKET
    // ===============================

    const fecharContainer = new ContainerBuilder()

        .addSeparatorComponents(
            new SeparatorBuilder()
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    "## 🔒 ENCERRAMENTO DO TICKET\n\n" +
                    "Gostaria de fechar o ticket?"
                )
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


    // ===============================
    // ENVIAR TICKET
    // ===============================

    await channel.send({

        components: [
            infoContainer,
            fecharContainer
        ],

        flags: 32768
    });


    // ===============================
    // RESPOSTA
    // ===============================

    await interaction.editReply({
        content: `✅ Ticket criado com sucesso: ${channel}`
    });


    return channel;
}


// ===============================
// MODAL OWNAR
// ===============================

function modalOwnar() {

    const modal = new ModalBuilder()
        .setCustomId("modal_ownar")
        .setTitle("👑 Solicitação de Ownar");


    const time = new TextInputBuilder()
        .setCustomId("time")
        .setLabel("Qual time ou seleção você quer ownar?")
        .setPlaceholder("Informe o nome do time ou seleção")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);


    const squadsheet = new TextInputBuilder()
        .setCustomId("squadsheet")
        .setLabel("Squadsheet")
        .setPlaceholder("Informe a Squadsheet")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(time),

        new ActionRowBuilder()
            .addComponents(squadsheet)

    );


    return modal;
}


// ===============================
// MODAL PARCERIA
// ===============================

function modalParceria() {

    const modal = new ModalBuilder()
        .setCustomId("modal_parceria")
        .setTitle("🤝 Proposta de Parceria");


    const parceria = new TextInputBuilder()
        .setCustomId("parceria")
        .setLabel("Texto da sua parceria")
        .setPlaceholder("Explique sua proposta de parceria")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(parceria)

    );


    return modal;
}


// ===============================
// MODAL OUTROS
// ===============================

function modalOutros() {

    const modal = new ModalBuilder()
        .setCustomId("modal_outros")
        .setTitle("❔ Outros");


    const assunto = new TextInputBuilder()
        .setCustomId("assunto")
        .setLabel("O que você deseja?")
        .setPlaceholder("Informe brevemente o motivo do ticket")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);


    modal.addComponents(

        new ActionRowBuilder()
            .addComponents(assunto)

    );


    return modal;
}


// ===============================
// EXPORTS
// ===============================

module.exports = {

    criarTicket,
    criarMenuTickets,
    criarPainelTickets,

    modalOwnar,
    modalParceria,
    modalOutros,

    OWNAR,
    PARCERIA,
    DENUNCIA,
    OUTROS
};