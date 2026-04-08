# bgg-games-ranks-parser

https://europe-central2-boardgamegeek-bots.cloudfunctions.net/bgg-games-ranks-parser?amount=101

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
```

## google cloud setup

### create service account

```bash
gcloud iam service-accounts create github
```

### add roles (`Service Account User` and `Cloud Functions Admin`) to the service account you want to use to deploy the function

```
gcloud projects add-iam-policy-binding boardgamegeek-bots --member="serviceAccount:github@boardgamegeek-bots.iam.gserviceaccount.com" --role="roles/cloudfunctions.admin"

gcloud projects add-iam-policy-binding boardgamegeek-bots --member="serviceAccount:github@boardgamegeek-bots.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"
```

### creating keys for service account for github `GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE`

```bash
gcloud iam service-accounts keys create key-file.json --iam-account=github@appspot.gserviceaccount.com
cat key-file.json | base64
```
