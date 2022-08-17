// word cloud data
let wordCloudDict = {
    "1930": [
        { word: "Roosevelt", size: "18.1" },
        { word: "McCarter", size: "16.6" },
        { word: "gold", size: "14.3" },
        { word: "geology", size: "12.4" },
        { word: "Crisler", size: "24.9" },
        { word: "intramural", size: "14.3" }
    ],
    "1940": [
        { word: "this", size: "18.1" },
        { word: "is", size: "16.6" },
        { word: "test", size: "14.3" },
    ]
}
// set the dimensions and margins of the graph
let margin = { top: 10, right: 100, bottom: 30, left: 30 },
    width = 500 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
let svg = d3.selectAll(".mountain-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("allwordsfreq.csv", function (data) {
    // filter out data

    // A color scale: one color for each group
    let myColor = "#1a1a1a";

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
        .attr("transform", function (d) {
            return "rotate(-50)";
        });

    // Initialize an Y axis
    let y = d3.scaleLinear().domain([0, d3.max(data, function (d) {
        return +d.she * 10;
    })]).range([height, 0]);
    let yAxis = d3.axisLeft().scale(y);
    svg.append("g")
        .attr("class", "myYaxis")
        .call(d3.axisLeft(y));


    let line = svg
        .append('g')
        .append("path")
        .datum(data)
        .attr("d", d3.area()
            .x(function (d) { return x(+d.timedecade) })
            .y0(height)
            .y1(function (d) { return y(+d.she * 10) })
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

        // console.log(data)

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
            .style("fill", myColor)

        // update the chart header
        d3.select("#" + selectedDecade).select(".chart-title")
            .text("mentions of " + selectedGroup + " every 10000 words")
        
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

})

// set the dimensions and margins of the graph
let margin2 = { top: 10, right: 10, bottom: 10, left: 10 },
    width2 = 300 - margin2.left - margin2.right,
    height2 = 300 - margin2.top - margin2.bottom;


for (let decade in wordCloudDict) {
    // append the svg object to the body of the page
    let cloud = d3.select("#d" + decade).select(".word-cloud").append("svg")
        .attr("width", width2 + margin.left + margin.right)
        .attr("height", height2 + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

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
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) { return d.text; });
    }

}
