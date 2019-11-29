class Player {
  constructor(updateSelectedYearOverallView, maxData) {
    this.player1 = null;
    this.player2 = null;
    this.compareEnable = false;

    // Callbacks
    this.updateSelectedYearOverallView = updateSelectedYearOverallView;

    this.svgWidth = 1300;
    this.svgHeight = 1000;

    this.yearSelectorWidth = 500;
    this.yearSelectorHeight = 50;

    this.yearRangeIndexPlayer1 = {
      min: 0,
      max: 10
    };
    this.yearRangeIndexPlayer2 = {
      min: 0,
      max: 10
    };
    this.selectedYearIndexPlayer1 = 0;
    this.selectedYearIndexPlayer2 = 0;

    let that = this;

    this.brush = d3.brushX()
      .extent([[0, 20], [this.yearSelectorWidth, this.yearSelectorHeight]])
      .on('start brush end', function () {
        that.updateSelectedYears(this.parentNode.id);
      });

    this.spiderChartRadius = 100;
    this.circleBuffer = 50;
    this.transitionTime = 1000;

    this.widthOfPieChart = 25;

    // Need to save what data is being stored in each quadrant, so we can create the spider plots in correct area
    // This will be used in updateSpiderCharts
    this.dataToIndex = {
      'Points': {},
      'Passing': {},
      'Rushing': {},
      'Receiving': {}
    };
    this.spiderChartPlotCirclesRadiuses = 5;
    this.maxData = maxData;
    console.log(this.maxData);
  }

  /**
   * Creates all the component for player view.
   */
  createPlayerView() {
    this.svg = d3.select('#playerViewSVGDiv').append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);

    let spiderChartX = 25;
    let spiderChartY = 100;

    this.createYearBarAndBrush('Player2');
    this.createYearBarAndBrush('Player1');
    const pointLabels = ['Fantasy Points', 'PPR Points', 'PPG', 'PPRPG', 'Position Rank'];
    const passingLabels = ['Touchdowns', 'Interceptions', 'Passing Yards', 'Completions', 'Attempts'];
    const rushingLabels = ['Touchdowns', 'Rushing Yards', 'Attempts', 'Yards Per Attempt'];
    const receivingLabels = ['Touchdowns', 'Receiving Yards', 'Receptions', 'Targets', 'Yards Per Reception'];
    this.createSpiderChart('Points', spiderChartX, spiderChartY, pointLabels);
    this.createSpiderChart('Passing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer), passingLabels);
    this.createSpiderChart('Rushing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 2, rushingLabels);
    this.createSpiderChart('Receiving', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 3, receivingLabels);
    this.createLineGraphs();
    this.createLineGraphs();
    this.createLineGraphs();
    this.createLineGraphs();
  }

  /**
   *  Updates the player view with the current data values.
   */
  updateView() {
    let xPlayer1 = 430;
    let xPlayer2 = 430;
    let y = 50;

    if (this.compareEnable) {
      xPlayer1 = 90;
      xPlayer2 = 770;
    }
    this.updateYearBarAndBrush('Player1', this.player1, xPlayer1, y);
    this.updateYearBarAndBrush('Player2', this.player2, xPlayer2, y);

    this.updateSpiderChart('Passing', 'Player1', this.player1, this.selectedYearIndexPlayer1);
    this.updateSpiderChart('Rushing', 'Player1', this.player1, this.selectedYearIndexPlayer1);
    this.updateSpiderChart('Receiving', 'Player1', this.player1, this.selectedYearIndexPlayer1);
    this.updateSpiderChart('Points', 'Player1', this.player1, this.selectedYearIndexPlayer1);

    this.updateSpiderChart('Passing', 'Player2', this.player2, this.selectedYearIndexPlayer2);
    this.updateSpiderChart('Rushing', 'Player2', this.player2, this.selectedYearIndexPlayer2);
    this.updateSpiderChart('Receiving', 'Player2', this.player2, this.selectedYearIndexPlayer2);
    this.updateSpiderChart('Points', 'Player2', this.player2, this.selectedYearIndexPlayer2);
  }

  /**
   *  Creates a new year selector for the specified players (for both single player and compare player).
   * @param player - Player ID
   */
  createYearBarAndBrush (player) {
    let yearGroup = this.svg.append('g')
      .attr('id', `yearGroup${player}`)
      .style('opacity', 0)
      .attr('transform', `translate(430, 50)`);

    yearGroup.append('line')
      .attr('x1', 0)
      .attr('y1', this.yearSelectorHeight*.7)
      .attr('x2', this.yearSelectorWidth)
      .attr('y2', this.yearSelectorHeight*.7)
      .classed('year_line', true);

    yearGroup.append('g')
      .attr('id', `yearGroupAxis${player}`)
      .style('opacity', 0);

    yearGroup.append('g')
      .attr('id', `yearGroupLabels${player}`);

    yearGroup
      .append('g')
      .attr('class', 'brush')
      .call(this.brush);

    yearGroup.append('g')
      .attr('id', `yearGroupCircles${player}`);
  }

  /**
   *
   * @param player
   * @param playerData
   * @param x
   * @param y
   */
  updateYearBarAndBrush (player, playerData, x, y) {
    let opacity = 1;
    if ((player === 'Player2' && !this.compareEnable) || !playerData) {
      opacity = 0;
    }
    let yearGroup = d3.select(`#yearGroup${player}`);
    yearGroup
      .transition()
      .duration(1000)
      .attr('transform', `translate(${x}, ${y})`)
      .style('opacity', opacity);

    yearGroup.selectAll(".brush").call(this.brush.move, null);

    if (opacity === 0) {
      return;
    }

    let that = this;

    let yearScale = d3
      .scaleLinear()
      .domain([0, playerData.years.length])
      .range([0, 500]);

    let yearAxis = d3.axisBottom()
      .tickValues([])
      .scale(yearScale);

    d3.select(`#yearGroupAxis${player}`)
      .call(yearAxis);

    let centerOffset = yearScale(1) / 2;

    let yearGroupCircles = d3.select(`#yearGroupCircles${player}`);

    let circles = yearGroupCircles
      .selectAll('circle')
      .data(playerData.years);

    let newCircles = circles.enter()
      .append('circle')
      .attr('cx', this.yearSelectorWidth)
      .attr('cy', this.yearSelectorHeight*.7)
      .attr('r', 0)
      .style('opacity', 0)
      .style('fill', d3.schemePaired[0]);

    circles.exit()
      .transition()
      .duration(1000)
      .attr('cx', this.yearSelectorWidth)
      .attr('r', 0)
      .style('opacity', 0)
      .remove();

    circles = newCircles.merge(circles);

    circles
      .on('click', function (d, i) {
        // Update selected circle.
        d3.select(`#${this.parentNode.id}`).selectAll('circle')
          .classed('selected_year_circle', false);
        d3.select(this).classed('selected_year_circle', true);

        // Update the selected text.
        let grandpaNode = d3.select(`#${this.parentNode.id}`).select(function () {
          return this.parentNode;
        });
        grandpaNode.selectAll('text')
          .classed('selected_year_circle', false);
        grandpaNode.selectAll('text')
          .attr('class', (d, j) => {
            if (j === i) {
              return 'selected_year_circle';
            }
          });

        if (this.id.includes('Player1')) {
          // Update selected circle in overall view only for player 1.
          that.updateSelectedYearOverallView(i);
          that.selectedYearIndexPlayer1 = i;
        } else {
          that.selectedYearIndexPlayer2 = i;
        }
      });

    circles
      .attr('id', (d, i) => {
        return `circle${i}${player}`;
      })
      .attr('class', (d, i) => {
        if (i === 0) {
          return 'selected_year_circle';
        }
      })
      .classed('year_group_circles', true);

    circles
      .transition()
      .duration(1000)
      .attr('cx', (d, i) => {
        return yearScale(i) + centerOffset;
      })
      .attr('r', 10)
      .style('opacity', 1);

    let yearGroupLabels = d3.select(`#yearGroupLabels${player}`);

    let labels = yearGroupLabels
      .selectAll('text')
      .data(playerData.years);

    let newLables = labels.enter()
      .append('text')
      .attr("text-anchor", "middle")
      .attr('x', this.yearSelectorWidth)
      .attr('y', 15)
      .style('opacity', 0);

    labels.exit()
      .transition()
      .duration(1000)
      .attr('x', this.yearSelectorWidth)
      .style('opacity', 0)
      .remove();

    labels = newLables.merge(labels);

    labels
      .attr('class', (d, i) => {
        if (i === 0) {
          return 'selected_year_circle';
        }
      })
      .transition()
      .duration(1000)
      .text(d => d.year)
      .attr('x', (d, i) => {
        return yearScale(i) + centerOffset;
      })
      .style('opacity', 1);

    // TODO: change color of selected block w/ brush
  }


  /**
   * 
   * @param {String} id id to give the created spider chart
   * @param {Number} x  x-position to translate the spider graph
   * @param {Number} y y-position to translate the spider graph
   * @param {List[String]} labels labels to give the spider chart
   */
  createSpiderChart(id, x, y, labels) {

    // Create the spider chart with the passed in id
    const spiderGroup = this.svg
      .append('g')
      .attr('id', `spiderChart${id}`)
      .attr('transform', `translate(${x}, ${y})`);

    // Create arc generators and a pie chart (this will create the outer ring of the spider chart, sort of like a donut chart)
    const arc = d3.arc()
      .innerRadius(this.spiderChartRadius)
      .outerRadius(this.spiderChartRadius + this.widthOfPieChart);

    const pie = d3.pie()
      .value(360/labels.length)
      .padAngle(0)
      .sort(null);

    // Create pie chart arcs and translate them more onto page
    const pieArcs = spiderGroup
      .append('g')
      .attr('id', 'arcs' + id)
      .attr('transform', 'translate(100,100)');

    // Create the pie arcs
    const arcs = pieArcs 
      .selectAll('.labelArcs')
			.data(pie(labels))
		  .enter().append('path')
			.attr('class', 'labelArcs')
			.attr('id', (d, i) => { 
        // Save this information later for when we need to update
        this.dataToIndex[id][d] = i;
        return 'labelArc' + id + d.data;
      })
      .attr('d', arc);

    // Add an onclick function to the pie arcs to rotate when they are clicked
    arcs
      .on('click', function(d) {
        // Find the angle to which to rotate the spider chart
        const rotate = -1 * ((d.startAngle + d.endAngle)/2 / Math.PI * 180);
        pieArcs
          .transition()
          .attr('transform', `translate(100,100) rotate(${rotate})`)
          .duration(1000);

        text
          .transition()
          .attr('transform', `rotate(${rotate})`)
          .duration(1000);

        chartLines
          .transition()
          .attr('transform', `rotate(${rotate})`)
          .duration(1000);
      });
      
    // TODO: add on click event so it rotates when text eleents are also clicked
    // Append text within the pie chart 
    const text = pieArcs
      .selectAll('.labelText')
      .data(labels)
      .enter()
      .append('text')
      .attr('class', 'labelText')
      .attr('dy', this.widthOfPieChart/2 + 3) // Get in the middle of the arc, seemed to work well
      .attr('x', (d) => {
        // Center the text in the middle of the pie charts (has to be dependent on length of the label, 4.5 times seemed to be a good number)
        return (360/labels.length) - 4.5 * (d.length/2);
      })
      .append('textPath')
      .attr('xlink:href', (d) => {return '#labelArc' + id + d;})
      .text(d => {return d;});


    // Creates the group to translate the lines in
    const chartLines = spiderGroup
      .append('g')
      .attr('transform', 'translate(100,100)')
      .append('g')  // This group needs to be added to rotate
      .attr('class', 'chartLines');

    // Create the group to hold the lines in
    const actualLineGroup = chartLines
      .append('g')
      .attr('transform', 'translate(-100,-100)');  // Untranslate the center movements (hacky)

    // Create lines
    let lines = actualLineGroup
      .selectAll('line')
      .data(labels);
            
  let newLines = lines
      .enter()
      .append('line')
      .attr('x1', this.spiderChartRadius)
      .attr('y1', this.spiderChartRadius)
      .attr('x2', this.spiderChartRadius)
      .attr('y2', this.spiderChartRadius);
        

    lines = newLines.merge(lines);

    lines
        .transition()
        .duration(this.transitionTime)
        .attr('x2', (d,i) => {
          // Going to offset the angles by a little so they are in the middle of each of the pi sections, that's where the 0.5
          // comes into play
          const angle = (Math.PI / 2) + (2 * Math.PI * (i+0.5) / labels.length);
          return this.calculateXValue(angle, this.spiderChartRadius, null, null)
        })
        .attr('y2', (d,i) => {
          // Going to offset the angles by a little so they are in the middle of each of the pi sections, that's where the 0.5
          // comes into play
          const angle = (Math.PI / 2) + (2 * Math.PI * (i+0.5) / labels.length);
          return this.calculateYValue(angle, this.spiderChartRadius, null, null);
        })
        .attr('class', 'linesInSpiderChart');
  }

  /**
   * 
   * @param {*} angle 
   * @param {*} centerRadius 
   * @param {*} outerRadius 
   * @param {*} scale 
   */
  calculateXValue(angle, centerRadius, outerRadius, scale){
    if (scale === null) {
      const x = Math.cos(angle) * centerRadius;
      return centerRadius + x;
    }
    const x = Math.cos(angle) * scale(outerRadius);
    return centerRadius + x;
  }

  /**
   * 
   * @param {*} angle 
   * @param {*} centerRadius 
   * @param {*} outerRadius 
   * @param {*} scale 
   */
  calculateYValue(angle, centerRadius, outerRadius, scale){
    if (scale === null) {
      const y = Math.sin(angle) * centerRadius;
      return centerRadius - y;
    }
    const y = Math.sin(angle) * scale(outerRadius);
    return centerRadius - y;
  }

  /**
   * Used to update the bar charts and the axis for the new player
   */
  updateSpiderChart(id, player, playerData, selectedYearIndex, x, y) {
    // Don't update player 2 stuff if it isn't selected
    if (player === 'Player2' && !this.compareEnable) {
      return;
    }

    // Update spider charts with current year
    const selectedYearData = playerData.years[selectedYearIndex];
    console.log(selectedYearData);

    let dataToUse = null;
    switch (id) {
      case 'Passing' :
        dataToUse = [
          [ 'Touchdowns' , selectedYearData.passing.touchdownPasses ],
          [ 'Interceptions' , selectedYearData.passing.interceptions ],
          [ 'Passing Yards' , selectedYearData.passing.passingYards ],
          [ 'Completions' , selectedYearData.passing.completions ],
          [ 'Attempts' , selectedYearData.passing.attempts ]
        ];
        break;
      case 'Rushing' :
        dataToUse = [
          [ 'Touchdowns' , selectedYearData.rushing.rushingTouchdowns ],
          [ 'Rushing Yards' , selectedYearData.rushing.rushingYards ],
          [ 'Attempts' , selectedYearData.rushing.attempts ],
          [ 'Yards Per Attempt' , selectedYearData.rushing.yardsPerAttempt ]
        ];
        break;
      case 'Receiving' :
        dataToUse = [
          [ 'Touchdowns' , selectedYearData.receiving.receivingTouchdowns ],
          [ 'Receiving Yards' , selectedYearData.receiving.receivingYards ],
          [ 'Receptions' , selectedYearData.receiving.receptions ],
          [ 'Targets' , selectedYearData.receiving.target ],
          [ 'Yards Per Reception' , selectedYearData.receiving.yardsPerReception ]
        ];
        break;
      case 'Points' :
        dataToUse = [
          [ 'Fantasy Points' , selectedYearData.fantasyPoints ],
          [ 'PPR Points' , selectedYearData.ppr ],
          [ 'PPG' , selectedYearData.ppg ],
          [ 'PPRPG' , selectedYearData.pprpg ],
          [ 'Position Rank' , selectedYearData.positionRank ]
        ];
        break;
      default :
        console.log('Unable to find this ID:', id);
        return;
    }

    const spiderChart = d3.select(`#spiderChart${id}`);
    let spiderPlots = spiderChart
      .selectAll('.spiderChartDataPoints')
      .data(dataToUse);

    // New plot points for the spider charts 
    const newSpiderPlots = spiderPlots
      .enter()
      .append('circle')
      .attr('cx', this.spiderChartRadius)
      .attr('cy', this.spiderChartRadius)
      .attr('r', 0)
      .attr('class', 'spiderChartDataPoints');
        

    spiderPlots = newSpiderPlots.merge(spiderPlots);

    spiderPlots
        .transition()
        .duration(this.transitionTime)
        .attr('cx', (d) => {
          const maxValueForThisAttribute = this.maxData[selectedYearData.year][selectedYearData.position][id][i];
          const attributeName = d[0];
          const value = d[1];
          const scale = d3.scaleLinear()
                          .range([0, i])
                          .domain([0, this.spiderChartRadius]);
          const angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
          return this.calculateXValue(angle, this.spiderChartRadius, numberOfCircles, circleRadiusScale)
        })
        .attr('cy', (d) => {
          const angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
          return this.calculateYValue(angle, this.spiderChartRadius, numberOfCircles, circleRadiusScale);
        })
        .attr('r', this.spiderChartPlotCirclesRadiuses)
  }

  createLineGraphs() {

  }

  updateLineGraphs() {

  }

  /**
   * Used for getting the max for scales. Sometimes all the values are 0, so we need the max value to be 1 actually
   * @param {Array} arr Array to get the max of 
   */
  getMax(arr) {
    const max = d3.max(arr);
    if (max === 0)
      return 1;
    return max;
  }

  /**
   * Updates the players data to be viewed. If compare mode is enabled, than player2 is also loaded. Otherwise only
   * player1 is used.
   * @param player1 - Player 1 data.
   * @param player2 - Player 2 data.
   */
  updateCurrentPlayers(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
  }

  /**
   * Set the player view in compare mode with another player.
   * @param compareEnable - Boolean. True for compare mode and false for single player view.
   */
  setCompareMode(compareEnable) {
    this.compareEnable = compareEnable;
  }

  /**
   * Update the selected years with brush over.
   * @param playerGroup - Player group ID.
   */
  updateSelectedYears(playerGroup) {
    let s = d3.event.selection;
    d3.select(`#${playerGroup}`).selectAll('circle')
      .style('fill', d3.schemePaired[0]);
    d3.select(`#${playerGroup}`).selectAll('text')
      .classed('selected_years_brush', false);
    if (!s) {
      return;
    }

    let minIndex = 50;
    let maxIndex = 0;
    d3.select(`#${playerGroup}`).selectAll('circle')
      .filter(function (d, i) {
        let xMin = parseInt(this.attributes.cx.value) - parseInt(this.attributes.r.value);
        let xMax = parseInt(this.attributes.cx.value) + parseInt(this.attributes.r.value);
        let validCircle = (xMin >= s[0] && xMin <= s[1]) || (xMax >= s[0] && xMax <= s[1]);
        if (validCircle) {
          if (i < minIndex) {
            minIndex = i;
          }
          if (i > maxIndex) {
            maxIndex = i;
          }
        }
        return validCircle;
      })
      .style('fill', d3.schemePaired[1]);

    d3.select(`#${playerGroup}`).selectAll('text')
      .filter(function(d, i) {
        return minIndex <= i && i <= maxIndex;
      })
      .classed('selected_years_brush', true);

    if (playerGroup.includes('Player1')) {
      this.yearRangeIndexPlayer1.min = minIndex;
      this.yearRangeIndexPlayer1.max = maxIndex;
    } else {
      this.yearRangeIndexPlayer2.min = minIndex;
      this.yearRangeIndexPlayer2.max = maxIndex;
    }
  }
}