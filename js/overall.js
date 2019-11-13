class Overall {

    constructor(data, updateSelectedPlayer) {
        this.allData = data;
        this.overallData = data;
        this.player1 = null;
        this.player2 = null;
        this.updateSelectedPlayer = updateSelectedPlayer; //will need to extract actual player object from this.allData for selected circle
        this.selectedYear = 0;
        this.compareEnable = false;
        this.xIndicator = 'fantasyPoints';
        this.yIndicator = 'gamesStarted';
        this.dropdownData = [
            ['fantasyPoints', 'Fantasy Points'],
            ['age', 'Age'],
            ['games', 'Games'],
            ['gamesStarted', 'Games Started'],
            ['PASScompletions', 'Pass Completions'],
            ['PASSattempts', 'Pass Attempts'],
            ['PASSpassingYards', 'Passing Yards'],
            ['PASStouchdownPasses', 'Touchdown Passes'],
            ['PASSinterceptions', 'Interceptions'],
            ['RUSHattempts', 'Rush Attempts'],
            ['RUSHrushingYards', 'Rushing Yards'],
            ['RUSHyardsPerAttempt', 'Yards Per Attempt'],
            ['RUSHrushingTouchdowns', 'Rushing Touchdowns'],
            ['RECtarget', 'Target'],
            ['RECreceptions', 'Receptions'],
            ['RECreceivingYards', 'Receiving Yards'],
            ['RECyardsPerReception', 'Yards / Reception'],
            ['RECreceivingTouchdowns', 'Receiving Touchdowns']
        ];
    }

    createChart() {
        this.parseDataForYear("2016", 'QB');

        //Create a group for the overall chart
        let overallDiv = d3.select('#overallView');

        //Create an svg for the chart and add a header
        overallDiv
            .append('svg')
            .attr('width', 500)
            .attr('height', 800)
            .append('g')
            .attr('id', 'overallChartGroup')
            .append('text')
            .text('Overall Data for Year')
            .style('font-size', '38px')
            .attr('x', 100)
            .attr('y', 150);

        //Create the x-axis label to display the data being represented
        let chartGroup = overallDiv.select('g');
        chartGroup
            .append('text')
            .attr('id', 'xAxisLabel')
            .attr('transform', 'translate(225, 700)')
            .text('Fantasy Points')
            .classed('axisLabel', true);
        //Create the y-axis label to display the data being represented (should always be player name)
        chartGroup
            .append('text')
            .attr('id', 'yAxisLabel')
            .attr('transform', 'translate(20, 470) rotate(90) scale(-1,-1)')
            .text('Player Names')
            .classed('axisLabel', true);

        //Get fantasy points from parsed data to find the max to be displayed on the x-axis
        let ptList = [];
        this.overallData.forEach(function(player) {
            ptList.push(player.year.fantasyPoints);
        });

        //Create the x-axis group and scale
        let xAxisGroup = chartGroup
            .append('g')
            .attr('id', 'xAxis')
            .attr('transform', 'translate(0,630)');

        this.xScale = d3
            .scaleLinear()
            .domain([0, Math.max(...ptList)])
            .range([60, 480])
            .nice();

        this.xAxis = d3.axisBottom();
        this.xAxis.scale(this.xScale);

        xAxisGroup.call(this.xAxis);

        //Create the y-axis group and scale
        let yAxisGroup = chartGroup
            .append('g')
            .attr('id', 'yAxis')
            .attr('transform', 'translate(60,0)');//translate transform to get axis in proper spot

        this.yScale = d3
            .scaleLinear()
            .domain([Math.max(...ptList), 0])
            .range([210, 630])
            .nice();

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);

        yAxisGroup.call(this.yAxis);
        this.updateChart();

        let dropdownWrapper = overallDiv.append('div')
            .classed('dropdownWrapper', true);

        let xWrapper = dropdownWrapper.append('div')
            .classed('dropdownPanel', true);

        xWrapper.append('div').classed('dropdownLabel', true)
            .append('text')
            .text('X Axis Data');

        xWrapper.append('div').attr('id', 'xDropdown').classed('dropdown', true).append('div').classed('dropdownContent', true)
            .append('select');

        let yWrapper = dropdownWrapper.append('div')
            .classed('dropdownPanel', true);

        yWrapper.append('div').classed('dropdownLabel', true)
            .append('text')
            .text('Y Axis Data');

        yWrapper.append('div').attr('id', 'yDropdown').classed('dropdown', true).append('div').classed('dropdownContent', true)
            .append('select');

        this.drawDropDowns();
    }

    drawDropDowns() {

        let that = this;

        //Set up the x axis dropdown
        let dropX = d3.select('#xDropdown').select('.dropdownContent').select('select');

        let optionsX = dropX.selectAll('option')
            .data(this.dropdownData);

        optionsX.exit().remove();

        let optionsXEnter = optionsX.enter()
            .append('option')
            .attr('value', (d) => d[0]);

        optionsXEnter.append('text')
            .text((d) => d[1]);

        optionsX = optionsXEnter.merge(optionsX);

        let selectedX = optionsX.filter(d => d[0] === this.xIndicator)
            .attr('selected', true);

        dropX.on('change', function(d, i) {
            d3.select('#xAxisLabel')
                .text(this.options[this.selectedIndex].label);
            that.xIndicator = this.options[this.selectedIndex].value;
            that.updateChart();
            // let xValue = this.options[this.selectedIndex].value;
            // let yValue = dropY.node().value;
            // let cValue = dropC.node().value;
            // that.updatePlot(that.activeYear, xValue, yValue, cValue);
            // that.updateCountry
        });

        let dropY = d3.select('#yDropdown').select('.dropdownContent').select('select');

        let optionsY = dropY.selectAll('option')
            .data(this.dropdownData);

        optionsY.exit().remove();

        let optionsYEnter = optionsY.enter()
            .append('option')
            .attr('value', (d) => d[0]);

        optionsYEnter.append('text')
            .text((d) => d[1]);

        optionsY = optionsYEnter.merge(optionsY);

        let selectedY = optionsY.filter(d => d[0] === this.yIndicator)
            .attr('selected', true);

        dropY.on('change', function(d, i) {
            d3.select('#yAxisLabel')
                .text(this.options[this.selectedIndex].label);
            that.yIndicator = this.options[this.selectedIndex].value;
            that.updateChart();
            // let xValue = this.options[this.selectedIndex].value;
            // let yValue = dropY.node().value;
            // let cValue = dropC.node().value;
            // that.updatePlot(that.activeYear, xValue, yValue, cValue);
            // that.updateCountry
        });
    }

    /**
     * This function is called any time that the chart needs to update the data for a given year(s).
     * Any time this function is called, the data should call the appropriate parsing function so that
     * the correct data can be represented.
     */
    updateChart() {
        //Update scales for the chart
        this.updateScales();

        let circles = d3.select('#overallChartGroup')
            .selectAll('circle')
            .data(this.overallData);

        let newCircles = circles
            .enter()
            .append("circle");
        newCircles
            .append('title');

        circles.exit()
            .remove();

        circles = newCircles.merge(circles);

        let that = this; //If reference to Overall class is needed for click events
        circles
            //insert click events here when time comes
            .transition()
            .duration(1500)
            // .attr('cx', (d) => this.xScale(d.year[this.xIndicator]))
            .attr('cx', (d) => {
                if(that.xIndicator.includes('PASS')) {
                    let key = that.xIndicator.replace('PASS', '');
                    return that.xScale(d.year.passing[key]);
                }
                else if(that.xIndicator.includes('RUSH')) {
                    let key = that.xIndicator.replace('RUSH', '');
                    return that.xScale(d.year.rushing[key]);
                }
                else if(that.xIndicator.includes('REC')) {
                    let key = that.xIndicator.replace('REC', '');
                    return that.xScale(d.year.receiving[key]);
                }
                else {
                    return that.xScale(d.year[that.xIndicator]);
                }
            })
            .attr('cy', (d) => {
                if (that.yIndicator.includes('PASS')) {
                    let key = that.yIndicator.replace('PASS', '');
                    return that.yScale(d.year.passing[key]);
                }
                else if (that.yIndicator.includes('RUSH')) {
                    let key = that.yIndicator.replace('RUSH', '');
                    return that.yScale(d.year.rushing[key]);
                }
                else if (that.yIndicator.includes('REC')) {
                    let key = that.yIndicator.replace('REC', '');
                    return that.yScale(d.year.receiving[key]);
                }
                else {
                    return that.yScale(d.year[that.yIndicator]);
                }
            })
            .attr('r', 3);

        circles
            .select('title')
            .text(function(d) {
                return `${d.name}: ${d.year.fantasyPoints} pts`
            })
    }

    updateScales() {
        let that = this;
        let xValueList = [];
        this.overallData.forEach(function(player) {
            if(that.xIndicator.includes('PASS')) {
                let key = that.xIndicator.replace('PASS', '');
                xValueList.push(player.year.passing[key]);
            }
            else if(that.xIndicator.includes('RUSH')) {
                let key = that.xIndicator.replace('RUSH', '');
                xValueList.push(player.year.rushing[key]);
            }
            else if(that.xIndicator.includes('REC')) {
                let key = that.xIndicator.replace('REC', '');
                xValueList.push(player.year.receiving[key]);
            }
            else {
                xValueList.push(player.year[that.xIndicator]);
            }
        });

        this.xScale = d3
            .scaleLinear()
            .domain([0, Math.max(...xValueList)])
            .range([60, 480])
            .nice();

        this.xAxis = d3.axisBottom();
        this.xAxis.scale(this.xScale);

        d3.select('#xAxis').call(this.xAxis);

        let yValueList = [];
        this.overallData.forEach(function(player) {
            if(that.yIndicator.includes('PASS')) {
                let key = that.yIndicator.replace('PASS', '');
                yValueList.push(player.year.passing[key]);
            }
            else if(that.yIndicator.includes('RUSH')) {
                let key = that.yIndicator.replace('RUSH', '');
                yValueList.push(player.year.rushing[key]);
            }
            else if(that.yIndicator.includes('REC')) {
                let key = that.yIndicator.replace('REC', '');
                yValueList.push(player.year.receiving[key]);
            }
            else {
                yValueList.push(player.year[that.yIndicator]);
            }
        });

        this.yScale = d3
            .scaleLinear()
            .domain([Math.max(...yValueList), 0])
            .range([210, 630])
            .nice();

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);

        d3.select('#yAxis').call(this.yAxis);
    }

    /**
     * This is a helper function that will parse the data for a single year only. Make sure to only call
     * this function if only one year is selected from the year selector in the main view.
     * @param year - The given year that the data should be provided for
     * @param position - The position that the user has selected data for
     */
    parseDataForYear(year, position) {
        let updateData = [];
        this.allData.map(function(player){
            let x = Object.values(player.years);
            let keys = x.filter(d => Object.keys(d)[0] === year);

            keys.forEach(function(yearData) {
                const givenYear = Object.values(yearData);
                const pos = givenYear[0].position;
                if(pos === position) {
                    let playerObj = {
                        'name': player.name,
                        'year': givenYear[0]
                    };
                    updateData.push(playerObj)
                }
            });
        });
        this.overallData = updateData;
    }

    updateCurrentPlayers(player1, player2) {
        //update player data and highlighting if needed
        // original player objects from parsed csv
        this.player1 = player1;
        this.player2 = player2;
    }

    updateSelectedYear(yearIndex) {
        //will receive an index, so access year via this.player1.years
        //will need to parse the data set for the year and position again
        // this.selectedYear = year;
        console.log(`Update Selected Year: ${yearIndex}`);
        let yearObj = this.player1.years[yearIndex];
        let year = Object.keys(yearObj)[0];
        let position = Object.values(yearObj)[0].position;
        this.parseDataForYear(year, position);
        this.updateChart();
    }

    updateView() {
        //updateChart
    }

    setCompareMode(compareEnable) {
        this.compareEnable = compareEnable;
    }
}