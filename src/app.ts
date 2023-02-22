import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();

async function getApiData(species: string) {
    const response = await axios.get(`https://www.fishwatch.gov/api/species/${species}`);
    console.log(response.data);
    return response.data;
}

async function getSpeciesData(req: Request, res: Response) {
    const data = await getApiData(req.params.species);
    console.log('Request sent');

    return res.send({
        fromCache: false,
        data,
    });
}

app.get('/fish/:species', getSpeciesData);
const PORT: string | Number = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App listening to port ${PORT}`);
});
