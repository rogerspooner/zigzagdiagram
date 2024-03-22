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

function renderZigZag(timetable) {
    let context = {};
    // Create stations
    let stations = {};
    timetable.forEach( (row) => {
        if (!Object.hasOwn(stations,row['from']))  
        {   stations[row['from']] = Object.keys(stations).length+1;
        }
        if (!Object.hasOwn(stations,row['to']))  
        {   stations[row['to']] = Object.keys(stations).length+1;
        }
    } );
    context.xscale = 25;
    context.yscale = 500 / (Object.keys(stations).length+1);
    context.svgContainer = document.getElementById('zigzag-svg');
    for (let hr = 0; hr  <= 34; hr += 1 ) {
        addLineToSvg(context, hr, 0, hr, 900, 'thinHourLine');
    }
    for (let hr = 0; hr  <= 33; hr += 3 ) {
        addLineToSvg(context, hr, 0, hr, 900, 'hourLine');
        addTextToSvg(context, hr+0.1, 0.3, hr%24+'h', 'hourLabel');
    }

    Object.keys(stations).forEach( (name) => { addLineToSvg( context, 0, stations[name], 
        34, stations[name], 'stationLine') } );
    Object.keys(stations).forEach( (name) => addTextToSvg( context, 0, stations[name], 
        name, 'stationLabel'));
    Object.keys(stations).forEach( (name) => addTextToSvg( context, 33, stations[name], 
            name, 'smallLabel'));
    hrFormatter = new Intl.NumberFormat('en-GB',
        {   minimumIntegerDigits:4,
            useGrouping: false
        });
    timetable.forEach( (row) => { 
        let styleClass = "trainZigZag";
        if (Object.hasOwn(row,'styleclass') && row['styleclass'].length > 0 ) 
            styleClass = row['styleclass'];
        addLineToSvg(context, 
            row['departhrs'], stations[row['from']],
            row['arrivehrs'], stations[row['to']],
            styleClass  );
        addTextToSvg(context, row['departhrs'], stations[row['from']]+0.05, 
            hrFormatter.format(row['depart']%2400), 'tinyLabelRotate90');
        addTextToSvg(context, row['arrivehrs'], stations[row['to']]-0.2, 
            hrFormatter.format(row['arrive']%2400), 'tinyLabelRotate90');
     } )

}

async function loadAndRenderZigZag(timeTableFileElement) {
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
    renderZigZag(timetable, stations);
}

function convertToFractionalHours(str)
{
    let minutes, hours;
    let sep = str.indexOf(':')
    if (sep > 0)
    {
        hours = str.substring(0,sep);
        minutes = str.substring(sep+1);
    } else
    {
        minutes = str %100;
        hours = Math.floor(str / 100);
    }
    return hours + (minutes/60);
}

function parseTimetableTable(contentParent) {
    let requiredColumns = ['from','to','depart','arrive'];
    let timetable = [];
    let errorMsgs = new Array();
    let validsofar = true;
    // validate that we have a table
    let tb = contentParent.querySelector('table');
    if (null == tb)
        errorMsgs.push("Expected a table to be pasted.");
    // validate table column names in first row (assuming it's <td> not <th> )
    let toprow = tb.querySelector('tr');
    let headings = [];
    let headercells = toprow.querySelectorAll('td');
    headercells.forEach( (el) => headings.push(el.innerText.toLowerCase().trim()) );
    let numcolumns = headings.length;
    requiredColumns.forEach( (req) => { if (!headings.includes(req)) { validsofar = false; errorMsgs.push("Expected column heading: "+req) } } );
    let tablerows = tb.querySelectorAll('tr');
    for (let rn= 1; rn < tablerows.length; rn++ ) {
        tr = tablerows[rn];
        let fields = {};
        let cells = tr.querySelectorAll('td');
        if (cells.length != numcolumns)
            errorMsgs.push("Expected "+numcolumns+" columns in each row.")
        for (let col=0;  col < cells.length; col++ )
        {
            fields[headings[col]] = cells[col].textContent;
        }
        // Calculate fractional hours
        fields['departhrs'] = convertToFractionalHours(fields['depart']);
        fields['arrivehrs'] = convertToFractionalHours(fields['arrive']);
        timetable.push(fields);
    };
    if (errorMsgs.length > 0) console.log(errorMsgs);
    console.log(timetable);
    // check if times are in decimal minutes e.g. 2359 or time format e.g. 23:59
    if (errorMsgs.length == 0)
        return timetable;
    window.alert(errorMsgs.join('\n'));
    return null;
}

function gotClipboardString(str) {
    contentParent.innerHTML = str;
    // parse HTML table in to stations, timetable objects
    let timetable;
    timetable = parseTimetableTable(contentParent);
    if (undefined != timetable) 
    {   renderZigZag(timetable);
    }
}

async function clipboardClickHandler(evt) {
    if (! navigator.clipboard.read)
    {
      window.alert("Clipboard features not available in this browser.\nTry Chrome.");
      return -1;
    }
    let contentParent = document.getElementById("contentParent");
    contentParent.innerText = "Please approve clipboard access";
    let cbItems = await navigator.clipboard.read();
    gItems = cbItems;
    for (const cbItem of cbItems) {
        if (! cbItem.types.includes('text/html'))
        {   contentParent.innerText = "Only paste text/html of a table from a spreadsheet";
            return -1;
        }
        let blob = await cbItem.getType('text/html');
        let arrbuff = await blob.arrayBuffer();
        let decoder = new TextDecoder('utf-8');
        let str = decoder.decode(arrbuff);
        gotClipboardString(str);
    }
}

function clipboardPasteEventHandler(evt)
{ 
    gcbData = evt.clipboardData;
    for (let item of evt.clipboardData.items)
    {
        if (item.type == 'text/html')
        {
            let str = item.getAsString( (str) => gotClipboardString(str) );
        }
    }
    return 0;
}
