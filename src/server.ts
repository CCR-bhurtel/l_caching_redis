import express, { Request, Response } from 'express';
import axios from 'axios';
import redis, { RedisClientType } from 'redis';

const app = express();

let redisClient: RedisClientType;

async function getApiData(species: string) {
    const response = await axios.get(`https://www.fishwatch.gov/api/species/${species}`);
    return response.data;
}

async function getSpeciesData(req: Request, res: Response) {
    const species = req.params.species;
    let results;
    let isCached = false;
    try {
        const cachedResults = await redisClient.get(species);
        if (cachedResults) {
            isCached = true;
            results = JSON.parse(cachedResults);
        } else {
            results = await getApiData(species);
            await redisClient.set(species, JSON.stringify(results), {
                EX: 20,
                NX: true,
            });
        }
        return res.send({
            fromCache: isCached,
            data: results,
        });
    } catch (err) {
        console.log(err);
    }
}

app.get('/fish/:species', getSpeciesData);
const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.REDIS_PORT || 6379;

(async function () {
    redisClient = redis.createClient();
    redisClient.on('error', (err) => {
        console.log(err);
    });
    await redisClient.connect();
})();

app.listen(PORT, () => {
    console.log(`App listening to port ${PORT}`);
});
