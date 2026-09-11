import { XMLParser } from 'fast-xml-parser';
import { getGamesDataFromCsv } from './get-games-from-csv';
import { Game } from './parse-page';

interface BGGGamesRanksData {
    date: string;
    games: Game[];
}

interface BGGRank {
    type: string;
    id: string;
    name: string;
    friendlyname: string;
    value: string; // numeric string, or "Not Ranked" when the game isn't ranked in this category
    bayesaverage?: string;
}

interface BGGItem {
    id: string;
    type: string;
    statistics?: {
        ratings?: {
            ranks?: {
                rank?: BGGRank | BGGRank[];
            };
        };
    };
}

interface BGGThingResponse {
    items?: {
        item?: BGGItem | BGGItem[];
    };
}

const BGG_API_URL = 'https://boardgamegeek.com/xmlapi2/thing';
// The /thing endpoint caps requests at 20 ids - see "Thing Items" on
// https://boardgamegeek.com/wiki/page/BGG_XML_API2
const BGG_MAX_IDS_PER_REQUEST = 20;
// BGG's docs ask for ~5s between requests; going faster gets you 500/503s
const BGG_REQUEST_DELAY_MS = 5000;

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
});

/** fast-xml-parser collapses a single repeated child element into an object
 *  instead of a one-item array, so every repeatable node needs this. */
const toArray = <T>(value: T | T[] | undefined | null): T[] => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
    url: string,
    retriesLeft = 2,
    backoffMs = BGG_REQUEST_DELAY_MS
): Promise<Response> => {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${process.env.BGG_TOKEN}`,
        },
    });

    // BGG returns 500/503 when you're sending requests too frequently
    if (
        (response.status === 500 || response.status === 503) &&
        retriesLeft > 0
    ) {
        await sleep(backoffMs);
        return fetchWithRetry(url, retriesLeft - 1, backoffMs * 2);
    }

    return response;
};

const fetchBggItems = async (ids: string[]): Promise<BGGItem[]> => {
    const url = new URL(BGG_API_URL);
    url.searchParams.set('id', ids.join(','));
    url.searchParams.set('stats', '1');

    const response = await fetchWithRetry(url.toString());

    if (!response.ok) {
        throw new Error(`Failed to fetch BGG data: ${response.status}`);
    }

    const xml = await response.text();
    const data = xmlParser.parse(xml) as BGGThingResponse;

    return toArray(data.items?.item);
};

const chunk = <T>(items: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
};

export const getGamesData = async (
    amount: number
): Promise<BGGGamesRanksData> => {
    const extraAmount = Math.min(Math.max(amount, 50), 500);
    const localGames = await getGamesDataFromCsv(amount + extraAmount);

    // BGG caps /thing requests at 20 ids, so large `amount` values have to be batched
    const idChunks = chunk(
        localGames.map((game) => String(game.id)),
        BGG_MAX_IDS_PER_REQUEST
    );

    const bggGames: BGGItem[] = [];
    for (const [index, ids] of idChunks.entries()) {
        if (index > 0) {
            await sleep(BGG_REQUEST_DELAY_MS); // stay under BGG's rate limit between batches
        }
        console.log(
            `Fetching BGG data for ${ids.length} games (batch ${index + 1} of ${idChunks.length})...`
        );
        bggGames.push(...(await fetchBggItems(ids)));
    }

    const games = localGames
        .map((localGame) => {
            // ids come back from XML as strings regardless of what type localGame.id is
            const bggGame = bggGames.find(
                (item) => String(item.id) === String(localGame.id)
            );

            if (!bggGame) {
                console.warn(`No BGG data found for game id ${localGame.id}`);
                return null;
            }

            const ranks = toArray(bggGame.statistics?.ratings?.ranks?.rank);
            const boardGameRank = ranks.find(
                (rank) => rank.type === 'subtype' && rank.name === 'boardgame'
            );

            const rank = Number(boardGameRank?.value);

            // value is the string "Not Ranked" for unranked games, and Number()
            // turns that (and anything else unexpected) into NaN
            if (!Number.isFinite(rank)) {
                return null;
            }

            return { ...localGame, rank };
        })
        .filter(
            (game): game is Game & { rank: number } =>
                game !== null && game.rank <= amount
        );

    return {
        games,
        date: new Date().toISOString(),
    };
};
