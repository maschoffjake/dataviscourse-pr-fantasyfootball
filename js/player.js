class Player {
  constructor(updateSelectedYearOverallView, maxData) {
    this.player1 = null;
    this.player2 = null;
    this.compareEnable = false;

    // Callbacks
    this.updateSelectedYearOverallView = updateSelectedYearOverallView;

    this.svgWidth = 1300;
    this.svgHeight = 1350;

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
    this.circleBuffer = 100;
    this.transitionTime = 1000;

    this.widthOfPieChart = 25;

    // Need to save what data is being stored in each quadrant, so we can create the spider plots in correct area
    // This will be used in updateSpiderCharts
    this.dataToRadian = {
      'Points': {},
      'Passing': {},
      'Rushing': {},
      'Receiving': {}
    };
    this.spiderChartPlotCirclesRadiuses = 3;
    this.maxData = maxData;

    this.lineGraphWidth = 750;
    this.lineGraphHeight = 300;

    this.spiderChartDialogWidth = 300;
  }

  /**
   * Creates all the component for player view.
   */
  createPlayerView() {
    this.svg = d3.select('#playerViewSVGDiv').append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);

    let spiderChartX = 25;
    let spiderChartY = 175;

    this.createYearBarAndBrush('Player2');
    this.createYearBarAndBrush('Player1');

    // Create the spider charts
    const pointLabels = ['Fantasy Points', 'PPR Points', 'PPG', 'PPRPG', 'Position Rank'];
    const passingLabels = ['Touchdowns', 'Interceptions', 'Passing Yards', 'Completions', 'Attempts'];
    const rushingLabels = ['Touchdowns', 'Rushing Yards', 'Attempts', 'Yards Per Attempt'];
    const receivingLabels = ['Touchdowns', 'Receiving Yards', 'Receptions', 'Targets', 'Yards Per Reception'];
    this.createSpiderChart('Points', spiderChartX, spiderChartY, pointLabels);
    this.createSpiderChart('Passing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer), passingLabels);
    this.createSpiderChart('Rushing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 2, rushingLabels);
    this.createSpiderChart('Receiving', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 3, receivingLabels);

    // Create the tooltips associated with the spider charts
    this.createSpiderChartToolTip('Points', spiderChartX, spiderChartY);
    this.createSpiderChartToolTip('Passing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer));
    this.createSpiderChartToolTip('Rushing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 2);
    this.createSpiderChartToolTip('Receiving', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 3);

    let lineGraphOffsetX = 550;
    let lineGraphOffsetY = 150;
    this.createLineGraphs('points', 'Points', lineGraphOffsetX, lineGraphOffsetY);
    this.createLineGraphs('passing', 'Passing', lineGraphOffsetX, lineGraphOffsetY);
    this.createLineGraphs('rushing', 'Rushing', lineGraphOffsetX, lineGraphOffsetY);
    this.createLineGraphs('receiving', 'Receiving', lineGraphOffsetX, lineGraphOffsetY);
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

    this.updateSpiderChartDriver();

    let lineGraphOffsetX = 550;
    let lineGraphOffsetY = 150;
    let lineGraphYBuffer = 0;
    this.updateLineGraphs('points', lineGraphOffsetX, lineGraphOffsetY,
      ['fantasyPoints', 'ppg', 'ppr', 'pprpg', 'positionRank']);
    this.updateLineGraphs('passing', lineGraphOffsetX, lineGraphOffsetY + this.lineGraphHeight + lineGraphYBuffer,
      ['attempts', 'completions', 'interceptions', 'passingYards', 'touchdownPasses']);
    this.updateLineGraphs('rushing', lineGraphOffsetX, lineGraphOffsetY + (this.lineGraphHeight * 2) + lineGraphYBuffer,
      ['target', 'reception', 'receivingYards', 'yardsPerReception', 'receivingTouchdowns']);
    this.updateLineGraphs('receiving', lineGraphOffsetX, lineGraphOffsetY + (this.lineGraphHeight * 3) + lineGraphYBuffer,
      ['attempts', 'rushingYards', 'yardsPerAttempt', 'rushingTouchdowns']);
  }

  /**
   * Updates the spider charts.
   */
  updateSpiderChartDriver() {
    this.updateSpiderChart('Passing', 'Player1', this.player1, this.selectedYearIndexPlayer1, 5);
    this.updateSpiderChart('Rushing', 'Player1', this.player1, this.selectedYearIndexPlayer1, 4);
    this.updateSpiderChart('Receiving', 'Player1', this.player1, this.selectedYearIndexPlayer1, 5);
    this.updateSpiderChart('Points', 'Player1', this.player1, this.selectedYearIndexPlayer1, 5);

    this.updateSpiderChart('Passing', 'Player2', this.player2, this.selectedYearIndexPlayer2, 5);
    this.updateSpiderChart('Rushing', 'Player2', this.player2, this.selectedYearIndexPlayer2, 4);
    this.updateSpiderChart('Receiving', 'Player2', this.player2, this.selectedYearIndexPlayer2, 5);
    this.updateSpiderChart('Points', 'Player2', this.player2, this.selectedYearIndexPlayer2, 5);
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
          .attr('class', function (d, j) {
            let toReturn = d3.select(this).attr('class');
            if (j === i) {
              toReturn += ` selected_year_circle`;
            }
            return toReturn;
          });

        if (this.id.includes('Player1')) {
          // Update selected circle in overall view only for player 1.
          that.updateSelectedYearOverallView([i]);
          that.selectedYearIndexPlayer1 = i;
        } else {
          that.selectedYearIndexPlayer2 = i;
        }
        that.updateSpiderChartDriver();
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
   * Creates the barbones of the spider charts, ie groups, transitions, text, lines, spiderChartPlotPoints
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
         this.dataToRadian[id][d.data] = (d.startAngle + d.endAngle)/2;
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

        spiderPlotGroup
          .transition()
          .attr('transform', `rotate(${rotate})`)
          .duration(1000);

        spiderPlotPathGroup
          .transition()
          .attr('transform', `rotate(${rotate})`)
          .duration(1000);

        // Turn off the already selected pie arc
        d3.select(`#spiderChart${id}`).select('.selectedArc')
          .attr('class', 'labelArcs');

        // Turn this arc to the select one
        d3.select(this)
          .attr('class', 'selectedArc');
      });
    
    let that = this;

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
      .text(d => {return d;})
      .on('click', function(d) {
        // Find the angle to which to rotate the spider chart
        const rotate = -1 * (that.dataToRadian[id][d] / Math.PI * 180);
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

        spiderPlotGroup
          .transition()
          .attr('transform', `rotate(${rotate})`)
          .duration(1000);

        spiderPlotPathGroup
          .transition()
          .attr('transform', `rotate(${rotate})`)
          .duration(1000);

        // Turn off the already selected pie arc
        d3.select(`#spiderChart${id}`).select('.selectedArc')
          .attr('class', 'labelArcs');


        // Turn this arc to the select one
        const group = d3.select(`#spiderChart${id}`);
        const arcGroup = group.select(`#arcs${id}`);
        const arcs = arcGroup.selectAll('path');
        // Was unable to do this with D3... kept returning an empty selection so did it manually
        for (let item of arcs._groups[0]) {
          if (item.id === `labelArc${id}${d}`) {
            item.className.baseVal = 'selectedArc';
            break;
          }
        }
      });


    // Creates the group to translate the lines in
    const chartLines = spiderGroup
      .append('g')
      .attr('transform', 'translate(100,100)')
      .append('g')  // This group needs to be added to rotate
      .attr('class', 'chartLines');

    // Create the group to hold the lines in
    const actualLineGroup = chartLines
      .append('g')
      .attr('transform', 'translate(-100,-100)');  // Untranslate the center movements (hacky) must be kept or it will rotate off the page

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
      .attr('y2', this.spiderChartRadius)
      .attr('class', 'linesInSpiderChart');

    lines = newLines.merge(lines);

    lines
        .transition()
        .duration(this.transitionTime)
        .attr('x2', (d,i) => {
          // Going to offset the angles by a little so they are in the middle of each of the pi sections, that's where the 0.5
          // comes into play
          const angle = (Math.PI / 2) + (2 * Math.PI * (i+.5) / labels.length);
          return this.calculateXValue(angle, this.spiderChartRadius, null, null);
        })
        .attr('y2', (d,i) => {
          // Going to offset the angles by a little so they are in the middle of each of the pi sections, that's where the 0.5
          // comes into play
          const angle = (Math.PI / 2) + (2 * Math.PI * (i+.5) / labels.length);
          return this.calculateYValue(angle, this.spiderChartRadius, null, null);
        });

    // Create a group for spider chart plot points to rotate
    const spiderPlotGroup = spiderGroup
        .append('g')
        .attr('transform', 'translate(100,100)')
        .append('g')
        .attr('class', `spiderChartSpiderPlots`);

    // Create points for player 1 (compare mode)
    const actualSpiderPlotGroupPlayer1 = spiderPlotGroup
        .append('g')
        .attr('transform', 'translate(-100,-100)')  // Hacky way to get a group to rotate, have to keep this or it breaks...
        .attr('id', `spiderChart${id}SpiderPlotsPlayer1`);

    let spiderPlotPoints = actualSpiderPlotGroupPlayer1
        .selectAll('spiderChartDataPointsPlayer1')
        .data(labels);
    
    spiderPlotPoints
        .enter()
        .append('circle')
        .attr('cx', this.spiderChartRadius)
        .attr('cy', this.spiderChartRadius)
        .attr('r', 0)
        .attr('class', 'spiderChartDataPointsPlayer1');

    // Create points for player 2 (compare mode)
    const actualSpiderPlotGroupPlayer2 = spiderPlotGroup
        .append('g')
        .attr('transform', 'translate(-100,-100)')  // Hacky way to get a group to rotate, have to keep this or it breaks...
        .attr('id', `spiderChart${id}SpiderPlotsPlayer2`);

    spiderPlotPoints = actualSpiderPlotGroupPlayer2
        .selectAll('spiderChartDataPointsPlayer2')
        .data(labels);
    
    spiderPlotPoints
        .enter()
        .append('circle')
        .attr('cx', this.spiderChartRadius)
        .attr('cy', this.spiderChartRadius)
        .attr('r', 0)
        .attr('class', 'spiderChartDataPointsPlayer2');

    // Create a group for the spider plot lines to be roated in
    const spiderPlotPathGroup = spiderGroup
        .append('g')
        .attr('transform', 'translate(100,100)')
        .append('g');

    // Create a path for player 1 (compare mode)
    // Must create defaul path of same dimensions in order for it to translate on startup
    spiderPlotPathGroup
        .append('g')
        .attr('transform', 'translate(-100,-100)')
        .attr('id', `spiderChart${id}Path`)
        .append('path')
        .attr('d', `M ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius}`)
        .attr('class', 'spiderChartPlotPathPlayer1');

    // Create a path for player 2 (compare mode)
    // Must create defaul path of same dimensions in order for it to translate on startup
    spiderPlotPathGroup
      .append('g')
      .attr('transform', 'translate(-100,-100)')
      .attr('id', `spiderChart${id}Path`)
      .append('path')
      .attr('d', `M ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius} L ${this.spiderChartRadius} ${this.spiderChartRadius}`)
      .attr('class', 'spiderChartPlotPathPlayer2');
  }

  /**
   * Used to calculate the X-value for the spider circle chart
   * @param {Number} angle Angle that this is being protruded out of from the center of the chart
   * @param {Number} centerRadius The X-position of the center of the spider chart
   * @param {Number} value Value that you would like to display along this angle
   * @param {D3 Scale} scale Scale to use to get this value
   */
  calculateXValue(angle, centerRadius, value, scale){
    // If no scale provided, just use the entire radius
    if (scale === null) {
      const x = Math.cos(angle) * centerRadius;
      return centerRadius + x;
    }
    const x = Math.cos(angle) * scale(value);
    return centerRadius + x;
  }

  /**
   * Used to calculate the Y-value for the spider circle chart
   * @param {Number} angle Angle that this is being protruded out of from the center of the chart
   * @param {Number} centerRadius The Y-position of the center of the spider chart
   * @param {Number} value Value that you would like to display along this angle
   * @param {D3 Scale} scale Scale to use to get this value
   */
  calculateYValue(angle, centerRadius, value, scale){
    // If no scale provided, just use the entire radius
    if (scale === null) {
      const y = Math.sin(angle) * centerRadius;
      return centerRadius - y;
    }
    const y = Math.sin(angle) * scale(value);
    return centerRadius - y;
  }

  /**
   * Used to update the spider charts
   * @param {String} id ID of the spiderChart to update (ie: 'Passing', 'Rushing' etc)
   * @param {String} player Used to indicate which player we are updating (ie: 'Player1' or 'Player2')
   * @param {PlayerObject} playerData The player obejct data
   * @param {Number} selectedYearIndex The current year that we are analyzing
   */
  updateSpiderChart(id, player, playerData, selectedYearIndex) {
    // Don't update player 2 stuff if it isn't selected
    if (player === 'Player2' && !this.compareEnable) {
      return;
    }

    // Update spider charts with current year
    const selectedYearData = playerData.years[selectedYearIndex];

    let dataToUse = null;
    switch (id) {
      case 'Passing' :
        dataToUse = [
          [ 'Touchdowns' , selectedYearData.passing.touchdownPasses == null ? 0 : selectedYearData.passing.touchdownPasses ],
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

    // UPDATE THE PLOT POINTS
    const spiderPlotPoints = d3.select(`#spiderChart${id}SpiderPlots${player}`).selectAll(`.spiderChartDataPoints${player}`).data(dataToUse);

    spiderPlotPoints
        .transition()
        .duration(this.transitionTime)
        .attr('cx', (d) => {
          const attributeName = d[0];
          const maxValueForThisAttribute = this.maxData[selectedYearData.year][selectedYearData.position][id][attributeName];
          const value = d[1];
          // Position Rank scale is inverted, 1 is the best and max is the worst
          let scale;
          if (attributeName === 'Position Rank') {
            scale = d3.scaleLinear()
              .domain([maxValueForThisAttribute, 1])
              .range([0, this.spiderChartRadius]);
          }
          else {
            scale = d3.scaleLinear()
              .domain([0, maxValueForThisAttribute])
              .range([0, this.spiderChartRadius]);
          }
          // Since we are moving in opposite direction of unit circle, and also 90 degrees offset, must multiple by -1 and add pi/2
          let radian = this.dataToRadian[id][attributeName];
          radian = -1 * radian + Math.PI/2;
          return this.calculateXValue(radian, this.spiderChartRadius, value, scale);
        })
        .attr('cy', (d) => {
          const attributeName = d[0];
          const maxValueForThisAttribute = this.maxData[selectedYearData.year][selectedYearData.position][id][attributeName];
          const value = d[1];
          let scale;
          // Position Rank scale is inverted, 1 is the best and max is the worst
          if (attributeName === 'Position Rank') {
            scale = d3.scaleLinear()
              .domain([maxValueForThisAttribute, 1])
              .range([0, this.spiderChartRadius]);
          }
          else {
            scale = d3.scaleLinear()
              .domain([0, maxValueForThisAttribute])
              .range([0, this.spiderChartRadius]);
          }
          // Since we are moving in opposite direction of unit circle, and also 90 degrees offset, must multiple by -1 and add pi/2
          let radian = this.dataToRadian[id][attributeName];
          radian = -1 * radian + Math.PI/2;
          return this.calculateYValue(radian, this.spiderChartRadius, value, scale);
        })
        .attr('r', this.spiderChartPlotCirclesRadiuses);

        // UPDATE THE PATH THAT CONNECTS ALL OF THE POINTS
        // Can't really find a good way of doing this with D3...
        // Create path from the data to use
        const spiderChartPath = d3.select(`#spiderChart${id}`).select(`.spiderChartPlotPath${player}`);
        let path = '';
        let count = 0;  // Count used to concatenate the move value on to the string first
        for (let item of dataToUse) {
          const attributeName = item[0];
          const maxValueForThisAttribute = this.maxData[selectedYearData.year][selectedYearData.position][id][attributeName];
          const value = item[1];
          // Position Rank scale is inverted, 1 is the best and max is the worst
          let scale;
          if (attributeName === 'Position Rank') {
            scale = d3.scaleLinear()
              .domain([maxValueForThisAttribute, 1])
              .range([0, this.spiderChartRadius]);
          }
          else {
            scale = d3.scaleLinear()
              .domain([0, maxValueForThisAttribute])
              .range([0, this.spiderChartRadius]);
          }
          // Since we are moving in opposite direction of unit circle, and also 90 degrees offset, must multiple by -1 and add pi/2
          let radian = this.dataToRadian[id][attributeName];
          radian = -1 * radian + Math.PI/2;
          const xValue = this.calculateXValue(radian, this.spiderChartRadius, value, scale);
          const yValue = this.calculateYValue(radian, this.spiderChartRadius, value, scale);
          
          // Add the move value to the front of the string initially
          if (count === 0) {
            count++;
            path += `M ${xValue} ${yValue}`;
          }
          // Otherwise append lines to each points
          else {
            path += `L ${xValue} ${yValue}`;
          }
        }
        path += ' Z';
        spiderChartPath
          .transition()
          .attr('d', path)
          .duration(1000);
  }

    /**
   * Creates the side tooltip for the spider chart to display the statistics for it
   * @param {String} id ID for the current tooltip
   * @param {Number} x Where to translate the tooltip (x position)
   * @param {Number} y Where to translate the tooltip (y position)
   */
  createSpiderChartToolTip(id, x, y) {
    // Create the spider chart with the passed in id
    const toolTip = this.svg
        .append('g')
        .attr('id', `spiderChartToolTip${id}`)
        .attr('transform', `translate(${x}, ${y})`);
  }

  /**
   * Used to update the tooltips next to the spider charts
   * @param {String} id ID of the spiderChartToolTip to update (ie: 'Passing', 'Rushing' etc)
   * @param {String} player Used to indicate which player we are updating (ie: 'Player1' or 'Player2')
   * @param {PlayerObject} playerData The player obejct data
   * @param {Number} selectedYearIndex The current year that we are analyzing
   */
  updateSpiderChartToolTip(id, player, playerData, selectedYearIndex) {

  }

  createLineGraphs(id, label, x, y) {
    let lineGraph = this.svg.append('g')
      .attr('id', `${id}LineGraph`)
      .style('opacity', 0)
      .attr('width', this.lineGraphWidth)
      .attr('transform', `translate(${x}, ${y})`);

    lineGraph.append('text')
      .attr('class', 'line_graph_title')
      .text(label);

    lineGraph.append('g')
      .attr('id', `${id}YearAxis`);

    lineGraph.append('g')
      .attr('id', `${id}Lines`);
  }

  /**
   * Updates the line graph for the category.
   * @param id - ID of the group that needs to be updated
   * @param x - X position of the group
   * @param y - Y position of the group
   * @param attributes
   * @param data
   */
  updateLineGraphs(id, x, y, attributes) {
    let lineGraph = this.svg.select(`#${id}LineGraph`);

    lineGraph
      .transition()
      .duration(this.transitionTime)
      .style('opacity', 1)
      .attr('transform', `translate(${x}, ${y})`);

    let startYear = parseInt(this.player1.years[0].year);
    let endYear = parseInt(this.player1.years[this.player1.years.length - 1].year);

    if (this.compareEnable) {
      let player2StartYear = parseInt(this.player2.years[0].year);
      let player2EndYear = parseInt(this.player2.years[this.player2.years.length - 1].year);
      if (startYear > player2StartYear) {
        startYear = player2StartYear;
      }
      if (endYear < player2EndYear) {
        endYear = player2EndYear;
      }
    }

    let yearScale = d3
      .scaleLinear()
      .domain([startYear, endYear])
      .range([0, this.lineGraphWidth - 25]);

    let formatedDataPlayer = this.formatDataForLineGraph(this.player2, attributes, id, 'player1', yearScale);
    if (this.compareEnable) {
      formatedDataPlayer = formatedDataPlayer.concat(this.formatDataForLineGraph(this.player2, attributes, id, 'player2', yearScale));
    }

    let yearAxis = d3.axisBottom()
      .tickFormat(d3.format('d'))
      .ticks(endYear - startYear)
      .scale(yearScale);

    let yearAxisGroup = d3.select(`#${id}YearAxis`);

    yearAxisGroup
      .transition()
      .duration(1000)
      .call(yearAxis);

    yearAxisGroup
      .transition()
      .duration(this.transitionTime)
      .attr('transform', `translate(0, ${this.lineGraphHeight-50})`);

    //This is the accessor function we talked about above
    let lineFunction = d3.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; })
      .curve(d3.curveLinear);


    let lineGroup = lineGraph.select(`#${id}Lines`);

    let lines = lineGroup
      .selectAll('path')
      .data(formatedDataPlayer);

    let newLines = lines.enter()
      .append('path')
      .style('opacity', 0);

    lines.exit()
      .transition()
      .duration(this.transitionTime)
      .style('opacity', 0)
      .remove();

    lines = newLines.merge(lines);

    lines
      // .transition()
      // .duration(this.transitionTime)
      .attr('d', (d) => {
        console.log(d.years);
        return lineFunction(d.years); })
      .attr('id', (d) => { return d.elementID; })
      .style('fill', 'none')
      .style('stroke', 'black')
      .style('opacity', 1);
  }

  /**
   * Formats player data to be used for line graphs
   * @param player - player for the line graph
   * @param id - id of the line graph group
   * @param attributes
   * @param playerID
   * @param yearScale
   */
  formatDataForLineGraph(player, attributes, id, playerID, yearScale) {
    let toReturn = [];
    attributes.forEach((d) => {
      let toAdd = {};
      toAdd.id = d;
      toAdd.elementID = d + playerID;
      toAdd.min = d3.min(player.years, (yearObj) => {
        if (id === 'points') {
          return yearObj[d];
        }
        return yearObj[id][d];
      });
      toAdd.max = d3.max(player.years, (yearObj) => {
        if (id === 'points') {
          return yearObj[d];
        }
        return yearObj[id][d];
      });

      let dataScale = d3.scaleLinear()
        .domain([toAdd.min, toAdd.max])
        .range([0, this.lineGraphHeight - 50]);

      toAdd.years = [];
      player.years.forEach((yearObj) => {
        let value = yearObj[d];
        if (id !== 'points') {
          value = yearObj[id][d];
        }
        console.log(d);
        console.log(value);
        value = dataScale(parseFloat(value));
        if (!value) {
          value = 0;
        }
        let toAddObj = {
          'x': yearScale(parseInt(yearObj.year)),
          'y': value
        };
        toAdd.years.push(toAddObj);
      });
      toReturn.push(toAdd);
    });
    return toReturn;
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

    if (minIndex > 10) {
      minIndex = 0;
    }

    let updateOverallViewToggle = false;

    if (playerGroup.includes('Player1')) {
      if (this.yearRangeIndexPlayer1.min !== minIndex || this.yearRangeIndexPlayer1.max !== maxIndex) {
        updateOverallViewToggle = true;
      }
      this.yearRangeIndexPlayer1.min = minIndex;
      this.yearRangeIndexPlayer1.max = maxIndex;
    } else {
      if (this.yearRangeIndexPlayer2.min !== minIndex || this.yearRangeIndexPlayer2.max !== maxIndex) {
        updateOverallViewToggle = true;
      }
      this.yearRangeIndexPlayer2.min = minIndex;
      this.yearRangeIndexPlayer2.max = maxIndex;
    }

    if (updateOverallViewToggle) {
      let yearsToForward = [];
      yearsToForward.push([this.yearRangeIndexPlayer1.min, this.yearRangeIndexPlayer1.max]);
      if (this.compareEnable) {
        yearsToForward.push([this.yearRangeIndexPlayer2.min, this.yearRangeIndexPlayer2.max]);
      }
      this.updateSelectedYearOverallView(yearsToForward);
    }
  }
}