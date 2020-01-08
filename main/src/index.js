//Constructor
//DATA PREPARATION
//HELPER FUNCTIONS
//CREATE SCALES
//DRAW
//Actual bubbles
//Setdata for other people data 
import * as d3 from "https://unpkg.com/d3@5.15.0/index.js?module";

class BubbleChart{

  constructor(){
      this.svg = null;
      this.width = 940;
      this.height = 600;


      this.center = {
        x : this.width/2,
        y: this.height/2
      }

      this.setBubbleColors = Array("red", '#ffa500', '#ffcd00','#87c735','#3e49bb','#682cbf','#7f4fc9','pink','brown');

  }

  set setForceStrength(fs = 0.03){
    this.forceStrength = fs;
  }

  set setBubbleColors(bcs){
   this.bubbleColors = bcs;
  }

  set dataSetter(randData){
    this.data = randData;
  }

  get dataGetter(){
    return this.data;
  }

  get getBubbleColors(){
    return this.bubbleColors;
  }


  get getForceStrength(){
    return this.forceStrength;
  }


  set bubbleSetter(bub=null){
    this.bubbles = bub;

  }

  get bubbleGetter(){
    return this.bubbles;
  }

  set nodeSetter(n = []){
    this.nodes = n;
  }

  get nodeGetter(){
    return this.nodes;
  }


  get centerGetter(){
    return this.center;
  }

  get simulationGetter(){
    return this.simulation;
  }

  set domainSetter(domain){
    this.domain = domain;
  }

  get domainGetter(){
    return this.domain;
  }




    

  draw(selector){
  $(selector).html('');
  this.svg = d3.select(selector)
    .append('svg')
    .attr('width', this.width)
    .attr('height', this.height);
    
    this.setForceStrength = 0.2;
    this.createChart("#vis",this.nodeGetter);

  }


  createForceLayout(){

    const charge = (d) =>
        -Math.pow(d.radius, 2.0) * this.getForceStrength;


    //console.log(this.bubbleGetter);
    
    const ticked = () =>{ 
      this.bubbleGetter
      .attr('cx', function (d) { return +d.x; })
      .attr('cy', function (d) { return +d.y; });
    }

    const simulation = d3.forceSimulation()
    .velocityDecay(0.2)
    .force('x', d3.forceX().strength(0.03).x(500))
    .force('y', d3.forceY().strength(this.getForceStrength).y(this.centerGetter.y))
    .force('charge', d3.forceManyBody().strength(function(d) { return charge(d); }))
    .on("tick", ticked);
    //this.simulation.force(d3.forceCenter(this.centerGetter.z, this.centerGetter.y));

    return simulation;
   }


createNodes(rawData){

    const maxAmount = d3.max(rawData, function (d) { return +d.Streams * Math.pow(10,6); });

    const radiusScale = d3.scalePow()
      .exponent(2)
      .range([2, 85])
      .domain([0, maxAmount]);


     const myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.Streams * Math.pow(10,6)),
        value: +d.Streams * Math.pow(10,6),
        name: d.Artist,
        from: String(d.From).trim(),
        group: +d.Date,
        year: d.Date,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
      
    });

    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });
    this.nodeSetter = myNodes;
    //this.createChart("#vis",this.nodeGetter);

}



  groupBubbles() {
    this.svg.selectAll('.year').remove();

    // @v4 Reset the 'x' force to draw the bubbles to the center.
    this.simulation.force('x', d3.forceX().strength(this.getForceStrength).x(this.centerGetter.x));

    // @v4 We can reset the alpha value and restart the simulation
    this.simulation.alpha(1).restart();
  }




  createChart(selector, rawData){

  var set = new Set();
  function getYearsCol(data){
    for (var i = data.length - 1; i >= 0; i--) {
      set.add(data[i].year.toString());
    }
  }
  this.domainSetter = set;





  getYearsCol(rawData);

   const fillColor = d3.scaleOrdinal()
  .domain(this.domainGetter)
  .range(this.getBubbleColors);


    // Bind nodes data to what will become DOM elements to represent them.
    //console.log(this.svg.selectAll('.bubble'))

    this.bubbleSetter = this.svg.selectAll('.bubble')
      .data(this.nodeGetter, function (d) { return d.Song; });


    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    // @v4 Selections are immutable, so lets capture the
    //  enter selection to apply our transtition to below.

    //console.log(this.bubbleGetter);
    this.bubblesE = this.bubbleGetter.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return d3.rgb(fillColor(d.group)); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.group)).darker(); })
      .attr('stroke-width', 2);
      //.on('mouseover', this.showDetail)
      //.on('mouseout', this.hideDetail);

    // @v4 Merge the original empty selection and the enter selection
    this.bubbleSetter = this.bubbleGetter.merge(this.bubblesE);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    this.bubbleGetter.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

     //Had to create the simulatin, stop the simulation and then restart the simulation
     this.simulation = this.createForceLayout();
     this.simulation.stop();
     this.simulation.nodes(this.nodeGetter);
     //this.simulation.alpha(1).restart();

    // Set the simulation's nodes to our newly created nodes array.
    // @v4 Once we set the nodes, the simulation will start running automatically!
    //console.log(this.bubbles);
   


    // Set initial layout to single group.
    this.groupBubbles();
}


   showDetail(d) {
    // change outline to indicate hover state.
    let tooltip = floatingTooltip('gates_tooltip', 240);

    let content = '<span class="name">Title: </span><span class="value">' +
                  d.Artist +
                  '</span><br/>' +
                  '<span class="name">Amount: </span><span class="value">$' +
                  d.value +
                  '</span><br/>' +
                  '<span class="name">Year: </span><span class="value">' +
                  d.year +
                  '</span>';
    tooltip.showTooltip(content, d3.event);
  }

  hideDetail(d) {
    // reset outline
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(d.group)).darker());

      tooltip.hideTooltip();
  }


   randomColor(){
    //Reference this code
      return '#' + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
    }

  generateRandomColorArray(){
      const randomColors = [];
      for (let i =0; i <= this.domainGetter.size; i++) {
        randomColors.push(this.randomColor());
      }
      return randomColors;
    }

}


