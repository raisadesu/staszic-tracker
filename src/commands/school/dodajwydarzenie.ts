import { AssignmentType, PrismaClient } from "@prisma/client";
import { ChatInputCommandInteraction, Client, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, ModalActionRowComponentBuilder, ActionRowBuilder } from "discord.js";
import { getAssignmentType } from "../../lib/assignments";
import logger from "../../logger";
import Command from "../../types/command";

const data = new SlashCommandBuilder()
    .setName('dodajwydarzenie')
    .setDescription('Dodaj wydarzenie do bazy danych')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(
        o => o.setName('typ')
            .setDescription('Typ wydarzenia')
            .setRequired(true)
            .addChoices(
                { name: 'Sprawdzian', value: 'sprawdzian' },
                { name: 'Praca Domowa', value: 'praca domowa' },
                { name: 'Kartkówka', value: 'kartkowka' },
                { name: 'Wypracowanie', value: 'wypracowanie' },
                { name: 'Prezentacja', value: 'prezentacja' },
                { name: 'Odpowiedź Ustna', value: 'odpowiedź ustna' }
            ))
    .addStringOption(
        o => o.setName('data')
            .setDescription('Data wydarzenia')
            .setRequired(true))

const run = async (client: Client, interaction: ChatInputCommandInteraction) => {
    const prisma = new PrismaClient()

    const typ = interaction.options.getString('typ')
    const data = interaction.options.getString('data')
    
    //interaction.deferReply()

    if (!typ || !data) {
        return interaction.reply('Nie podano wszystkich danych!')
    }

    const actualDate = new Date(Date.parse(data))

    const modal = new ModalBuilder()
        .setCustomId('eventadd')
        .setTitle('Dodaj wydarzenie')

    const name = new TextInputBuilder()
        .setCustomId('event-name')
        .setLabel('Nazwa wydarzenia')
        .setStyle(TextInputStyle.Short)

    const content = new TextInputBuilder()
        .setCustomId('event-description')
        .setLabel('Opis wydarzenia')
        .setStyle(TextInputStyle.Paragraph)
    
    const actionRowOne = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(name)
    const actionRowTwo = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(content)

    modal.addComponents(actionRowOne, actionRowTwo)

    logger.info('Showing modal')
    await interaction.showModal(modal)
    const modalInteraction = await interaction.awaitModalSubmit({
        filter: (i) => {
            return true
        },
        time: 240000
    })

    const nameValue = modalInteraction.fields.getTextInputValue('event-name')
    const contentValue = modalInteraction.fields.getTextInputValue('event-description')

    if (!nameValue || !contentValue) {
        return interaction.followUp('Nie podano wszystkich danych!')
    }
    
    let actualType: AssignmentType = getAssignmentType(typ)

    const event = await prisma.assignment.create({
        data: {
            name: nameValue,
            description: contentValue,
            date: actualDate,
            type: actualType
        }
    })

    return interaction.followUp(`Dodano wydarzenie: ${event.name} ${event.id}`)
}

export { data, run }