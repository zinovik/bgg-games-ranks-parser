# bgg-games-ranks-parser

## Working locally

```bash
npm run dev
```

```bash
curl 'http://localhost:8080?amount=101'
```

Interface:

```typescript
interface BGGGamesRanksData {
  date: string;
  games: {
    rank: number;
    name: string;
    year: string;
    id: string;
  }[];
}

Static file (faster but a little bit outdated) can be find here: https://raw.githubusercontent.com/zinovik/bgg-games-ranks-data/main/bgg-games-ranks.json
