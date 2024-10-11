const express = require('express');
const app = express();
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (request, response) => {
    response.send('Hello from Yelp Camp, How are you')
})

app.listen(8080, () => {
    console.log('Listen On 8080')
})