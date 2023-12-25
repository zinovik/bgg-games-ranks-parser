import * as functions from '@google-cloud/functions-framework';
import { getGamesData } from './get-games-data';

const DEFAULT_GAMES_AMOUNT = 100;

functions.http('main', async (req, res) => {
    console.log('Triggered!');

    const {
        query: { amount },
    } = req;

    console.log(`Request | amount: '${amount}'`);

    const games = await getGamesData(Number(amount) || DEFAULT_GAMES_AMOUNT);

    res.setHeader('Access-Control-Allow-Origin', '*');

    console.log('Done!');

    res.status(200).json(games);
});
