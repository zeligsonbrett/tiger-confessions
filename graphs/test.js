import { arr } from "./array.js";

// default word plotted
var value = "editors";

// "search" bar
document.getElementById('search').addEventListener("click", function () {
    const val = document.getElementById('field').value;

    // if val is in array of words, update the svg accordingly
    // can't update both the word and the freq or counts parameter
    // simultaneously, so the graph and switch will revert back to 
    // freq upon new search
    if (arr.indexOf(val) !== -1) {
        value = val;

        document.getElementById("switch").checked = false;
        update('https:\/\/assets.dailyprincetonian.com/projects.dailyprincetonian.com/140-years-prince-history/allwordsfreq.csv', value)
    } else {
        alert("this word is not in the database!")
    }
})

// switching between freq and count graphs
document.getElementById('switch').addEventListener("click", function() {
        if(document.getElementById('switch').checked){
            update('https:\/\/assets.dailyprincetonian.com/projects.dailyprincetonian.com/140-years-prince-history/allwordsfreq.csv', value)
        } else {
            update('allwordsfreq.csv', value)
        }
      });

// margins for the graph
var margin = {top: 10, right: 30, bottom: 60, left: 60},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
         
// initialize x and y axes          
var x = d3.scaleTime()
    .range([ 0, width ]);

var xAxis = svg.append("g")
      .attr("transform", "translate(0," + height + ")")

var y = d3.scaleLinear()
    .range([ height, 0 ]);
var yAxis = svg.append("g")


// update function
function update(chartType, field){  

// clear the previous line and label
svg.selectAll("path").remove()
d3.select("#label").remove()

// add a label specifying the word
svg.append("text")
.attr("id", "label")
.attr("text-anchor", "middle")
.attr("x", width/2)
.attr("y", height + 40)
.text("word: " + field);

//Read the data
d3.csv(chartType,

  // formatting variables from csv
  function(d){
    return { timedecade : d3.timeParse("%Y")(d.timedecade), value : d[field]}
  },


  function(data) {

// update x axis 
    x.domain(d3.extent(data, function(d) { return +d.timedecade; }))
    xAxis.call(d3.axisBottom(x));

// Add y axis
    y.domain([0, d3.max(data, function(d) { return +d.value; })])
      yAxis.transition().duration(1000).call(d3.axisLeft(y));
    

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.timedecade) })
        .y(function(d) { return y(d.value) })
        )


})
}


// default
update('allwordsfreq.csv', "editors")