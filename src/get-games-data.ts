import { getGamesByPages, GAMES_PER_PAGE } from './get-games-by-pages';
import { parsePage, Game } from './parse-page';

interface BGGGamesRanksData {
    date: string;
    games: Game[];
}

export const getGamesData = async (
    amount: number
): Promise<BGGGamesRanksData> => {
    const pagesAmount: number = Math.ceil(amount / GAMES_PER_PAGE);

    const gamesByPages: Game[][] = await getGamesByPages(
        [...Array(pagesAmount).keys()].map((i) => i + 1)
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
