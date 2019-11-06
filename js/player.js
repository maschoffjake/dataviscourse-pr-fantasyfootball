class Player {
  constructor() {
    this.player1 = [];
    this.player2 = [];
    this.compareEnable = false;

    this.svgWidth = 1300;
    this.svgHeight = 1000;

    this.player1Brush = d3.brushX()
      .extent([[0, 0], [500, 50]])
      .on('brush', function () {
        console.log('here');
      });

    this.rectWidth = 20;
    this.transitionTime = 1000;
  }

  /**
   * Creates all the component for player view.
   */
  createPlayerView() {
    this.svg = d3.select('#playerViewSVGDiv').append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);

    this.createYearBarAndBrush();
    this.createBarCharts();
  }

  /**
   *  Updates the player view with the current data values.
   */
  updatePlayerView() {
    this.updateYearBarAndBrush();
    this.updateBarCharts();
  }

  /**
   * Creates year bar scale and brush.
   */
  createYearBarAndBrush () {
    let yearGroup1 = this.svg.append('g')
      .attr('id', 'yearGroup1')
      .style('opacity', 0)
      .attr('transform', `translate(430, 50)`);

    yearGroup1.append('rect')
      .attr('width', 500)
      .attr('height', 50)
      .classed('year_bar', true);

    yearGroup1.append('g')
      .attr('id', 'yearGroup1Axis')
      .style('opacity', 0);

    yearGroup1.append('g')
      .attr('id', 'yearGroup1Labels');

    yearGroup1.append('g')
      .attr('id', 'yearGroup1Lines');

    yearGroup1
      .append('g')
      .attr('class', 'brush')
      .call(this.player1Brush);
  }

  /**
   * Updates the year bar to a player's years that they've played
   */
  updateYearBarAndBrush () {
    d3.selectAll(".brush").call(this.player1Brush.move, null);

    let yearScale1 = d3
      .scaleLinear()
      .domain([0, this.player1.years.length])
      .range([0, 500]);

    let yearAxis = d3.axisBottom()
      .tickValues([])
      .scale(yearScale1);

    d3.select('#yearGroup1Axis')
      .call(yearAxis);

    let yearGroup = d3.select('#yearGroup1');

    yearGroup
      .transition()
      .duration(1000)
      .style('opacity', 1);

    let yearGroupLines = d3.select('#yearGroup1Lines');

    let lines = yearGroupLines
      .selectAll('line')
      .data(this.player1.years);

    let newLines = lines.enter()
      .append('line')
      .classed('year_group_lines', true)
      .attr('x1', 500)
      .attr('x2', 500)
      .attr('y1', 0)
      .attr('y2', 50)
      .style('opacity', 0);

    lines.exit()
      .transition()
      .duration(1000)
      .attr('x1', 500)
      .attr('x2', 500)
      .style('opacity', 0)
      .remove();

    lines = newLines.merge(lines);

    lines
      .transition()
      .duration(1000)
      .attr('x1', (d, i) => {
        return yearScale1(i);
      })
      .attr('x2', (d, i) => {
        return yearScale1(i);
      })
      .style('opacity', 1);

    let centerOffset = yearScale1(1) / 2;

    let yearGroupLabels = d3.select('#yearGroup1Labels');

    let labels = yearGroupLabels
      .selectAll('text')
      .data(this.player1.years);

    let newLables = labels.enter()
      .append('text')
      .attr("text-anchor", "middle")
      .attr('x', 500)
      .attr('y', 30)
      .style('opacity', 0);

    labels.exit()
      .transition()
      .duration(1000)
      .attr('x', 500)
      .style('opacity', 0)
      .remove();

    labels = newLables.merge(labels);

    labels
      .transition()
      .duration(1000)
      .text(d => Object.keys(d))
      .attr('x', (d, i) => {
        return yearScale1(i) + centerOffset;
      })
      .style('opacity', 1);

    // TODO: change color of selected block w/ brush
  }

    /**
   * Creates the default view of a single player for a single view (2 bar charts and text for other stats)
   */
  createBarCharts() {

    // 90

    // Create TDs bar chart
    let xAxisLabels = ['Passing', 'Rushing', 'Receiving'];

    let xlinearScale = d3.scaleLinear()
      .domain([0, 2])
      .range([this.svgWidth/10, this.svgWidth/2 - this.svgWidth/10]);
    
    this.svg.append('g')
      .attr('id', 'tdXBarChartAxis')
      .attr('transform', 'translate(0,400)')
      .selectAll('text')
      .data(xAxisLabels)
      .enter()
      .append('text')
      .attr('x', function(d, i) {
        return xlinearScale(i);
      })
      .text(function(d) {
        return d;
      });

    // Y labels
    let ylinearScale = d3.scaleLinear()
      .domain([60, 0])
      .range([0,200]);

    this.svg.append('g')
      .attr('id', 'tdYBarChartAxis')
      .attr('transform', `translate(${this.svgWidth/12},180)`);

    // Create rects
    this.svg
      .append('g')
      .attr('id', 'tdBars')
      .attr('transform', 'translate(0, 380) scale(1,-1)')
      .selectAll('rect')
      .data(xAxisLabels)
      .enter()
      .append('rect')
      .attr('x', (d,i) => {
        return xlinearScale(i);
      })
      .attr('width', this.rectWidth);


    // Create yards bar chart
    // X labels
    xlinearScale = d3.scaleLinear()
      .domain([0, 2])
      .range([this.svgWidth/2 + this.svgWidth/10, this.svgWidth - this.svgWidth/10]);
    
    this.svg.append('g')
      .attr('id', 'yardsBarChart')
      .attr('transform', 'translate(0,400)')
      .selectAll('text')
      .data(xAxisLabels)
      .enter()
      .append('text')
      .attr('x', function(d, i) {
        return xlinearScale(i);
      })
      .text(function(d) {
        return d;
      });

    // Y labels
    ylinearScale = d3.scaleLinear()
      .domain([5000, 0])
      .range([0,200]);

  this.svg.append('g')
    .attr('id', 'yardsYBarChartAxis')
    .attr('transform', `translate(${this.svgWidth/12 + this.svgWidth/2},180)`);

    // Create rects
    this.svg
      .append('g')
      .attr('id', 'yardsBars')
      .attr('transform', 'translate(0, 380) scale(1,-1)')
      .selectAll('rect')
      .data(xAxisLabels)
      .enter()
      .append('rect')
      .attr('x', (d,i) => {
        return xlinearScale(i);
      })
      .attr('width', this.rectWidth);
  }

  /**
   * Used to update the bar charts and the axis for the new player
   */
  updateBarCharts() {

    // Just update on first year, since we can't select years yet
    // TODO: change this to dynamically grab correct year
    let playerStats = this.player1.years[0][[Object.keys(this.player1.years[0])[0]]];

    let passing = playerStats.passing;
    let receiving = playerStats.receiving;
    let rushing = playerStats.rushing;

    let TDData = [Number(passing.touchdownPasses), Number(rushing.rushingTouchdowns), Number(receiving.receivingTouchdowns)];
    let yardData = [Number(passing.passingYards), Number(rushing.rushingYards), Number(receiving.receivingYards)];

    // Create scales
    let axisTDScale = d3.scaleLinear()
      .domain([d3.max(TDData), 0])
      .range([0,200]);

    let TDBarScale = d3.scaleLinear()
      .domain([0, d3.max(TDData)])
      .range([0,200]);

    let axisYardsScale = d3.scaleLinear()
      .domain([d3.max(yardData), 0])
      .range([0,200]);

    let yardsBarScale = d3.scaleLinear()
      .domain([0, d3.max(yardData)])
      .range([0,200]);

    // Update the bars
    d3.select('#tdBars')
      .selectAll('rect')
      .data(TDData)
      .transition()
      .duration(this.transitionTime)
      .attr('height', d => {
        return TDBarScale(d);
      });

    d3.select('#yardsBars')
      .selectAll('rect')
      .data(yardData)
      .transition()
      .duration(this.transitionTime)
      .attr('height', d => {
        return yardsBarScale(d);
      });

    // Update the axis
    d3.select('#tdYBarChartAxis')
      .transition()
      .duration(this.transitionTime)
      .call(d3.axisLeft(axisTDScale))
      .call(g => {
          // Remove the line
          g.select('.domain').remove();
      });

    d3.select('#yardsYBarChartAxis')
      .transition()
      .duration(this.transitionTime)
      .call(d3.axisLeft(axisYardsScale))
      .call(g => {
          // Remove the line
          g.select('.domain').remove();
      });
      
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
  compareMode(compareEnable) {
    this.compareEnable = compareEnable;
  }
}