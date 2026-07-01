import Logger from '../utils/logger.js';
import { Events } from 'discord.js';

export default {
    name: Events.GuildDelete,
    execute(guild) {
        Logger.activity("LEAVE", guild);
    },
};
