const {
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags
} = require("discord.js");

// ======================================================
// CONFIGURAÇÃO
// ======================================================

const RULES_CHANNEL_ID =
    "1552633537939898469";

// ======================================================
// COMANDO /RULES
// ======================================================

const rulesCommand =
    new SlashCommandBuilder()
        .setName("rules")
        .setDescription(
            "Envia as regras da VTL no canal de regras."
        );

// ======================================================
// FUNÇÃO PARA CRIAR CONTAINER
// ======================================================

function criarContainer(conteudo) {

    const container =
        new ContainerBuilder();

    container.addTextDisplayComponents(
        new TextDisplayBuilder()
            .setContent(conteudo)
    );

    return container;
}

// ======================================================
// EXECUTAR /RULES
// ======================================================

async function executarRules(interaction) {

    // ==================================================
    // VERIFICAR CANAL
    // ==================================================

    if (
        interaction.channelId !==
        RULES_CHANNEL_ID
    ) {

        return interaction.reply({

            content:
                `❌ Este comando só pode ser usado em <#${RULES_CHANNEL_ID}>.`,

            flags:
                MessageFlags.Ephemeral

        });

    }

    // ==================================================
    // MENSAGEM 1
    // ==================================================

    const container1 =
        new ContainerBuilder();

    container1.addTextDisplayComponents(

        new TextDisplayBuilder()
            .setContent(
`# ⚽️ REGRAS NO JOGO

As regras abaixo são adaptadas e específicas para as partidas da **VIRTUAL TCS LEAGUE (VTL)**. As regras poderão ser atualizadas pela organização conforme necessário.`
            )

    );

    container1.addSeparatorComponents(
        new SeparatorBuilder()
    );

    container1.addTextDisplayComponents(

        new TextDisplayBuilder()
            .setContent(
` \`\`\`
1. | Pausas

Cada equipe terá direito a 3 pedidos de pausa, com duração máxima de 2 minutos cada.

As pausas somente poderão ser solicitadas quando a bola estiver fora de jogo.

Não será permitido solicitar pausa durante tiros de meta ou escanteios favoráveis à equipe adversária.

Cada equipe poderá realizar até 5 substituições, sendo elas realizadas durante as pausas permitidas ou no intervalo.

Será permitido utilizar apenas uma pausa a cada 15 minutos de jogo. É proibido utilizar duas pausas consecutivas para obter tempo adicional.

Cada pausa terá duração máxima de 120 segundos (2 minutos).
\`\`\`

\`\`\`
2. | Last Attack & Counter-Attack

Quando o cronômetro indicar o término de uma etapa da partida, o árbitro deverá sinalizar o Last Attack (LA) no chat.

O Counter-Attack (CA) poderá ser concedido quando, após o Last Attack, uma equipe recuperar a posse de bola e iniciar uma transição ofensiva clara.

Para que o contra-ataque seja considerado, deverá existir:

Clara intenção ofensiva;
Posse de bola;
Possibilidade real de progressão;
Superioridade ou vantagem ofensiva.

Caso a equipe perca a posse ou a oportunidade de ataque seja encerrada, o árbitro poderá finalizar a etapa.
\`\`\`

\`\`\`
3. | Vantagem

A vantagem deverá ser aplicada quando a equipe que sofreu uma infração conseguir manter uma situação favorável após a falta.

A arbitragem deverá avaliar se a continuidade da jogada realmente beneficia a equipe prejudicada.

Caso a equipe perca a posse imediatamente após a vantagem, o árbitro poderá interromper a partida e marcar a infração no local original.

A vantagem não deverá ser utilizada quando a continuidade da jogada proporcionar uma desvantagem maior à equipe que sofreu a falta.
\`\`\`

\`\`\`
4. | Desvios

4.1 – Desvio por Decline

Será considerado desvio por Decline quando houver alteração significativa na trajetória da bola, seja em sua velocidade, altura ou direção.

O árbitro deverá considerar principalmente a trajetória que a bola teria seguido antes da interferência.

4.2 – Desvio por Humanoid

Qualquer contato da bola com o corpo do jogador poderá ser considerado um desvio por Humanoid, independentemente da parte do corpo atingida.

A decisão deverá considerar se o contato realmente alterou a trajetória da bola.
\`\`\`

\`\`\`
5. | Bundles

Não será permitido utilizar Bundles que alterem de maneira significativa a percepção visual ou a jogabilidade durante a partida.

Exemplos incluem avatares com partes do corpo removidas ou alterações que dificultem a identificação do jogador.

Caso um Bundle seja considerado prejudicial à partida, o árbitro poderá solicitar sua alteração antes ou durante o jogo.

O descumprimento da solicitação poderá resultar em punição.
\`\`\`

\`\`\`
6. | W.O / Auto-Win

6.1 – W.O antes da partida

Cada equipe terá um período de tolerância após o horário marcado para alcançar o número mínimo de jogadores exigido.

Caso a equipe não consiga atingir o número mínimo dentro do período estabelecido, poderá ser concedido Auto-Win à equipe adversária.

Caso nenhuma das equipes alcance o número mínimo de jogadores dentro do prazo, a partida poderá ser declarada como Postponed.

6.2 – W.O durante a partida

Caso uma equipe fique em desvantagem numérica durante a partida, será concedido um período para que um jogador seja reposto.

Caso a equipe não consiga regularizar a quantidade de jogadores dentro do prazo, o árbitro poderá declarar W.O a favor da equipe adversária.

6.3 – W.O por expulsão

Caso uma equipe fique abaixo do número mínimo de jogadores permitido devido a expulsões, a partida poderá ser encerrada e o Auto-Win concedido à equipe adversária.
\`\`\`

\`\`\`
7. | Quantidade de Jogadores

Cada partida será disputada por duas equipes.

A quantidade padrão será de 7 jogadores por equipe, sendo um deles obrigatoriamente o goleiro.

Cada equipe deverá possuir o número mínimo de jogadores exigido para iniciar a partida.

Caso uma equipe não alcance o mínimo estabelecido, poderá ser concedido W.O à equipe adversária.

Durante a partida, caso uma equipe fique abaixo do número mínimo permitido, também poderá ser aplicada a regra de W.O.
\`\`\``
            )

    );

    // ==================================================
    // MENSAGEM 2
    // ==================================================

    const container2 =
        criarContainer(
` \`\`\`
8. | Cartão Amarelo (YC)

O Cartão Amarelo (YC) será aplicado em infrações de menor gravidade ou em comportamentos antidesportivos.

Entre as situações que poderão resultar em YC estão:

Comportamento antidesportivo;
Atrasar propositalmente a partida;
Protestos excessivos contra a arbitragem;
Não respeitar a distância exigida em cobranças;
Interferir propositalmente na retomada do jogo;
Utilizar comportamento inadequado durante a partida;
Ficar sem o kit exigido para a partida.

O acúmulo de 2 cartões amarelos na mesma partida poderá resultar em expulsão.
\`\`\`

\`\`\`
9. | Lag

O lag poderá ser considerado quando interferir diretamente no desenvolvimento de uma jogada.

Entre as situações analisáveis estão:

Chute com lag: quando o chute apresentar atraso significativo durante sua trajetória e interferir na ação dos jogadores.

Passe com lag: quando um passe apresentar atraso significativo e afetar diretamente a defesa.

Congelamento da bola: quando a bola permanecer congelada ou apresentar atraso considerado anormal.

O árbitro deverá analisar a situação antes de interromper ou alterar o resultado da jogada.
\`\`\`

\`\`\`
10. | Crowd

Crowd ocorre quando 3 ou mais jogadores participam diretamente da disputa pela bola contra um único jogador adversário.

Exemplo:

3v1 = Crowd

Situações em que três jogadores pressionem diretamente um único adversário poderão ser consideradas Crowd.

Quando identificado o Crowd, o árbitro deverá interromper ou punir a situação conforme o contexto da jogada.

A regra tem como objetivo evitar a concentração excessiva de jogadores sobre um único adversário.
\`\`\`

\`\`\`
11. | Mercy Rule

Caso uma equipe alcance uma vantagem de 8 gols, a partida deverá ser encerrada imediatamente.

Exemplo:

8–0, 9–1, 10–2, etc.

Não será permitido marcar gols propositalmente apenas para atingir ou aumentar a diferença necessária para provocar o encerramento da partida.

Caso seja identificada tentativa de manipulação do resultado para ativar a Mercy Rule, a organização poderá aplicar punições.
\`\`\`

\`\`\`
12. | Handball

Será considerado Handball quando a bola entrar em contato de maneira irregular com a mão ou braço de um jogador e o contato proporcionar vantagem à equipe.

A decisão deverá levar em consideração:

Local do contato;
Intenção da jogada;
Alteração da trajetória da bola;
Vantagem obtida;
Posição do jogador.

O árbitro poderá deixar a jogada seguir caso o contato não tenha influência relevante sobre a jogada.
\`\`\`

\`\`\`
13. | Penalty Kicks

A bola deverá estar parada e corretamente posicionada para a cobrança.

Caso a bola esteja em movimento no momento da cobrança, o árbitro poderá determinar a repetição.

O goleiro deverá permanecer sobre ou próximo à linha de gol até o momento permitido para realizar a defesa.

Caso o goleiro deixe a linha de maneira irregular e defenda a cobrança, poderá ser determinado retake.

Não será permitido realizar uma parada completamente antecipada antes da execução do chute.

Caso o jogador responsável pela cobrança entre na área antes do momento permitido, poderá ser determinado retake.

Caso a bola toque ou permaneça irregularmente posicionada, a cobrança poderá ser anulada e repetida.

13.1 – Duplo Castigo

Quando um jogador cometer uma infração dentro da própria área que resulte em pênalti, a punição deverá considerar a vantagem já concedida à equipe adversária.

Em situações em que a infração não justifique uma expulsão, a arbitragem poderá aplicar apenas Cartão Amarelo, evitando uma punição excessiva pelo mesmo lance.
\`\`\`

\`\`\`
14. | Space

O Space representa a distância mínima que os jogadores adversários deverão respeitar em determinadas cobranças.

O árbitro deverá determinar a distância adequada de acordo com a situação da partida.

O Space será aplicado principalmente em:

Faltas;
Laterais;
Tiros de meta;
Outras retomadas de jogo quando determinado pela arbitragem.

Em tiros de meta, os jogadores adversários deverão permanecer fora da área até que a bola esteja em jogo.

Caso um jogador invada o espaço determinado e interfira diretamente na cobrança, o árbitro poderá determinar retake ou aplicar a punição correspondente.
\`\`\`

\`\`\`
15. | Faltas

Será considerada falta qualquer ação irregular que prejudique diretamente um adversário ou proporcione vantagem indevida.

As faltas poderão resultar em:

Tiro livre;
Pênalti;
Cartão amarelo;
Cartão vermelho;
Retake;
Outras medidas determinadas pela arbitragem.

A punição dependerá da gravidade da infração e do impacto causado na jogada.
\`\`\`
`
        );

    // ==================================================
    // MENSAGEM 3
    // ==================================================

    const container3 =
        criarContainer(
` \`\`\`
16. | Troca / Desrespeito

Qualquer jogador que provocar, insultar ou desrespeitar deliberadamente um adversário poderá ser punido.

Também será considerada infração a tentativa de provocar o adversário para causar uma reação ou interromper o andamento da partida.

A punição poderá variar entre YC, RC ou outras medidas disciplinares, dependendo da gravidade e reincidência.
\`\`\`

\`\`\`
17. | Atraso de Jogo

É proibido atrasar propositalmente o andamento da partida.

Exemplos:

Segurar a bola sem necessidade;
Evitar deliberadamente uma retomada;
Demorar propositalmente para realizar cobranças;
Utilizar pausas de maneira irregular;
Provocar interrupções desnecessárias.

O árbitro poderá advertir o jogador e, em caso de reincidência, aplicar Cartão Amarelo.
\`\`\`

\`\`\`
18. | Conduta com a Arbitragem

Os jogadores deverão respeitar as decisões da arbitragem.

Questionamentos deverão ser feitos de maneira adequada e sem interromper constantemente a partida.

Insultos, ameaças, provocações ou reclamações excessivas poderão resultar em punição.

A arbitragem terá autoridade para controlar o andamento da partida e aplicar as regras previstas neste Rulebook.
\`\`\`

\`\`\`
19. | Exploits / Bugs

É proibido utilizar qualquer exploit, bug, glitch ou recurso externo que proporcione vantagem sobre os demais jogadores.

Caso exista suspeita de utilização de exploit, o jogador poderá ser encaminhado para análise da organização.

Se a utilização for confirmada, poderão ser aplicadas punições disciplinares.

Caso o uso de exploit tenha interferido diretamente em uma partida, a organização poderá analisar o resultado e tomar as medidas necessárias.
\`\`\`

\`\`\`
20. | Kits e Aparência

Todos os jogadores deverão utilizar o kit e aparência permitidos pela competição.

Não será permitido utilizar alterações visuais que prejudiquem a identificação do jogador ou proporcionem vantagem durante a partida.

Caso o árbitro determine que determinado item ou alteração deve ser removido, o jogador deverá realizar a alteração antes de continuar.
\`\`\`

\`\`\`
21. | Comportamento Antidesportivo

Qualquer comportamento realizado com a intenção de prejudicar deliberadamente a partida poderá ser considerado antidesportivo.

Isso inclui:

Provocações excessivas;
Exploração proposital de regras;
Atrasos intencionais;
Manipulação de jogadas;
Desrespeito aos adversários;
Desrespeito à arbitragem;
Tentativas de obter vantagem de maneira irregular.

A punição será determinada de acordo com a gravidade da situação.
\`\`\`

\`\`\`
22. | Regra Geral da Arbitragem

O árbitro deverá analisar cada lance considerando o contexto completo da jogada.

Em situações não previstas especificamente neste Rulebook, a arbitragem poderá tomar uma decisão com base no fair play, equilíbrio da partida e espírito competitivo.

As decisões deverão ser justificadas quando necessário.

A organização poderá revisar decisões posteriormente caso sejam apresentadas provas suficientes.
\`\`\`

## 📌 | DISPOSIÇÕES FINAIS

O desconhecimento das regras não isenta nenhum jogador ou equipe de suas responsabilidades.

As regras poderão ser atualizadas pela administração da ULTIMATE TCS LEAGUE sempre que necessário.

Todos os jogadores, managers e equipes são responsáveis por conhecer e respeitar este Rulebook antes do início de suas partidas.

> 🔔 Ao participar de uma partida da VTL, você declara estar ciente e de acordo com estas regras.

-# VTL • VIRTUAL TCS LEAGUE`
        );

    // ==================================================
    // ENVIAR AS 3 PARTES
    // ==================================================

    try {

        await interaction.channel.send({

            components: [
                container1
            ],

            flags:
                MessageFlags.IsComponentsV2

        });

        await interaction.channel.send({

            components: [
                container2
            ],

            flags:
                MessageFlags.IsComponentsV2

        });

        await interaction.channel.send({

            components: [
                container3
            ],

            flags:
                MessageFlags.IsComponentsV2

        });

        return interaction.reply({

            content:
                "✅ Regras no jogo enviadas com sucesso.",

            flags:
                MessageFlags.Ephemeral

        });

    } catch (error) {

        console.error(
            "❌ Erro ao enviar as regras:",
            error
        );

        return interaction.reply({

            content:
                "❌ Não foi possível enviar as regras.",

            flags:
                MessageFlags.Ephemeral

        });

    }
}

// ======================================================
// EXPORTS
// ======================================================

rulesCommand.execute =
    executarRules;

module.exports = {
    rulesCommand
};