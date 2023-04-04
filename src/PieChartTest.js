// Did not make this into a class because of separate page and lack of time to reformat
// THIS is not completely finished but gets the job done

// global Class variables
var pData; // overalldata
var pieSvg;
var width = 300;
var height = 300;
var margin = 40;
var radius = Math.min(width, height) / 2 - margin;
let selectedIndex;
var sliderValue = 5000 // maximum hours to filter for call length
var timeLabel;
const colors = ["#aaaaaa","#ee4411","#bbaa22","#44dd44"] // bg, longest, average. shortest
function parseRecord(row){
    return {
        SERVICE_REQUEST_ID: row.SERVICE_REQUEST_ID,
        STATUS: row.STATUS, //??
        SERVICE_NAME: row.SERVICE_NAME,
        SERVICE_CODE: row.SERVICE_CODE,
        DESCRIPTION: row.DESCRIPTION,
        AGENCY_RESPONSIBLE: row.AGENCY_RESPONSIBLE,
        REQUESTED_DATETIME: row.REQUESTED_DATETIME ? new Date(row.REQUESTED_DATETIME) : undefined,
        UPDATED_DATETIME: row.UPDATED_DATETIME ? new Date(row.UPDATED_DATETIME) : undefined,
        EXPECTED_DATETIME: row.EXPECTED_DATETIME ? new Date(row.EXPECTED_DATETIME) : undefined,
        ADDRESS: row.ADDRESS,
        ZIPCODE: row.ZIPCODE,
        LATITUDE: row.LATITUDE ? parseFloat(row.LATITUDE) : undefined,
        LONGITUDE: row.LONGITUDE ? parseFloat(row.LONGITUDE) : undefined,
        REQUESTED_DATE: row.REQUESTED_DATE ? new Date(row.REQUESTED_DATE) : undefined,
        UPDATED_DATE: row.UPDATED_DATE ? new Date(row.UPDATED_DATE) : undefined,
        LAST_TABLE_UPDATE: row.LAST_TABLE_UPDATE ? new Date(row.LAST_TABLE_UPDATE) : undefined,
    }
}


// d3.tsv('data/sampleData.tsv')
d3.tsv('data/Cincy311_2022_final.tsv')
    .then(rawData => {
        console.log(`Data loading complete: ${rawData.length} records.`);
        const data = rawData.slice(0, 10000).map(parseRecord);
        console.log("Example:", data[0]);
        pData = data
        createPie() // creates placeholder for pie
        return updateData(-1);
    })
    .catch(err => {
        console.error("Error loading the data");
        console.error(err);
    });

function getTimeBetween(callData){ // converts epochs to seconds 
    if (callData == undefined){
        return 0
    }
    let callOpened = callData.REQUESTED_DATETIME;
    let callUpdated = callData.UPDATED_DATETIME;
    if (callOpened && callUpdated){ // if both exist then create chart
        let timeBetween = callUpdated.getTime() - callOpened.getTime();
        let timeSeconds = timeBetween/ 1000
        return timeSeconds
    }
    return 0 // returns 0 if not recognized (should be thrown out later)
}

function convertHoursToText(hours) { // converts hours to somewhat readabletext
    if (hours >0 && hours <=24) {
        console.log("convert",hours)
        return hours.toString() + " Hours";
    }else if( hours > 24 && hours <730.5){
        let days = hours/24.
        return days.toFixed(2).toString() + " Days";
    
    }else if( hours > 730.5 && hours <8765.999){
        let months = hours/24/30
        return months.toFixed(2).toString()+ " Months"
    }else{
        let years = (hours/24/30/365) + 1
        return years.toFixed(2).toString() + " Years"
    }
}

