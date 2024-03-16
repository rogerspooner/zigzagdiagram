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
    return data;
}

function addLineToSvg(context, x1,y1,x2,y2, className) {
    const svgContainer = context.svgContainer;
    const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    line.setAttribute('x1', x1 * context.xscale);
    line.setAttribute('y1', y1 * context.yscale);
    line.setAttribute('x2', x2 * context.xscale);
    line.setAttribute('y2', y2 * context.yscale);
    line.setAttribute('class', className);
    svgContainer.appendChild(line);
}

function addTextToSvg(context, x, y, label, className) {
    const svgContainer = context.svgContainer;
    const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    text.setAttribute('x', x * context.xscale);
    text.setAttribute('y', y * context.yscale);
    text.setAttribute('class', className);
    text.textContent = label;
    svgContainer.appendChild(text);
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

    stations = parseCSV(stationsData.trim());
    timetable = parseCSV(timetableData.trim());
    console.log(timetable);
    let context = {};
    context.stationYs = {};
    context.xscale = 30;
    context.yscale = 0.5;
    stations.forEach( (row) => context.stationYs[row['Name']] = row['Y'] );
    console.log(context);
    context.svgContainer = document.getElementById('zigzag-svg');

    stations.forEach( (row) => addLineToSvg( context, 0, context.stationYs[row['Name']], 
        32, context.stationYs[row['Name']], 'stationLine'));
    stations.forEach( (row) => addTextToSvg( context, 0, context.stationYs[row['Name']] - 8, 
        row['Name'], 'stationLabel'));
    for (let hr = 0; hr  <= 32; hr += 1 ) {
            addLineToSvg(context, hr, 0, hr, 900, 'thinHourLine');
    }
    for (let hr = 0; hr  <= 32; hr += 3 ) {
        addLineToSvg(context, hr, 0, hr, 900, 'hourLine');
        addTextToSvg(context, hr+0.1, 30, hr%24+'h', 'hourLabel');
    }

    timetable.forEach( (row) => addLineToSvg(context, 
        row['DepHrs'], context.stationYs[row['From']],
        row['ArrHrs'], context.stationYs[row['To direct']],
        "trainZigZag"  ))

}
