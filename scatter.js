var margin = {top: 20, right: 0, bottom: 30, left: 0};
var width = 500 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;
var padding = 80;
// pre-cursors
// -------------------- for the Scattor Plot --------------------
var sizeForCircle = function(d) {

  // TODO: modify the size
  return 8 * d['Serving Size Weight'];
}

// setup x
var xValue = function(d) { return d.Sodium;}, // data -> value
    xScale = d3.scale.linear().range([0, width - 20]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

// setup y
var yValue = function(d) { return d["Potassium"];}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");

// setup fill color
var cValue = function(d) { return d.Manufacturer;},
    color = d3.scale.category10();



// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// load data
//creating first scatter
var scatter1 = d3.select("body")
.append("svg")
.style("width", width + padding) // padding with second scatter
.style("height", height + margin.bottom)  //svg defalt size: 300*150
.append("g")

//creating the second scatter
var scatter2 = d3.select("body")
.append("svg")
.style("width", width)
.style("height", height + margin.bottom)  //svg defalt size: 300*150
.append("g")

d3.csv("cereal.csv", function(error, data) {

  // change string (from CSV) into number format
  data.forEach(function(d) {
    // d.Calories = +d.Calories;
    // d["Sugars"] = +d["Sugars"];
    d.Sodium = +d.Sodium;
    d.Potassium = +d.Potassium;
  });
  // don't want dots overlapping axis, so add in buffer to data domain
  xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
  yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

// -------------------- Drawing the scattor plot --------------------
  // x-axis
  scatter1.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .attr("fill", "white")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .attr("fill", "white")
      .style("text-anchor", "end")
      .text("Sodium");

  // y-axis
  scatter1.append("g")
      .attr("class", "y axis")
      .attr("fill", "white")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("fill", "white")
      .style("text-anchor", "end")
      .text("Potassium");

  // draw dots
  scatter1.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", sizeForCircle)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .style("fill", function(d) { return color(cValue(d));})
      .on("click", function(d) {
          scatter1.selectAll(".dot")
            .transition()
            .duration(500)
            .attr("r", sizeForCircle)
          d3.select(this).transition()
            .duration(500)
            .attr("r", 20);
          scatter2.selectAll(".dot")
            .transition()
            .duration(500)
            .attr("r", function(e) {
                 if (d["Cereal Name"] == e["Cereal Name"]) {
                  return 20;
                } else{
                  return sizeForCircle(e);
                }         
              }
            )
            
          });

      // setup scatter2 using scatter1 axis data
    scatter2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .attr("fill", "white")
      .call(xAxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .attr("fill", "white")
      .style("text-anchor", "end")
      .text("Sodium");

  // y-axis
  scatter2.append("g")
      .attr("class", "y axis")
      .attr("fill", "white")
      .call(yAxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("fill", "white")
      .style("text-anchor", "end")
      .text("Potassium");

  var legend = scatter1.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (padding - 20) + "," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width - 20)
      .attr("width", 18)
      .attr("height", 18)
      .attr("transform", "translate(0," + 250 + ")")
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width - 23)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("fill", "white")
      .style("text-anchor", "end")
      .attr("transform", "translate(0," + 250 + ")")
      .text(function(d) { return d;});

//brushing
  var brushingArea;
  var brush = d3.svg.brush()
  .x(xScale)
  .y(yScale)
  .on("brushend", function() {
    scatter2.selectAll("*").remove();
    var brushingRange = brush.extent();//[[x0, y0], [x1, y1]]
    newData = []
    data.forEach(function(d) { 
      if (d.Sodium >= brushingRange[0][0] && d.Sodium <= brushingRange[1][0]
        && d.Potassium >= brushingRange[0][1] && d.Potassium <= brushingRange[1][1]){
        newData.push(d);
      }
    })
    var secondXvalue = function(d) {return d["Sodium"]},
    secondXscale = d3.scale.linear().range([0, width - 20]),
    secondXmap = function(d) {return secondXscale(secondXvalue(d));},
    secondXaxis = d3.svg.axis().scale(secondXscale).orient("bottom")
//setup y
    var secondYvalue = function(d) {return d["Potassium"]},
    secondYscale = d3.scale.linear().range([height, 0]),
    secondYmap = function(d) {return secondYscale(secondYvalue(d));},
    secondYaxis = d3.svg.axis().scale(secondYscale).orient("left")


    secondXscale.domain([d3.min(newData, function(d) {return d.Sodium - 20;}), d3.max(newData, function(d) {return d.Sodium + 20;})]);
    secondYscale.domain([d3.min(newData, function(d) {return d.Potassium - 20;}), d3.max(newData, function(d) {return d.Potassium + 20;})]);
    scatter2.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .attr("fill", "white")
      .call(secondXaxis)
    .append("text")
      .attr("class", "label")
      .attr("x", width)
      .attr("y", -6)
      .attr("fill", "white")
      .style("text-anchor", "end")
      .text("Sodium");

    scatter2.append("g")
      .attr("class", "y axis")
      .attr("fill", "white")
      .call(secondYaxis)
    .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .attr("fill", "white")
      .style("text-anchor", "end")
      .text("Potassium");


  // draw dots
    scatter2.selectAll(".dot")
      .data(newData)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", sizeForCircle)
      .attr("cx", secondXmap)
      .attr("cy", secondYmap)
      .style("fill", function(d) { return color(cValue(d));})
      .on("mouseover", function(d) {

        tooltip.style("opacity", 1);
        tooltip.html(d["Cereal Name"] + "<br/>" 
          + 'Potassium: ' + d["Potassium"] + "<br/>"
          + 'Sodium: ' + d["Sodium"])
          .style("left", d3.event.pageX + 5 + "px")
          .style("top", d3.event.pageY + 5 + "px")
      })
      .on("click", function(d) {
          scatter2.selectAll(".dot")
            .transition()
            .duration(500)
            .attr("r", sizeForCircle);
          d3.select(this).transition()
            .duration(500)
            .attr("r", 20);
          scatter1.selectAll(".dot")
            .transition()
            .duration(500)
            .attr("r", function(e) {
                 if (d["Cereal Name"] == e["Cereal Name"]) {
                  return 20;
                } else{
                  return sizeForCircle(e);
                }
            })
          })
      })
  // .on("brush", brushmove)
  scatter1.call(brush);
});