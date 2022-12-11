const axios = require('axios');
const filesystem = require('fs');

let json;

filesystem.readFile('extracted_data.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("File read failed:", err)
        return
    }
    json = JSON.parse(jsonString);
});

axios.get('https://apod.ellanan.com/api')
    .then(response => {
        json.push(response.data);
        filesystem.writeFileSync('extracted_data.json', JSON.stringify(json, null, 2),
            'utf8', function (err) {
                console.log(response.data);
            });
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
    .finally(function () {
        console.log('finally block executed!')
    });