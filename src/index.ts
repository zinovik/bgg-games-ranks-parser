import * as functions from '@google-cloud/functions-framework';
import { getGamesData } from './get-games-data';

const DEFAULT_GAMES_AMOUNT = 100;

functions.http('main', async (req, res) => {
    const now = new Date();

    const {
        query: { amount },
    } = req;

    const data = await getGamesData(Number(amount) || DEFAULT_GAMES_AMOUNT);

    const gamesMap = new Map();

    for (const game of data.games) {
        if (!gamesMap.has(game.id)) {
            gamesMap.set(game.id, []);
        }

        gamesMap.get(game.id).push(game);
    }

    const duplicates = Array.from(gamesMap.values()).filter(
        (games) => games.length > 1
    );

    if (duplicates.length > 0) {
        throw new Error(
            `Found ${duplicates.length} duplicate games: ${JSON.stringify(
                duplicates
            )}`
        );
    }

    console.log(
        `request | amount: ${amount} | time: ${new Date().getTime() - now.getTime()}ms`
    );

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
});
