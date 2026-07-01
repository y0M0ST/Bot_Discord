import Logger from '../utils/logger.js';
import { Events } from 'discord.js';

export default {
    name: Events.GuildCreate,
    execute(guild) {
        Logger.activity("JOIN", guild);
    },
};
