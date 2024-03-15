// ZigZag diagram, based on a Japanese train timetable in a book by Edward Tufte
// by Roger Spooner 2024-03-15

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();

        reader.onload = function(event) {
            let decoder = new TextDecoder('utf-8');
            let str = decoder.decode(event.target.result);
            resolve(str);
        };
        reader.onerror = function(event) {
            reject(event.target.error);
        };
        console.log("Reading "+file.name);
        reader.readAsArrayBuffer(file);
    });
}

function parseCSV(csvString) {
    let lines = csvString.split('\n'); // Split the CSV string into lines
    let headers = lines[0].split(',').map(header => header.trim()); // Extract headers and trim whitespaces
    let data = []; // Array to store objects
    // Loop through lines starting from index 1 (to skip header line)
    for (let i = 1; i < lines.length; i++) {
        let values = lines[i].split(',').map(value => value.trim()); // Split line into values and trim whitespaces
        let obj = {}; // Object to store current row data
        
        // Loop through values and assign them to corresponding headers
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = values[j];
        }
        
        data.push(obj); // Push object to data array
    }
    console.log("returning from parseCSV: "+data.toString());
    return data;
}

async function loadAndRenderZigZag(stationsFileElement, timeTableFileElement) {
    const stationsFileInput = document.getElementById(stationsFileElement);
    const stationsFile = stationsFileInput.files[0];
    const timeTableFileInput = document.getElementById(timeTableFileElement);
    const timeTableFile = timeTableFileInput.files[0];

    let [stationsData, timetableData] = await Promise.all([
        readFileAsArrayBuffer(stationsFile),
        readFileAsArrayBuffer(timeTableFile)
    ]);

    console.log("Stations:");
    stations = parseCSV(stationsData);
    console.log(stations);
    console.log("Timetable");
    timetable = parseCSV(timetableData);
    console.log(timetable);
}