function createPie(){ // creates pie chart initially
    pieSvg = d3.select("#time-between-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
    // title
    let cTitle = pieSvg.append("text")
    .attr("x",0 )
    .attr("y", -100)
    .style("text-anchor", "middle")
    .text("Time Between Call Requests and updates");
    
    // label
    timeLabel = pieSvg.append("text")
    .attr("class","timeLabel")
    .attr("x",-6)
    .attr("y", -60)
    .style("text-anchor", "middle")
    .text(convertHoursToText(sliderValue));

    // poiinting line
    let timePoint = pieSvg.append("line")
    .attr("class","timePoint")
    .style("stroke", "black")
    .attr("x1",-3)
    .attr("y1", -40)
    .attr("x2",-3)
    .attr("y2", -60)


    // Legend

    for (i=1; i < 4; i++){ // only show readable colors
        pieSvg.append("rect")
            .attr("fill",colors[i])
            .attr("class", "data-element")
            .attr("x", -70 + (i*55) +1)
            .attr("y", 60)
            .attr("height", 15)
            .attr("width", 15);
        pieSvg.append("text")
            .attr("class","leg-"+i.toString())
            .attr("x", -80 + (i*55))
            .attr("y", 85)
            .attr("font-size", 8)
            .text("0")

    }

    var slider = document.getElementById("myRange");
    var output = document.getElementById("lengthCutoff");
    slider.setAttribute("max",8800) // max of 1.1 years, anything after that is aggegious
    slider.setAttribute("min",23) // normal min of 24 hours
    slider.setAttribute("value",sliderValue) // a little over a half a year to show granularity
    output.innerHTML = convertHoursToText(5000) // "pretty" prints chart
}

function updateData(selectedIndex){ // updates pie chart based off of slider
    let selectedCall; // placeholder
    let longestTime = 0;  // longest time between all calls
    let averageTime = 0;  // average time between all calls
    let shortestTime = Infinity; // shortest nonzero time between calls
    let currentTime = getTimeBetween(selectedCall);
    let totalTime = 0;
    let timeCounts = 0;

    if (selectedIndex == undefined || selectedIndex == -1){ // means no call is selected 
        //console.log("no selected call")
    }else{ // shows precise data for selected call () if selected call exists, just keep last call for data persistence
       // selectedCall = data[selectedIndex]
        console.log("selecting call",selectedIndex);
        selectedCall = pData[selectedIndex];
    }

    // Constraints
    const maxSeconds = sliderValue * 60*60 ; // from hours to Seconds in a year
    const minSeconds = 0; // shortest call... doesnt need to be dynamic
    pData.forEach(d =>{ // finds longest timebetween for chart (can replace data with selected/filtered data)
        const seconds = getTimeBetween(d)
        if (seconds > longestTime && seconds <= maxSeconds){
            longestTime = seconds;
        }
        if (seconds > minSeconds && seconds < shortestTime){ // set shortest
            shortestTime = seconds;
        }
        if (seconds >minSeconds && seconds < maxSeconds){ // get average
            timeCounts += 1;
            totalTime += seconds;
            averageTime = totalTime/timeCounts;
        }            
    })


    let longDifInHrs = longestTime/3600;
    let shortDifInHrs = shortestTime/3600;
    let avgTimeInHours = averageTime/3600;
    let currentTimeInHours = currentTime/3600; // can be undefined?

    // Actually build pie
    const pieData = {"longest":longDifInHrs,"shortest":shortDifInHrs,"avg":avgTimeInHours,"current":(currentTimeInHours || 0),"total_calls":timeCounts}; // three needed values, unsure how to label
    renderDonut(pieData)
}


function renderDonut(data){ // add config later

    // top label
    timeLabel.text(convertHoursToText(sliderValue));
    // Have a line


    const pi = Math.PI;  
    const pieScale = d3.scaleLinear()
    .domain([0,data.longest]) // updates scale so pie "expands" upon smaller time cuttoffs
    .range([0,2*pi]);
    // The arc generator
   // produces pies according to the data
    var bgArc = d3.arc() // backgroud
    .innerRadius(30)
    .outerRadius(45)
    .startAngle(0*pi)
    .endAngle(2*pi);

    const longCalc = pieScale(data.longest)
    var longestArc = d3.arc() // arc for longest time (essentially bg arc)
    .innerRadius(30)
    .outerRadius(45)
    .startAngle(0*pi)
    .endAngle(longCalc);

    const shortCalc = pieScale(data.shortest)
    var shortestArc = d3.arc() // arc for longest time (essentially bg arc)
    .innerRadius(30)
    .outerRadius(45)
    .startAngle(0*pi)
    .endAngle(shortCalc);

    const avgCalc = pieScale(data.avg)
    var averageArc = d3.arc() // arc for longest time (essentially bg arc)
    .innerRadius(30)
    .outerRadius(45)
    .startAngle(0*pi)
    .endAngle(avgCalc);

    const curCalc = pieScale(data.current)
    var currentArc = d3.arc() // arc for longest time (essentially bg arc)
    .innerRadius(30)
    .outerRadius(45)
    .startAngle(0*pi)
    .endAngle(curCalc);

    // Another arc that won't be drawn. Just for labels positioning
    var labelArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)
    //TODO: Convert tooltip texts to readable and actually get them working
    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    let bgPie = pieSvg.append("path")
    .attr("class", "bg_arc")
    .attr("d", bgArc)
    .attr("fill",colors[0])
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("opacity", 1)
    .on('mouseover', (event,d) => { // TOOTIP code
        console.log(event)
        d3.selectAll(".bg_arc")
        .attr("stroke", "#aaaaaa")
        .attr("stroke-width", "2px")

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 1) + 'px')   
          .style('top', (event.pageY + 1) + 'px')
          .html(`
              <div>All Calls: ${data.total_calls}</div>
              `)
    })
    .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
        d3.selectAll(".bg_arc") // reset back to normal
        .attr("fill","#aabbaa")
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("opacity", 1)
    });

    let longestPie =  pieSvg.append("path") 
    .attr("class", "arc")
    .attr("d", longestArc)
    .attr("fill",colors[1])
    .on('mouseover', (event,d) => { // TOOTIP code
        console.log(event)
        d3.selectAll(".bg_arc")
        .attr("stroke", "#aaaaaa")
        .attr("stroke-width", "2px")

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 1) + 'px')   
          .style('top', (event.pageY + 1) + 'px')
          .html(`
              <div>Longest Time between calls: ${data.longest}</div>
              `)
    })
    .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
        d3.selectAll(".bg_arc") // reset back to normal
        .attr("fill","#aabbaa")
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("opacity", 1)
    });
    

    let averagePie = pieSvg.append("path")
    .attr("class", "arc")
    .attr("d", averageArc)
    .attr("fill",colors[2])
    .on('mouseover', (event,d) => { // TOOTIP code
        console.log(event)
        d3.selectAll(".bg_arc")
        .attr("stroke", "#aaaaaa")
        .attr("stroke-width", "2px")

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 1) + 'px')   
          .style('top', (event.pageY + 1) + 'px')
          .html(`
              <div>All Calls: ${data.total_calls}</div>
              `)
    })
    .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
        d3.selectAll(".bg_arc") // reset back to normal
        .attr("fill","#aabbaa")
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("opacity", 1)
    });

    let currentPie = pieSvg.append("path") // only shows if there is a selected call
    .attr("class", "arc")
    .attr("d", currentArc)
    .attr("fill","green")
    .on('mouseover', (event,d) => { // TOOTIP code
        console.log(event)
        d3.selectAll(".bg_arc")
        .attr("stroke", "#aaaaaa")
        .attr("stroke-width", "2px")

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 1) + 'px')   
          .style('top', (event.pageY + 1) + 'px')
          .html(`
              <div>All Calls: ${data.total_calls}</div>
              `)
    })
    .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
        d3.selectAll(".bg_arc") // reset back to normal
        .attr("fill","#aabbaa")
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("opacity", 1)
    });

    let shortestPie = pieSvg.append("path")
    .attr("class", "arc")
    .attr("d", shortestArc)
    .attr("fill",colors[3])
    .on('mouseover', (event,d) => { // TOOTIP code
        console.log(event)
        d3.selectAll(".bg_arc")
        .attr("stroke", "#aaaaaa")
        .attr("stroke-width", "2px")

        d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + 1) + 'px')   
          .style('top', (event.pageY + 1) + 'px')
          .html(`
              <div>All Calls: ${data.total_calls}</div>
              `)
    })
    .on('mouseleave', () => {
        d3.select('#tooltip').style('display', 'none');
        d3.selectAll(".bg_arc") // reset back to normal
        .attr("fill","#aabbaa")
        .attr("stroke", "black")
        .attr("stroke-width", "1px")
        .attr("opacity", 1)
    });
    

    d3.select("#loader").remove();
    renderLegend(data)
}
function renderLegend(data) {
    Object.keys(data).forEach((key,i)=>{
        value = data[key]
        console.log(key,i,value)
       // Used to have for loop automation but need to do value instead
       if (key == "longest"){
        pieSvg.selectAll(".leg-1")
        .text(convertHoursToText(value))
       }else if (key == "shortest"){
        pieSvg.selectAll(".leg-3")
        .text(convertHoursToText(value))
       }else if (key == "avg"){
        pieSvg.selectAll(".leg-2")
        .text(convertHoursToText(value))
       }
    })
}

// slider and updating
var slider = document.getElementById("myRange");
var output = document.getElementById("lengthCutoff");
output.innerHTML = slider.value; // Display the default slider value
// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  output.innerHTML = convertHoursToText(this.value);
  sliderValue = this.value
  updateData()

}