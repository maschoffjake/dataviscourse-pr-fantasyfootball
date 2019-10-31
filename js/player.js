class Player {
  constructor() {
    this.player1 = [];
    this.player2 = [];
    this.compareEnable = false;

    this.svgWidth = 1000;
    this.svgHeight = 1000;
  }

  /**
   * Creates all the component for player view.
   */
  createPlayerView() {
    let svg = d3.select('#playerViewSVGDiv').append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight);

    this.createYearBarAndBrush();
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
  }

  updateYearBarAndBrush () {
    let minDomain = parseInt(d3.min(this.player1.years, d => Object.keys(d)));
    let maxDomain = parseInt(d3.max(this.player1.years, d => Object.keys(d)));

    let yearScale = d3
      .scaleLinear()
      .domain([minDomain, maxDomain + 1])
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
      .attr('x1', d => yearScale(Object.keys(d)))
      .attr('y1', 0)
      .attr('x2', d => yearScale(Object.keys(d)))
      .attr('y2', 0)
      .transition()
      .duration(1000)
      .attr('y2', 50);

    lines = newLines.merge(lines);

    lines.exit()
      .transition()
      .duration(1000)
      .style('opacity', 0)
      .remove();

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