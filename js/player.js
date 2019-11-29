class Player {
  constructor(updateSelectedYearOverallView, maxData) {
    this.player1 = null;
    this.player2 = null;
    this.compareEnable = false;

    // Callbacks
    this.updateSelectedYearOverallView = updateSelectedYearOverallView;

    this.svgWidth = 1300;
    this.svgHeight = 1100;

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
    const pointLabels = ['Fantasy Points', 'PPR Points', 'PPG', 'PPRPG', 'Position Rank'];
    const passingLabels = ['Touchdowns', 'Interceptions', 'Passing Yards', 'Completions', 'Attempts'];
    const rushingLabels = ['Touchdowns', 'Rushing Yards', 'Attempts', 'Yards Per Attempt'];
    const receivingLabels = ['Touchdowns', 'Receiving Yards', 'Receptions', 'Targets', 'Yards Per Reception'];
    this.createSpiderChart('Points', spiderChartX, spiderChartY, pointLabels);
    this.createSpiderChart('Passing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer), passingLabels);
    this.createSpiderChart('Rushing', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 2, rushingLabels);
    this.createSpiderChart('Receiving', spiderChartX, spiderChartY + (this.spiderChartRadius * 2 + this.circleBuffer) * 3, receivingLabels);
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
  createSpiderChart(id, x, y, labels) {

    // Create the passing spider chart
    const spiderGroup = this.svg
      .append('g')
      .attr('id', `spiderChart${id}`)
      .attr('transform', `translate(${x}, ${y})`);

    // Create circles which go around the spider chart
    const numberOfCircles = 5;
    const ticks = [...Array(numberOfCircles).keys()];
    const circleRadiusScale = d3.scaleLinear()
                              .domain([0, numberOfCircles])
                              .range([0, this.spiderChartRadius]);

    let circles = spiderGroup
      .selectAll('circle')
      .data(ticks);

    let newCircles = circles  
      .enter()
      .append('circle')
      .attr('cx', this.spiderChartRadius)
      .attr('cy', this.spiderChartRadius)
      .attr('r', 0)
      .classed('spider-chart-circles', true);

    // Create lines and labels
    let lines = spiderGroup
      .selectAll('line')
      .data(labels);

    let textLabels = spiderGroup
      .selectAll('text')
      .data(labels);
              
    let newLines = lines
        .enter()
        .append('line')
        .attr('x1', this.spiderChartRadius)
        .attr('y1', this.spiderChartRadius)
        .attr('x2', this.spiderChartRadius)
        .attr('y2', this.spiderChartRadius);

    let newLabels = textLabels
        .enter()
        .append('text')
        .attr('x', (d, i) => {
          const angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
          return this.calculateXValue(angle, this.spiderChartRadius, numberOfCircles, circleRadiusScale)
        })
        .attr('y', (d, i) => {
          const angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
          return this.calculateYValue(angle, this.spiderChartRadius, numberOfCircles, circleRadiusScale);
        })
        .text(d => {
          return d;
        })
        .style('opacity', 0);

    lines = newLines.merge(lines);
    textLabels = newLabels.merge(textLabels);
    circles = newCircles.merge(circles);

    lines
        .transition()
        .duration(this.transitionTime)
        .attr('x2', (d,i) => {
          const angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
          return this.calculateXValue(angle, this.spiderChartRadius, numberOfCircles, circleRadiusScale)
        })
        .attr('y2', (d,i) => {
          const angle = (Math.PI / 2) + (2 * Math.PI * i / labels.length);
          return this.calculateYValue(angle, this.spiderChartRadius, numberOfCircles, circleRadiusScale);
        })
        .attr('stroke','black');

    circles
      .transition()
      .duration(this.transitionTime)
      .attr('r', d => {
        return circleRadiusScale(d + 1)
      });

    textLabels
      .transition()
      .duration(this.transitionTime)
      .style('opacity', 1);

  }

  calculateXValue(angle, centerRadius, outerRadius, scale){
    const x = Math.cos(angle) * scale(outerRadius);
    return centerRadius + x;
  }

  calculateYValue(angle, centerRadius, outerRadius, scale){
    const y = Math.sin(angle) * scale(outerRadius);
    return centerRadius - y;
  }

  /**
   * Used to update the bar charts and the axis for the new player
   */
  updateSpiderChart(id, player, playerData, selectedYearIndex, x, y) {
    if (player === 'Player2' && !this.compareEnable) {
      return;
    }
    // Update spider charts
    const selectedYearData = playerData.years[selectedYearIndex];

    // Create data points for each spider chart
    const playerScore = [
      { 'Fantasy Points': selectedYearData.fantasyPoints },
      { 'PPR Points': selectedYearData.ppr },
      { 'PPG': selectedYearData.ppg },
      { 'PPRPG': selectedYearData.pprpg },
      { 'Position Rank': selectedYearData.positionRank }
    ];

    const playerPassing = [
      { 'Touchdowns': selectedYearData.passing.touchdownPasses },
      { 'Interceptions': selectedYearData.passing.interceptions },
      { 'Passing Yards': selectedYearData.passing.passingYards },
      { 'Completions': selectedYearData.passing.completions },
      { 'Attempts': selectedYearData.passing.attempts }
    ];

    const playerRushing = [
      { 'Touchdowns': selectedYearData.rushing.rushingTouchdowns },
      { 'Rushing Yards': selectedYearData.rushing.rushingYards },
      { 'Attempts': selectedYearData.rushing.attempts },
      { 'Yards Per Attempt': selectedYearData.rushing.yardsPerAttempt }
    ];

    const playerReceiving = [
      { 'Touchdowns': selectedYearData.receiving.receivingTouchdowns },
      { 'Receiving Yards': selectedYearData.receiving.receivingYards },
      { 'Receptions': selectedYearData.receiving.receptions },
      { 'Targets': selectedYearData.receiving.target },
      { 'Yards Per Reception': selectedYearData.receiving.yardsPerReception }
    ];

    let spiderChart = d3.select(`#spiderChart${id}`);
  }

  createLineGraphs() {
    let lineGraphs = this.svg.append('g')
      .attr('id', `lineGraphs`)
      .style('opacity', 0)
      .attr('transform', `translate(430, 125)`);

    this.createLineGraphsHelper(lineGraphs, `receiving`);
    this.createLineGraphsHelper(lineGraphs, `passing`);
    this.createLineGraphsHelper(lineGraphs, `rushing`);
  }

  createLineGraphsHelper(parentGroup, id) {
    let lineGraph = parentGroup.append('g')
      .attr('id', id);

    lineGraph.append('g')
      .attr('id', `${id}Axis`);

    lineGraph.append('g')
      .attr('id', `${id}Lines`);
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