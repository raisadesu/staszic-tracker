import { AssignmentType, PrismaClient } from "@prisma/client";
import { ChatInputCommandInteraction, Client, CommandInteraction, PermissionFlagsBits, SlashCommandBuilder, TextInputBuilder, ModalBuilder, TextInputStyle, ModalActionRowComponentBuilder, ActionRowBuilder } from "discord.js";
import logger from "../../logger";
import Command from "../../types/command";

const data = new SlashCommandBuilder()
    .setName('usunwydarzenie')
    .setDescription('Usuń wydarzenie z bazy danych')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(
        o => o.setName('id')
            .setDescription('ID Wydarzenia')
            .setRequired(true))

const run = async (client: Client, interaction: ChatInputCommandInteraction) => {
    const prisma = new PrismaClient()

    const id = interaction.options.getString('id')

    if (!id) return interaction.reply('Brak podanego ID!')
    
    try {
        const deleted = await prisma.assignment.delete({
            where: {
                id
            }
        })
        if (!deleted) return interaction.reply('Nie znaleziono wydarzenia o podanym ID!')

        return interaction.reply(`Usunieto wydarzenie ${deleted.name} \n(id: ${deleted.id})`)
    } catch (err) {
        return interaction.reply('Nie znaleziono wydarzenia o podanym ID!')
    }
}

export { data, run }