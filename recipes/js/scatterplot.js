// some "global" variables
var w = 400;
var h = 300;
var padding = 55;
var pad = 10;
//var rMax = 50;

function new_graph(xScale, yScale, xLabel, yLabel, graph) {

  // create the svg object
  var svg = d3.select(graph).append("svg").attr("width", w).attr("height", h);


  //Define X axis
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(5);

  //Define Y axis
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(5);

  //Create X axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

  // label x axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    //.call(xAxis)
    .append("text")
    .attr("x", w/2)
    .attr("y", -20)
    .text(xLabel);

  //Create Y axis
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);

  // label y axis
  svg.append("g")
    .attr("class", "y axis")
    //.call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 10)
    .attr("x", -h/2+padding)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text(yLabel);

  // draw a reference line
  svg.append("line").attr("class", "reference")
    .attr("x1", padding)
    .attr("x2", w-pad)
    .attr("y1", h-padding).attr("y2", pad)
    .style("stroke", "#CCC")
    .style("stroke-width", "4")
    .style("stroke-dasharray",9,5);
  return svg;
}

// plot the datapoints
var plot_dataset = function(dataset, circs, x, y, xScale, yScale)
{
  //Create circles
  return circs
    .data(dataset)
    .enter()
    .append("svg:circle")
    .attr("cx", function(d) {
      return xScale(d[x]);
    })
    .attr("cy", function(d) {
      return yScale(d[y]);
    })
    .attr("r", 4)
}

function style(cuisine, title, color) {
  //cuisine.attr("fill", function(d) {
  //var rgb = "rgb(";
  //for(var i = 0; i < color; i++) {
  //rgb += "0, ";
  //}
  //rgb += Math.round(d.rating * 30);
  //for(var i = 2; i > color; i--) {
  //rgb += ", 0";
  //}
  //rgb += ")";
  //return rgb; })
  cuisine.attr("fill", color)
    .attr("opacity", 0.8);
  cuisine.append("svg:title")
    .text(function(d) {
      return d.title;
      //+ "\nrating: "
      //+ Math.round(d.rating*100)/100;
      //+ "/5\n\ningredients:\n"
      //+ d.ings.replace(/;/g, "\n");
    });
  cuisine.append("svg:cuisine")
    .text(function(d) {
      return d.cuisine;
    });
  cuisine.on("mouseover", function(d) {
    general_mouseover(d);
  })
  .on("mouseout", function(d) {
    general_mouseout(d);
  });
}

function find_max(cuisine_data, value) {
  // always want some value
  var max = 1;
  for(var cuisine in cuisine_data) {
    var data = cuisine_data[cuisine];
    m = d3.max(data, function(d) { return d[value]; })
      if(m > max)
        max = m;
  }

  return max;
}


function plot_all_cuisines(cuisine_data, x, y, graph)
{
  xMax = find_max(cuisine_data, x);
  yMax = find_max(cuisine_data, y);
  // scale functions
  var xScale = d3.scale.linear()
    .domain([0.0,xMax])
    .range([padding, w - pad]);

  var yScale = d3.scale.linear()
    .domain([0,yMax])
    .range([h - padding, pad]);


  var svg = new_graph(xScale, yScale, x, y, graph);
  var circs = svg.selectAll("circle");
  for(var cuisine in cuisine_data) {
    c = plot_dataset(cuisine_data[cuisine], circs, x, y, xScale, yScale); // "fat", "kcal", "ning" );
    style(c, cuisine + " Recipes", color(cuisine));
  }
}

//var c = plot_dataset(chinese);
//style(c, "Chinese Recipes", 0);
//var j = plot_dataset(japanese);
//style(j, "Japanese Recipes", 2);
//var k = plot_dataset(korean);
//style(k, "Korean Recipes", 1);
function remove_old_graphs(graph) {
  var e = document.getElementById(graph);
  var parent_e = e.parentNode;
  parent_e.removeChild(e);

  var div = document.createElement('div');
  div.id = graph;
  parent_e.appendChild(div);
}
