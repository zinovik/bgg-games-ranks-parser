import { parse } from 'csv-parse/sync';
import { Game } from './parse-page';

const BOARDGAMES_RANKS_CSV_URL =
    'https://storage.googleapis.com/boardgamegeek-bg-ranks-data-dump/boardgames_ranks.csv';

interface BoardGameRank {
    id: number;
    name: string;
    yearpublished: number;
    rank: number;
    bayesaverage: number;
    average: number;
    usersrated: number;
    is_expansion: number;
    abstracts_rank: number | null;
    cgs_rank: number | null;
    childrensgames_rank: number | null;
    familygames_rank: number | null;
    partygames_rank: number | null;
    strategygames_rank: number | null;
    thematic_rank: number | null;
    wargames_rank: number | null;
}

export const getGamesDataFromCsv = async (amount: number): Promise<Game[]> => {
    const response = await fetch(BOARDGAMES_RANKS_CSV_URL);

    if (!response.ok) {
        throw new Error(
            `Failed to fetch boardgames rank data: ${response.status}`
        );
    }

    const csv = await response.text();

    const records: BoardGameRank[] = parse(csv, {
        columns: true,
        skip_empty_lines: true,
    });

    const games = records
        .filter(
            (record: BoardGameRank) =>
                record.rank &&
                Number(record.rank) &&
                Number(record.rank) <= amount
        )
        .map((record: BoardGameRank) => ({
            rank: Number(record.rank),
            name: record.name,
            year: String(record.yearpublished),
            id: String(record.id),
        }));

    return games;
};
