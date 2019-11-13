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
    this.circleBuffer = 10;
    this.transitionTime = 1000;

    this.maxData = maxData;
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

    this.createSpiderChart('Points', spiderChartX, spiderChartY, 5);
    this.createSpiderChart('Passing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer), 5);
    this.createSpiderChart('Rushing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 2, 4);
    this.createSpiderChart('Receiving', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 3, 5);

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

    // Update spider charts
    const playerData = this.player1.years[this.selectedYearIndex];
    // Create data points for each spider chart
    const player1Score = [
      { 'Fantasy Points': playerData.fantasyPoints },
      { 'PPR Points': playerData.ppr },
      { 'PPG': playerData.ppg },
      { 'PPRPG': playerData.pprpg },
      { 'Position Rank': playerData.positionRank }
    ];

    const player1Passing = [
      { 'Touchdowns': playerData.passing.touchdownPasses },
      { 'Interceptions': playerData.passing.interceptions },
      { 'Passing Yards': playerData.passing.passingYards },
      { 'Completions': playerData.passing.completions },
      { 'Attempts': playerData.passing.attempts }
    ];

    const player1Rushing = [
      { 'Touchdowns': playerData.rushing.rushingTouchdowns },
      { 'Rushing Yards': playerData.rushing.rushingYards },
      { 'Attempts': playerData.rushing.attempts },
      { 'Yards Per Attempt': playerData.rushing.yardsPerAttempt }
    ];

    const player1Receiving = [
      { 'Touchdowns': playerData.receiving.receivingTouchdowns },
      { 'Receiving Yards': playerData.receiving.receivingYards },
      { 'Receptions': playerData.receiving.receptions },
      { 'Targets': playerData.receiving.target },
      { 'Yards Per Reception': playerData.receiving.yardsPerReception }
    ];

    if (this.compareEnable) {

    }
    else {    
      this.updateSpiderChart('Passing', player1Passing);
      this.updateSpiderChart('Rushing', player1Rushing);
      this.updateSpiderChart('Receiving', player1Receiving);
      this.updateSpiderChart('Points', player1Score);
    }
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
   * Creates the spider charts for the categories of a player's stats
   */
  createSpiderChart(id, x, y, numberOfPoints) {

    // Create the passing spider chart
    const spiderGroup = this.svg
      .append('g')
      .attr('id', `spiderChart${id}`)
      .attr('transform', `translate(${x}, ${y})`);

    // Create circles which go around the spider chart
    const numberOfCircles = 5;
    const ticks = [...Array(numberOfCircles).keys()];
    const cirleRadiusScale = d3.scaleLinear()
                              .domain([0, numberOfCircles])
                              .range([0, this.spiderChartRadius]);

    spiderGroup
      .selectAll('circle')
      .data(ticks)
      .enter()
      .append('circle')
      .attr('cx', this.spiderChartRadius)
      .attr('cy', this.spiderChartRadius)
      .attr('r', d => {
        return cirleRadiusScale(d + 1)
      })
      .classed('spider-chart-circles', true);

    // Create lines
    
  }

  calculateAngle(angle, centerRadius, outerRadius, scale){
    const x = Math.cos(angle) * scale(outerRadius);
    const y = Math.sin(angle) * scale(outerRadius);
    return {"x": centerRadius + x, "y": centerRadius - y};
  }

  /**
   * Used to update the bar charts and the axis for the new player
   */
  updateSpiderChart(id, data1, data2, x, y) {
    let spiderChart = d3.select(`#spiderChart${id}`);
    console.log(spiderChart);
    console.log(data1);
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