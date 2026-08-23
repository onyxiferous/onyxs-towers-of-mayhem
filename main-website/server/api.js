const path = require('node:path');

app.get('/shared/data.json', (req, res) => {
    res.sendFile(
        path.join(__dirname, '../shared/data.json')
    );
});