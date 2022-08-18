// word cloud data
let wordCloudDict = {
    "1930": [
        { word: "gold", size: "14.3" },
        { word: "Roosevelt", size: "18.1" },
        { word: "McCarter", size: "16.6" },
        { word: "geology", size: "12.4" },
        { word: "Crisler", size: "24.9" },
        { word: "intramural", size: "14.3" }
    ],
    "1940": [
        { word: "this", size: "18.1" },
        { word: "is", size: "16.6" },
        { word: "test", size: "14.3" },
    ],
    // sizes wrong
    "2010": [
        { word: "Obama", size: "18.1" },
        { word: "Facebook", size: "16.6" },
        { word: "climate", size: "14.3" },
        { word: "mental", size: "14.3" },
    ]
}

let myColor = "#F8F4EA";
// set the dimensions and margins of the graph
let margin = { top: 10, right: 50, bottom: 30, left: 50 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.selectAll(".mountain-chart")
    .append("svg")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


// set the dimensions and margins of the graph
let margin2 = { top: 10, right: 10, bottom: 10, left: 10 },
    width2 = 300 - margin2.left - margin2.right,
    height2 = 300 - margin2.top - margin2.bottom;

// initialize the word clouds, there's probably a way to do this without a for loop
for (let decade in wordCloudDict) {
    // append the svg object to the body of the page
    let cloud = d3.select("#d" + decade).select(".word-cloud").append("svg")
        .attr("viewBox", "0 0 " + (width2 + margin2.left + margin2.right) + " " + (height2 + margin2.top + margin2.bottom))
        .append("g")
        .attr("transform",
            "translate(" + margin2.left + "," + margin2.top + ")");

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    let layout = d3.layout.cloud()
        .size([width2, height2])
        .words(wordCloudDict[decade].map(function (d) { return { text: d.word, size: d.size * 2 }; }))
        .padding(10)        //space between words
        .rotate(0)       // rotation angle in degrees
        .fontSize(function (d) { return d.size; })      // font size of words
        .on("end", function (d) {
            draw(d, cloud);
        });
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud featurt are THE SAME from one word to the other can be here
    function draw(words) {
        cloud
            .append("g")
            .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) { return d.size; })
            .attr("text-anchor", "middle")
            .attr("class", "selectButton")
            .style("fill", myColor)
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; });
    }
}
//Read the data
d3.csv("allwordsfreq.csv", function (data) {


    // Add X axis --> it is a date format
    let x = d3.scaleLinear()
        .domain([new Date(1880), new Date(2010)])
        .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format('d'))).selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .style("fill", myColor)
        .attr("transform", function (d) {
            return "rotate(-50)";
        });

    // Initialize an Y axis and line, using arbitrary starting scale (the word "the")
    let y = d3.scaleLinear().domain([0, d3.max(data, function (d) {
        return +d.the * 10;
    })]).range([height, 0]);
    let yAxis = d3.axisLeft().scale(y);
    svg.append("g")
        .style("stroke", myColor)
        .attr("class", "myYaxis")
        .call(d3.axisLeft(y));


    let line = svg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.area()
            .x(function (d) { return x(+d.timedecade) })
            .y0(height)
            .y1(function (d) { return y(+d.the * 10) })
        )
        .attr("stroke", function (d) { return myColor })
        .attr("class", "line")
        .style("stroke-width", 2)
        .style("fill", myColor)

    // A function that update the chart
    function update(button, selectedGroup, selectedDecade) {
        d3.select("#" + selectedDecade).select(".word-cloud").select(".selected").classed("selected",false);
        // selected the right chart elements for the decade
        let selectedSvg = d3.select("#" + selectedDecade).select(".mountain-chart svg g");
        let selectedLine = selectedSvg.select(".line");

        // Create new data with the selection?
        let dataFilter = data.map(function (d) { return { time: d.timedecade, value: d[selectedGroup] } })

        y.domain([0, d3.max(data, function (d) {
            return +d[selectedGroup] * 10;
        })]);
        selectedSvg.selectAll(".myYaxis")
            .transition()
            .duration(1000)
            .call(yAxis);

        // Give these new data to update line
        selectedLine
            .datum(dataFilter)
            .transition()
            .duration(1000)
            .attr("d", d3.area()
                .x(function (d) { return x(+d.time) })
                .y0(height)
                .y1(function (d) { return y(+d.value * 10) })
            )
            .attr("stroke", function (d) { return myColor })

        // update the chart header
        d3.select("#" + selectedDecade).select(".chart-title")
            .text("Frequency of " + selectedGroup + " every 100,000 words")
            .attr("style", "color: #F8F4EA")
        
        // highlight selected group
        button.classList.add("selected")
    }

    // When the button is changed, run the updateChart function
    // or # on change
    d3.selectAll(".selectButton").on("click", function (d) {
        // recover the option that has been chosen
        let selectedWord = d3.select(this).text().toLowerCase();
        // get id of container
        let selectedDecade = this.closest('.graph-block-container').id


        // run the updateChart function with this selected option
        update(this, selectedWord, selectedDecade)
    })

    // VERY HACKY way to intialize all the mountain charts to the first word
    for(let decade in wordCloudDict){
        let word = wordCloudDict[decade][0]['word']
        let element = d3.select("#d" + decade)
                        .select(".word-cloud")
                        .selectAll(".selectButton")
                        .filter(function(){ 
                            return d3.select(this).text() == word
                        })
        update(element.node(), word.toLowerCase(), "d" + decade)
    }
})



