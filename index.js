const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    'Content-Type': 'application/json'
}
const baseUrl = 'https://api.hubspot.com/crm/v3/objects/companies';
const properties = 'name, domain, academyprop'

app.get('/', async (req, res) => {
    try {
        const resp = await axios.get(baseUrl, { headers, params: { properties } });
        const data = resp.data.results;
        console.log(data[0].properties, 'toto')
        res.render('homepage', { title: 'Companies | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
        res.json(error)
    }
});
app.get('/update-cobj', async (req, res) => {    
    try {
        const companyId = req.query?.companyId
        let data = null
        if (companyId) {
            const hubspotCompany = await axios.get(`${baseUrl}/${companyId}`, { headers, params: { properties } })
            console.log(hubspotCompany.data)
            data = hubspotCompany.data
        }
        res.render('updates', { title: 'Upsert Company| HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
        res.json(error)
    }
});

app.post('/update-cobj', async (req, res) => {    
    try {
        const { id, ...data } = req.body
        if (id) {
            await axios.patch(`${baseUrl}/${id}`, { properties: data }, { headers })
        } else {
            await axios.post(baseUrl, { properties: data}, { headers })
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        res.redirect('/')
    } catch (error) {
        console.error(error);
        res.json(error)
    }
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));