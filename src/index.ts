import * as functions from '@google-cloud/functions-framework';
import { getGamesData } from './get-games-data';

const DEFAULT_GAMES_AMOUNT = 100;

functions.http('main', async (req, res) => {
    const {
        query: { amount },
    } = req;

    console.log(`Request | amount: '${amount}'`);

    try {
        const games = await getGamesData(
            Number(amount) || DEFAULT_GAMES_AMOUNT
        );

        res.setHeader('Access-Control-Allow-Origin', '*');

        console.log('The games were returned');

        res.status(200).json(games);
    } catch (error) {
        console.error('Unexpected error occurred: ', error.message);
    }
});
