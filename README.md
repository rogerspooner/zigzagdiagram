# Zig Zag Diagram

JavaScript that imports a spreadsheet of train times and draws an SVG diagram.

The diagram show railway stations as horizontal lines on the Y axis.
Time is along the X axis.
A scheduled train is a diagonal line from a station (Y) at a departure time (X) to another X,Y point.
This helps to see the time available for connections, and alternatives.
The spreadsheet should have the following columns:
- From        - Name of origin station as text
- To          - Name of direct destination station as text. Split connecting routes up; that's the point of the diagram.
- Depart      - Time of departure on the day. Either as 4 digits HHMM or as a time HH:MM
- Arrive      - Time of arrival
- StyleClass  - CSS style class name. optional. For example: minor
Your table should have those column headings.

Copy and paste may not work in all browsers.
Copy the relevant spreadsheet cells including column headings.
Click the focus in to the browser window
Press the Paste keystroke e.g. Ctrl-V.

I drew it to help me visualise a day I am planning with an Interrail pass. I need to get from one of two starting points, via a special railway section, to a destination the next day (within the Interrail rules). How many chances do I get for mistakes?

A lot of this was written with the help of ChatGPT.

I saw the "graphical timetable" style in books by Edward Tufte.
https://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0003zP

(c) Roger Spooner 2024
