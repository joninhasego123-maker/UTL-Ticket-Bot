const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder
} = require("discord.js");

const FREEAGENCY_CHANNEL_ID = "1543589764790354010";

const freeagencyCommand =
    new SlashCommandBuilder()
        .setName("freeagency")
        .setDescription("Envia seu jogador para a lista de Free Agents.");

function modalFreeagency() {

    const modal =
        new ModalBuilder()
            .setCustomId("modal_freeagency")
            .setTitle("⚽ Free Agency");

    const posicao =
        new TextInputBuilder()
            .setCustomId("posicao")
            .setLabel("Posição")
            .setPlaceholder("Ex: Atacante, Meia, Zagueiro...")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

    const experiencia =
        new TextInputBuilder()
            .setCustomId("experiencia")
            .setLabel("Experiência")
            .setPlaceholder("Ex: 2 anos, 6 meses...")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

    const plataforma =
        new TextInputBuilder()
            .setCustomId("plataforma")
            .setLabel("Plataforma")
            .setPlaceholder("Ex: PC, Mobile, Xbox...")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

    const extra =
        new TextInputBuilder()
            .setCustomId("extra")
            .setLabel("Extra (opcional)")
            .setPlaceholder("Alguma informação adicional...")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(posicao),
        new ActionRowBuilder().addComponents(experiencia),
        new ActionRowBuilder().addComponents(plataforma),
        new ActionRowBuilder().addComponents(extra)
    );

    return modal;
}

async function executarFreeagency(interaction) {

    await interaction.showModal(
        modalFreeagency()
    );
}

async function processarFreeagency(interaction) {

    const posicao =
        interaction.fields.getTextInputValue("posicao");

    const experiencia =
        interaction.fields.getTextInputValue("experiencia");

    const plataforma =
        interaction.fields.getTextInputValue("plataforma");

    const extra =
        interaction.fields.getTextInputValue("extra").trim();

    const jogador =
        interaction.user;

    let conteudo =
        `## 🆓 FREE AGENCY\n\n` +

        `**Jogador:** ${jogador}\n` +

        `**Id:** ${jogador.id}\n\n` +

        `**Posição:** ${posicao}\n` +

        `**Experiência:** ${experiencia}\n` +

        `**Plataforma:** ${plataforma}`;

    if (extra) {
        conteudo +=
            `\n\n**Extra:** ${extra}`;
    }

    conteudo +=
        `\n\n`;

    const container =
        new ContainerBuilder()

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(conteudo)
            )

            .addSeparatorComponents(
                new SeparatorBuilder()
            )

            .addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        "-# UTL - FREE AGENTS"
                    )
            );

    const channel =
        await interaction.client.channels.fetch(
            FREEAGENCY_CHANNEL_ID
        );

    await channel.send({
        components: [
            container
        ],
        flags: 32768
    });

    await interaction.reply({
        content:
            `✅ Seu perfil foi enviado para os Free Agents em ${channel}.`,
        ephemeral: true
    });
}

module.exports = {
    freeagencyCommand,
    executarFreeagency,
    processarFreeagency
};