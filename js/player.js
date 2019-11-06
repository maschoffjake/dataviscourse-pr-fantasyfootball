class Player {
  constructor() {
    this.player1 = [];
    this.player2 = [];
    this.compareEnable = false;

    this.svgWidth = 1000;
    this.svgHeight = 1000;

    this.player1Brush = d3.brushX()
      .extent([[0, 0], [500, 50]])
      .on('brush', function () {
        console.log('here');
      });
  }

  /**
   * Creates all the component for player view.
   */
  createPlayerView() {
    this.svg = d3.select('#playerViewSVGDiv').append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);

    this.createYearBarAndBrush();
    this.createBarCharts1Player1Year();
  }

  /**
   *  Updates the player view with the current data values.
   */
  updatePlayerView() {
    this.updateYearBarAndBrush();
  }

  /**
   * Creates year bar scale and brush.
   */
  createYearBarAndBrush () {
    let svg = d3.select('#playerViewSVGDiv').select('svg');

    let yearGroup = svg.append('g')
      .attr('id', 'yearGroup')
      .style('opacity', 0)
      .attr('transform', `translate(50, 50)`);

    yearGroup.append('rect')
      .attr('width', 500)
      .attr('height', 50)
      .classed('yearBar', true);

    yearGroup.append('g')
      .attr('id', 'yearGroupAxis')
      .style('opacity', 0);

    yearGroup
      .append('g')
      .attr('class', 'brush')
      .call(this.player1Brush);
  }

  /**
   * Creates the default view of a single player for a single view (2 bar charts and text for other stats)
   */
  createBarCharts() {

    // Create TDs bar chart
    let TDXScale = d3.scaleLinear()
      .domain([0,0])
      .range([0,0]);

    this.svg.append('g')
      .attr('id', 'tdBarChart')

  }

  /**
   * Updates the year bar to a player's years that they've played
   */
  updateYearBarAndBrush () {
    d3.selectAll(".brush").call(this.player1Brush.move, null);

    let yearScale = d3
      .scaleLinear()
      .domain([0, this.player1.years.length])
      .range([0, 500]);

    let yearAxis = d3.axisBottom()
      .tickValues([])
      .scale(yearScale);

    d3.select('#yearGroupAxis')
      .call(yearAxis);

    let yearGroup = d3.select('#yearGroup');

    yearGroup
      .transition()
      .duration(1000)
      .style('opacity', 1);

    let lines = yearGroup
      .selectAll('line')
      .data(this.player1.years);

    let newLines = lines.enter()
      .append('line')
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
      .attr('x1', (d, i) => { return yearScale(i); })
      .attr('x2', (d, i) => { return yearScale(i); })
      .style('opacity', 1);

    let centerOffset = yearScale(1) / 2;

    let labels = yearGroup
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
      .attr('x', (d, i) => { return yearScale(i) + centerOffset; })
      .style('opacity', 1);

    // TODO: add labels for each block
    // TODO: add brush, reset brush when a new player is selected
    // TODO: change color of selected block w/ brush
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