import * as functions from '@google-cloud/functions-framework';
import { getGamesData } from './get-games-data';

const DEFAULT_GAMES_AMOUNT = 100;

functions.http('main', async (req, res) => {
    console.log('Triggered!');

    const {
        query: { amount },
    } = req;

    console.log(`Request | amount: '${amount}'`);

    const data = await getGamesData(Number(amount) || DEFAULT_GAMES_AMOUNT);

    data.games.forEach((game) => {
        const gameCopies = data.games.filter((g) => g.id === game.id);
        if (gameCopies.length > 1) {
            console.error(gameCopies, 'Game duplicates!');
        }
    });

    console.log('Done!');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
});
