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
        this.parseDataForYear("2016", 'TE');

        //Create a group for the overall chart
        let overallDiv = d3.select('#overallView');

        this.toolTip = overallDiv
            .append('div')
            .classed('overallToolTip', true)
            .style("opacity", 0);
        this.toolTip
            .append("h6")
            .attr("id", "toolTipLine1");
        this.toolTip
            .append("h6")
            .attr("id", "toolTipLine2");
        this.toolTip
            .append("h6")
            .attr("id", "toolTipLine3");

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
            .text('Games Started')
            .classed('axisLabel', true);

        //Get fantasy points from parsed data to find the max to be displayed on the x-axis
        // let ptList = [];
        // this.overallData.forEach(function(player) {
        //     ptList.push(player.year.fantasyPoints);
        // });

        //Create the x-axis group and scale
        let xAxisGroup = chartGroup
            .append('g')
            .attr('id', 'xAxis')
            .attr('transform', 'translate(0,630)');

        // this.xScale = d3
        //     .scaleLinear()
        //     .domain([0, Math.max(...ptList)])
        //     .range([60, 480])
        //     .nice();
        //
        // this.xAxis = d3.axisBottom();
        // this.xAxis.scale(this.xScale);

        // xAxisGroup.call(this.xAxis);

        //Create the y-axis group and scale
        let yAxisGroup = chartGroup
            .append('g')
            .attr('id', 'yAxis')
            .attr('transform', 'translate(60,0)');//translate transform to get axis in proper spot

        // this.yScale = d3
        //     .scaleLinear()
        //     .domain([Math.max(...ptList), 0])
        //     .range([210, 630])
        //     .nice();
        //
        // this.yAxis = d3.axisLeft();
        // this.yAxis.scale(this.yScale);
        //
        // yAxisGroup.call(this.yAxis);
        // this.updateChart();

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

        overallDiv
            .append('button')
            .text('Extremes')
            .attr('id', 'extremesButton');
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
            .attr('cx', '60')
            .attr('cy', '630')
            .append('title');

        circles.exit()
            .remove();

        circles = newCircles.merge(circles);

        let that = this; //If reference to Overall class is needed for click events
        circles
            .on('mouseover', function(d) {
                that.toolTip
                    .select('#toolTipLine1')
                    .text(d.name)
                    .attr('y', '20px');
                let line2Label = that.dropdownData.filter((d) => d[0] === that.xIndicator)[0][1];
                let line2Value = that.xIndicator;
                if(that.xIndicator.includes('PASS')) {
                    line2Value = that.xIndicator.replace('PASS', '');
                    // line2Value = d.year.passing[line2Value];
                    let keys = Object.keys(d);
                    line2Value = (keys.includes('year')) ? d.year.passing[line2Value] : d.passing[line2Value];
                }
                else if(that.xIndicator.includes('RUSH')) {
                    line2Value = that.xIndicator.replace('RUSH', '');
                    // line2Value = d.year.rushing[line2Value];
                    let keys = Object.keys(d);
                    line2Value = (keys.includes('year')) ? d.year.rushing[line2Value] : d.rushing[line2Value];
                }
                else if(that.xIndicator.includes('REC')) {
                    line2Value = that.xIndicator.replace('REC', '');
                    // line2Value = d.year.receiving[line2Value];
                    let keys = Object.keys(d);
                    line2Value = (keys.includes('year')) ? d.year.receiving[line2Value] : d.receiving[line2Value];
                }
                else {
                    let keys = Object.keys(d);
                    line2Value = (keys.includes('year')) ? d.year[line2Value] : d[line2Value];
                }
                that.toolTip
                    .select('#toolTipLine2')
                    .text(`${line2Label}: ${line2Value}`); // will need to parse pass, rush, rec attributes
                let line3Label = that.dropdownData.filter((d) => d[0] === that.yIndicator)[0][1];
                let line3Value = that.yIndicator;
                if(that.yIndicator.includes('PASS')) {
                    line3Value = that.yIndicator.replace('PASS', '');
                    // line3Value = d.year.passing[line3Value];
                    let keys = Object.keys(d);
                    line3Value = (keys.includes('year')) ? d.year.passing[line3Value] : d.passing[line3Value];
                }
                else if(that.yIndicator.includes('RUSH')) {
                    line3Value = that.yIndicator.replace('RUSH', '');
                    // line3Value = d.year.rushing[line3Value];
                    let keys = Object.keys(d);
                    line3Value = (keys.includes('year')) ? d.year.rushing[line3Value] : d.rushing[line3Value];
                }
                else if(that.yIndicator.includes('REC')) {
                    line3Value = that.yIndicator.replace('REC', '');
                    // line3Value = d.year.receiving[line3Value];
                    let keys = Object.keys(d);
                    line3Value = (keys.includes('year')) ? d.year.receiving[line3Value] : d.receiving[line3Value];
                }
                else {
                    let keys = Object.keys(d);
                    line3Value = (keys.includes('year')) ? d.year[line3Value] : d[line3Value];
                }
                that.toolTip
                    .select('#toolTipLine3')
                    .text(`${line3Label}: ${line3Value}`); // will need to parse pass, rush, rec attributes
                that.toolTip
                    .transition()
                    .duration(500)
                    .style("opacity", .8)
                    .style("left", (d3.event.pageX - 200) + "px")
                    .style("top", (d3.event.pageY - 75) + "px");
            })
            .on('mouseout', function() {
                that.toolTip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function(d) {
                let selectedPlayer = that.allData.filter((player) => {return player.name === d.name})[0];
                that.updateSelectedPlayer(selectedPlayer);
            })
            .classed('selected', function(d) {
                if((that.player1 != null) && (d.name === that.player1.name)) {
                    return true;
                }
                return (that.player2 != null) && (d.name === that.player2.name);
            })
            .transition()
            .duration(1500)
            .attr('cx', (d) => {
                if(that.xIndicator.includes('PASS')) {
                    let key = that.xIndicator.replace('PASS', '');
                    let keys = Object.keys(d);
                    return that.xScale((keys.includes('year')) ? d.year.passing[key] : d.passing[key]);
                }
                else if(that.xIndicator.includes('RUSH')) {
                    let key = that.xIndicator.replace('RUSH', '');
                    let keys = Object.keys(d);
                    return that.xScale((keys.includes('year')) ? d.year.rushing[key] : d.rushing[key]);
                }
                else if(that.xIndicator.includes('REC')) {
                    let key = that.xIndicator.replace('REC', '');
                    let keys = Object.keys(d);
                    return that.xScale((keys.includes('year')) ? d.year.receiving[key] : d.receiving[key]);
                }
                else {
                    // return that.xScale(d.years[that.selectedYear][that.xIndicator]);
                    // return that.xScale(d.year[that.xIndicator]);
                    let keys = Object.keys(d);
                    return that.xScale((keys.includes('year')) ? d.year[that.xIndicator] : d[that.xIndicator]);
                }
            })
            .attr('cy', (d) => {
                if (that.yIndicator.includes('PASS')) {
                    let key = that.yIndicator.replace('PASS', '');
                    let keys = Object.keys(d);
                    return that.yScale((keys.includes('year')) ? d.year.passing[key] : d.passing[key]);
                }
                else if (that.yIndicator.includes('RUSH')) {
                    let key = that.yIndicator.replace('RUSH', '');
                    let keys = Object.keys(d);
                    return that.yScale((keys.includes('year')) ? d.year.rushing[key] : d.rushing[key]);
                }
                else if (that.yIndicator.includes('REC')) {
                    let key = that.yIndicator.replace('REC', '');
                    let keys = Object.keys(d);
                    return that.yScale((keys.includes('year')) ? d.year.receiving[key] : d.receiving[key]);
                }
                else {
                    // return that.yScale(d.years[that.selectedYear][that.yIndicator]);
                    let keys = Object.keys(d);
                    return that.yScale((keys.includes('year')) ? d.year[that.yIndicator] : d[that.yIndicator]);
                }
            })
            .attr('r', 3);
    }

    updateScales() {
        let that = this;
        let xValueList = [];
        this.overallData.forEach(function(player) {
            if(that.xIndicator.includes('PASS')) {
                let key = that.xIndicator.replace('PASS', '');
                let keys = Object.keys(player);
                xValueList.push((keys.includes('year')) ? player.year.passing[key] : player.passing[key]);
            }
            else if(that.xIndicator.includes('RUSH')) {
                let key = that.xIndicator.replace('RUSH', '');
                let keys = Object.keys(player);
                xValueList.push((keys.includes('year')) ? player.year.rushing[key] : player.rushing[key]);
            }
            else if(that.xIndicator.includes('REC')) {
                let key = that.xIndicator.replace('REC', '');
                let keys = Object.keys(player);
                xValueList.push((keys.includes('year')) ? player.year.receiving[key] : player.receiving[key]);
            }
            else {
                // xValueList.push(player.years.filter((d, i) => i === that.selectedYear)[0][that.xIndicator]);
                let keys = Object.keys(player);
                xValueList.push((keys.includes('year')) ? player.year[that.xIndicator] : player[that.xIndicator]);
                // xValueList.push(player.year[that.xIndicator]);
            }
        });

        this.xScale = d3
            .scaleLinear()
            .domain([0, Math.max(...xValueList)])
            .range([60, 480])
            .nice();

        this.xAxis = d3.axisBottom();
        this.xAxis.scale(this.xScale);

        d3.select('#xAxis')
            .transition()
            .duration(1500)
            .call(this.xAxis);

        let yValueList = [];
        this.overallData.forEach(function(player) {
            if(that.yIndicator.includes('PASS')) {
                let key = that.yIndicator.replace('PASS', '');
                let keys = Object.keys(player);
                yValueList.push((keys.includes('year')) ? player.year.passing[key] : player.passing[key]);
            }
            else if(that.yIndicator.includes('RUSH')) {
                let key = that.yIndicator.replace('RUSH', '');
                let keys = Object.keys(player);
                yValueList.push((keys.includes('year')) ? player.year.rushing[key] : player.rushing[key]);
            }
            else if(that.yIndicator.includes('REC')) {
                let key = that.yIndicator.replace('REC', '');
                let keys = Object.keys(player);
                yValueList.push((keys.includes('year')) ? player.year.receiving[key] : player.receiving[key]);
            }
            else {
                // yValueList.push(player.years.filter((d, i) => i === that.selectedYear)[0][that.yIndicator]);
                let keys = Object.keys(player);
                yValueList.push((keys.includes('year')) ? player.year[that.yIndicator] : player[that.yIndicator]);
                // yValueList.push(player.year[that.yIndicator]);
            }
        });

        this.yScale = d3
            .scaleLinear()
            .domain([Math.max(...yValueList), 0])
            .range([210, 630])
            .nice();

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);

        d3.select('#yAxis')
            .transition()
            .duration(1500)
            .call(this.yAxis);
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
            let val = x.filter(d => d.year === year);

            if(val.length > 0) {
                if(val[0].position === position) {
                    let playerObj = {
                        'name': player.name,
                        'year': val[0]
                    };
                    updateData.push(playerObj);
                }
            }
        });
        this.overallData = updateData;
    }

    parseDataForYears(years, position) {
        let updateData = [];
        //receiving years already in proper format
        // let years = [];
        // for(let i = 0; i < yearIndices.length; i++) {
        //     years.push(this.player1.years[i].year);
        // }
        this.allData.map(function(player) {
            let x = Object.values(player.years);
            let val = x.filter(d => years.includes(d.year) && (d.position === position[0] || d.position === position[1]));
            if(val.length > 0) {
                if(position.includes(val[0].position)) {
                    let playerObj = {
                        'name': player.name,
                        "team": val[0].team,
                        "position": val[0].position,
                        "age": val[0].age,
                        "games": 0,
                        "gamesStarted": 0,
                        "passing": {
                            "completions": 0,
                            "attempts": 0,
                            "passingYards": 0,
                            "touchdownPasses": 0,
                            "interceptions": 0
                        },
                        "rushing": {
                            "attempts": 0,
                            "rushingYards": 0,
                            "yardsPerAttempt": 0,
                            "rushingTouchdowns": 0
                        },
                        "receiving": {
                            "target": 0,
                            "receptions": 0,
                            "receivingYards": 0,
                            "yardsPerReception": 0,
                            "receivingTouchdowns": 0
                        },
                        "fantasyPoints": 0,
                        "ppr": 0,
                        "ppg": 0,
                        "pprpg": 0,
                        "positionRank": 0
                    };
                    val.forEach(function(year) {
                        Object.keys(year).forEach(function(key) {
                            if(key != 'year' && key != 'team' && key != 'position' && key != 'age') {
                                if(key === 'passing' || key === 'rushing' || key === 'receiving') {
                                    Object.keys(year[key]).forEach(function(attr) {
                                        playerObj[key][attr] += parseInt(year[key][attr]);
                                    });
                                }
                                else {
                                    playerObj[key] += parseInt(year[key]);
                                }
                            }
                        });
                    });
                    updateData.push(playerObj);
                }
            }
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
        let that = this;
        console.log(`Update Selected Year: ${yearIndex}`);
        if(this.compareEnable) {
            if(yearIndex.length > 1) {
                let years = [];
                let player1Years = that.player1.years.slice(yearIndex[0][0], yearIndex[0][1]);
                let player2Years = that.player2.years.slice(yearIndex[1][0], yearIndex[1][1]);
                years = player1Years.concat(player2Years).map(d => d.year);
                let removeDups = (years) => years.filter((v,i) => years.indexOf(v) === i);
                years = removeDups(years);
                let position = [this.player1.years[0].position, this.player2.years[0].position];
                this.selectedYear = years;
                this.parseDataForYears(this.selectedYear, position)
            }
            else {
                let yearObj = this.player1.years[yearIndex[0]];
                let year = yearObj.year;
                this.selectedYear = yearIndex[0];
                let position = yearObj.position;
                this.parseDataForYear(year, position);
            }
        }
        //For multiples years selected for single player
        else if(yearIndex[0].length > 1) {
            let years = [];
            let player1Years = that.player1.years.slice(yearIndex[0][0], yearIndex[0][1]);
            years = player1Years.map(d => d.year);
            let removeDups = (years) => years.filter((v,i) => years.indexOf(v) === i);
            years = removeDups(years);
            let position = [this.player1.years[0].position];
            this.selectedYear = years;
            this.parseDataForYears(this.selectedYear, position)
        }
        //Single year selected for single player
        else {
            let yearObj = this.player1.years[yearIndex];
            let year = yearObj.year;
            this.selectedYear = yearIndex;
            let position = yearObj.position;
            this.parseDataForYear(year, position);
        }
        // let yearObj = this.player1.years[yearIndex];
        // let year = yearObj.year;
        // this.selectedYear = yearIndex;
        // let position = yearObj.position;
        // // this.parseDataForYears([0,1], 'TE');
        // this.parseDataForYear(year, position);
        //TODO: call updateChart once refactored to handle multiple years
        this.updateChart();
    }

    updateView() {
        //updateChart
        console.log('updateView');
        // this.parseDataForYear(this.selectedYear,this.player1.years[])
        this.updateChart();
    }

    setCompareMode(compareEnable) {
        this.compareEnable = compareEnable;
    }
}