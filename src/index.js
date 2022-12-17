const axios = require('axios');
const filesystem = require('fs');

let json;
try {
    let jsonString = filesystem.readFileSync('extracted_data.json', 'utf8');
    json = JSON.parse(jsonString);
} catch (error) {
    console.log('error reading file extracted_data.json: ', error);
}


axios.get('https://apod.ellanan.com/api', { headers: { "Accept-Encoding": "gzip,deflate,compress" } })
    .then(response => {
        json.push(response.data);
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
    .finally(function () {
        console.log('finally block executed!')
    });

try {
    filesystem.writeFileSync('extracted_data.json', JSON.stringify(json, null, 2),
        'utf8', function (err) {
            console.log(response.data);
        });
} catch (error) {
    console.log('error writing to file extracted_data.json: ', error);
}
