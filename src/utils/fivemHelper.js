import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from 'discord.js';

const FIVEM_PLAYERS_URL =
    process.env.FIVEM_PLAYERS_URL || 'http://15.235.235.50:30120/players.json';
const FETCH_TIMEOUT = 5000;

export const FIVEM_PLAYERS_PER_PAGE = 8;
export const FIVEM_LIST_PREFIX = 'fivem_list';

export async function fetchFiveMPlayers() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(FIVEM_PLAYERS_URL, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timeoutId);
    }
}

export function findPlayer(players, query) {
    const q = query.trim();
    const asId = Number(q);

    if (!Number.isNaN(asId) && String(asId) === q) {
        return players.find((p) => p.id === asId);
    }

    const lower = q.toLowerCase();
    return players.find((p) => p.name.toLowerCase().includes(lower));
}

export function parseIdentifiers(player) {
    const discordInfo = player.identifiers?.find((id) => id.startsWith('discord:'));
    const steamInfo = player.identifiers?.find((id) => id.startsWith('steam:'));

    return {
        discordId: discordInfo ? discordInfo.replace('discord:', '') : null,
        steamId: steamInfo ?? null,
    };
}

export function formatPlayerLine(player) {
    const { discordId, steamId } = parseIdentifiers(player);
    const dc = discordId ?? 'Không liên kết';
    const steam = steamId ?? 'Không rõ';

    return `[${player.id}] **${player.name}**\n└ Discord: \`${dc}\` · Steam: \`${steam}\``;
}

export function paginatePlayers(players, page = 1) {
    const total = players.length;
    const totalPages = Math.max(1, Math.ceil(total / FIVEM_PLAYERS_PER_PAGE));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * FIVEM_PLAYERS_PER_PAGE;

    return {
        page: safePage,
        totalPages,
        total,
        slice: players.slice(start, start + FIVEM_PLAYERS_PER_PAGE),
    };
}

export function buildListFiveMButtons(page, totalPages, userId) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`${FIVEM_LIST_PREFIX}:prev:${page}:${userId}`)
            .setLabel('Trước')
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page <= 1),
        new ButtonBuilder()
            .setCustomId(`${FIVEM_LIST_PREFIX}:refresh:${page}:${userId}`)
            .setLabel('Làm mới')
            .setEmoji('🔄')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`${FIVEM_LIST_PREFIX}:next:${page}:${userId}`)
            .setLabel('Sau')
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page >= totalPages)
    );
}

export function buildListFiveMPayload(players, page = 1, userId) {
    const sorted = [...players].sort((a, b) => a.id - b.id);

    if (sorted.length === 0) {
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor(0xff9900)
                    .setTitle('📡 Haven RP — Danh sách online')
                    .setDescription('👻 Server đang trống, chưa có ai online.')
                    .setFooter({ text: 'Haven RP (Singapore)' })
                    .setTimestamp(),
            ],
            components: [],
        };
    }

    const { page: currentPage, totalPages, total, slice } = paginatePlayers(sorted, page);

    const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`📡 Haven RP — ${total} giang hồ online`)
        .setDescription(slice.map(formatPlayerLine).join('\n\n'))
        .setFooter({
            text: `Haven RP (Singapore) · Trang ${currentPage}/${totalPages} · ${FIVEM_PLAYERS_PER_PAGE} người/trang`,
        })
        .setTimestamp();

    const components =
        totalPages > 1 ? [buildListFiveMButtons(currentPage, totalPages, userId)] : [];

    return { embeds: [embed], components, page: currentPage, totalPages };
}

export async function getPlayerCount() {
    const players = await fetchFiveMPlayers();
    return players.length;
}