const chart = new BubbleChart();

function display(data){
  chart.createNodes(data);
  chart.draw("#vis");
};

let currentSSelectedYear = "2019";
d3.csv("./data/new_data.csv").then(function(data){display(data); });



  var toggleDisplay = function (displayName) {
    if (displayName === 'year') {
      splitBubbles();
    } else {
      chart.groupBubbles();
  }
};


function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      toggleDisplay(buttonId);
    });
}


 function nodeYearPos(d){ 
    const yearCenters = {
    "European": { x: chart.width / 3, y: chart.height / 2 },
    "American": { x: chart.width / 2, y: chart.height / 2 },
    "African/Carribean": { x: 2 * chart.width / 3, y: chart.height / 2 },
    "Other" : {x :0 , y: 0}
  }
    
    return yearCenters[d.from].x;
  }


    //  */
  function splitBubbles() {
    showYearTitles();

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    chart.simulation.force('x', d3.forceX().strength(chart.forceStrength).x(nodeYearPos));

    // @v4 We can reset the alpha value and restart the simulation
    chart.simulation.alpha(1).restart();
  }

  /*
   * Hides Year title displays.
   */
  function hideYearTitles() {
    svg.selectAll('.year').remove();
  }

  // /*
  //  * Shows Year title displays.
  //  */
  function showYearTitles() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.

  const decadeTitle = {
    "European": 160,
    "American": chart.width / 2,
    "African/Carribean": chart.width - 160,
    "Other" : 0
  };

    const yearsData = d3.keys(decadeTitle);
    const years = chart.svg.selectAll('.year')
      .data(yearsData);

    years.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return decadeTitle[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }



  $(document).ready(function(){

  $("#change_color").click(function(){
      var bubbleColors = chart.generateRandomColorArray();
      chart.setBubbleColors = bubbleColors;
      chart.draw("#vis");
    });

  var data = ["2019","2018","2017","2016","2015","2014","2013","2012","2011","2010"];
   $("#simple_slider").slider({
    range: false,
    min: 0,
    max: data.length -1,
    values : data,
    change : function(event, ui){
      currentSSelectedYear = data[ui.value];
    }

  });

  });

  
  

  // /*
  //  * Function called on mouseover to display the
  //  * details of a bubble in the tooltip.
  //  */


  // /*
  //  * Hides tooltip
  //  */

  // /*
  //  * Externally accessible function (this is attached to the
  //  * returned chart function). Allows the visualization to toggle
  //  * between "single group" and "split by year" modes.
  //  *
  //  * displayName is expected to be a string and either 'year' or 'all'.
  //  */
  
  


setupButtons();

// /*
//  * Helper function to convert a number into a string
//  * and add commas to it to improve presentation.
//  */
// function addCommas(nStr) {
//   nStr += '';
//   var x = nStr.split('.');
//   var x1 = x[0];
//   var x2 = x.length > 1 ? '.' + x[1] : '';
//   var rgx = /(\d+)(\d{3})/;
//   while (rgx.test(x1)) {
//     x1 = x1.replace(rgx, '$1' + ',' + '$2');
//   }

//   return x1 + x2;
// }

