import { getPage, GAMES_PER_PAGE } from './get-page';
import { parsePage, Game } from './parse-page';

interface BGGGamesRanksData {
    date: string;
    games: Game[];
}

export const getGamesData = async (
    amount: number
): Promise<BGGGamesRanksData> => {
    const pagesAmount: number = Math.ceil(amount / GAMES_PER_PAGE);

    const gamesByPages: Game[][] = await Promise.all(
        [...Array(pagesAmount).keys()].map(async (i) => {
            const page = await getPage(i + 1);
            return parsePage(page);
        })
    );

    const games: Game[] = gamesByPages.reduce(
        (acc, pageGames) => [...acc, ...pageGames],
        []
    );

    return {
        games: games.slice(0, amount),
        date: new Date().toISOString(),
    };
};
