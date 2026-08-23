const path = require('node:path');

app.get('/data.json', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../shared-data/data.json')
    );
});