// set the dimensions and margins of the graph
var margin = { top: 10, right: 100, bottom: 30, left: 30 },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("allwordsfreq.csv", function (data) {

  // List of groups (here I have one group per column)
  // var allGroup = ["valueA", "valueB", "valueC"]

   // add the options to the button
  //  d3.select("#selectButton")
  //   .selectAll('myOptions')
  //   .data(allGroup)
  //   .enter()
  //   .append('option')
  //   .text(function (d) { return d; }) // text showed in the menu
  //   .attr("value", function (d) { return d; }) // corresponding value returned by the button


  // A color scale: one color for each group
  var myColor = "#1a1a1a";

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain([new Date(1880),new Date(2010)])
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
  var y = d3.scaleLinear().domain([0, d3.max(data, function(d) { 
      return +d.editors * 10; 
    })]).range([height, 0]);
  var yAxis = d3.axisLeft().scale(y);
  svg.append("g")
    .attr("class", "myYaxis")
    .call(d3.axisLeft(y));

  // Initialize line with group a
  var line = svg
    .append('g')
    .append("path")
    .datum(data)
    .attr("d", d3.area()
      .x(function (d) { return x(+d.timedecade) })
      .y0(height)
      .y1(function (d) {  return y(+d.value* 10) })
    )
    .attr("stroke", function (d) { return myColor })
    .style("stroke-width", 2)
    .style("fill", myColor)
    

  // A function that update the chart
  function update(selectedGroup) {
    


    // Create new data with the selection?
    var dataFilter = data.map(function (d) { return { time: d.timedecade, value: d[selectedGroup] } })

    y.domain([0, d3.max(data, function(d) { 
      return +d[selectedGroup] * 10; 
    })]);
    svg.selectAll(".myYaxis")
      .transition()
      .duration(1000)
      .call(yAxis);
    
    // console.log(data)

    // Give these new data to update line
    line
      .datum(dataFilter)
      .transition()
      .duration(1000)
      .attr("d", d3.area()
        .x(function (d) {return x(+d.time) })
        .y0(height)
        .y1(function (d) {  return y(+d.value *10) })
      )
      .attr("stroke", function (d) { return myColor})
      .style("fill", myColor)
      
  }

  // When the button is changed, run the updateChart function
  // or # on change
  d3.selectAll(".selectButton").on("click", function (d) {
    // recover the option that has been chosen

    var selectedOption = d3.select(this).text().toLowerCase();



    // run the updateChart function with this selected option
    update(selectedOption)
  })

})
