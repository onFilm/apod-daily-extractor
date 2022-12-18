const axios = require('axios');
const filesystem = require('fs');

let json;

readJSONFile();
callAPODApi();
writeToJSONFile();

function readJSONFile() {
    try {
        console.log('Inside readJSONFile method);
        let jsonString = filesystem.readFileSync('extracted_data.json', 'utf8');
        json = JSON.parse(jsonString);
        console.log('JSON string: ', json);
    } catch (error) {
        console.log('error reading file extracted_data.json: ', error);
    }
}

function writeToJSONFile() {
    try {
        console.log('Inside writeToJSONFile method);
        filesystem.writeFileSync('extracted_data.json', JSON.stringify(json, null, 2), 'utf8');
    } catch (error) {
        console.log('error writing to file extracted_data.json: ', error);
    }
}

function callAPODApi() {
    axios.get('https://apod.ellanan.com/api', { headers: { "Accept-Encoding": "gzip,deflate,compress" } })
        .then(response => {
            console.log(response.data);
            json.push(response.data);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .finally(function () {
            console.log('finally block executed!')
        });
}
