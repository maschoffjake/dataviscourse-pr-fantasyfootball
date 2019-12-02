class Overall {

    constructor(data, updateSelectedPlayer, toggleExtremesCallback) {
        this.allData = data;
        this.overallData = data;
        this.player1 = null;
        this.player2 = null;
        this.selectedPlayers = [];
        this.updateSelectedPlayer = updateSelectedPlayer; //will need to extract actual player object from this.allData for selected circle
        this.toggleExtremesCallback = toggleExtremesCallback;
        this.selectedYear = 0;
        this.compareEnable = false;
        this.showExtremes = false;
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

        overallDiv
            .append('button')
            .text('Extremes')
            .attr('id', 'extremesButton')
            .on('click', () => this.toggleExtremes());

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

        this.playerXToolTip = overallDiv
            .append('div')
            .classed('extremeToolTip', true)
            .style("opacity", 0);
        this.playerXToolTip
            .append("p")
            .attr("id", "playerXToolTipLine1");

        this.playerYToolTip = overallDiv
            .append('div')
            .classed('extremeToolTip', true)
            .style("opacity", 0);
        this.playerYToolTip
            .append("p")
            .attr("id", "playerYToolTipLine1");

        //Create an svg for the chart and add a header
        overallDiv
            .append('svg')
            .attr('width', 500)
            .attr('height', 700)
            .append('g')
            .attr('id', 'overallChartGroup')
            .append('text')
            .text('Overall Player Data')
            .style('font-size', '32px')
            .attr('id', 'chartTitle')
            .attr('x', 125)
            .attr('y', 50);
        overallDiv
            .select('svg')
            .append('text')
            .text('2016')
            .attr('id', 'chartSubheader')
            .attr('x', 225)
            .attr('y', 100);

        //Create the x-axis label to display the data being represented
        let chartGroup = overallDiv.select('g');
        chartGroup
            .append('text')
            .attr('id', 'xAxisLabel')
            .attr('transform', 'translate(225, 620)')
            .text('Fantasy Points')
            .classed('axisLabel', true);
        //Create the y-axis label to display the data being represented (should always be player name)
        chartGroup
            .append('text')
            .attr('id', 'yAxisLabel')
            .attr('transform', 'translate(20, 420) rotate(90) scale(-1,-1)')
            .text('Games Started')
            .classed('axisLabel', true);

        //Create the x-axis group and scale
        let xAxisGroup = chartGroup
            .append('g')
            .attr('id', 'xAxis')
            .attr('transform', 'translate(0,580)');

        //Create the y-axis group and scale
        let yAxisGroup = chartGroup
            .append('g')
            .attr('id', 'yAxis')
            .attr('transform', 'translate(60,0)');//translate transform to get axis in proper spot

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

        //LEGEND FOR OVERALL CHART
        let legend = d3.select('#overallView').select('svg').append('g');
        legend.append('circle').attr("cx",60).attr("cy",650).attr("r", 6).style("fill", "#00fff7");
        legend.append('circle').attr("cx",160).attr("cy",650).attr("r", 6).style("fill", "#c40065");
        legend.append('circle').attr("cx",260).attr("cy",650).attr("r", 6).style("fill", "#79c400");
        legend.append('circle').attr("cx",360).attr("cy",650).attr("r", 6).style("fill", "#c4ad00");
        legend.append('circle').attr("cx",460).attr("cy",650).attr("r", 6).style("fill", "#7c00c4");

        legend.append('text').attr("x",70).attr("y",655).text('Selected');
        legend.append('text').attr("x",170).attr("y",655).text('TE');
        legend.append('text').attr("x",270).attr("y",655).text('WR');
        legend.append('text').attr("x",370).attr("y",655).text('QB');
        legend.append('text').attr("x",470).attr("y",655).text('RB');

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
            if(!that.showExtremes) {
                d3.select('#xAxisLabel')
                    .text(this.options[this.selectedIndex].label);
                that.xIndicator = this.options[this.selectedIndex].value;
                let yLabel = that.dropdownData.filter(d => d[0] === that.yIndicator)[0][1];
                // d3.select('#chartTitle')
                //     .text(`${this.options[this.selectedIndex].label} vs. ${yLabel}`);
                that.updateChart();
            }
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
            if(!that.showExtremes) {
                d3.select('#yAxisLabel')
                    .text(this.options[this.selectedIndex].label);
                that.yIndicator = this.options[this.selectedIndex].value;
                let xLabel = that.dropdownData.filter(d => d[0] === that.xIndicator)[0][1];
                // d3.select('#chartTitle')
                //     .text(`${xLabel} vs. ${this.options[this.selectedIndex].label}`);
                that.updateChart();
            }
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
                if(!that.showExtremes) {
                    that.toolTip
                        .select('#toolTipLine1')
                        .text(d.name.split('_')[0])
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
                }
            })
            .on('mouseout', function() {
                that.toolTip
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on('click', function(d) {
                if(!that.showExtremes) {
                    let selectedPlayer = that.allData.filter((player) => {return player.name === d.name})[0];
                    that.updateSelectedPlayer(selectedPlayer);
                }
            })
            // .classed('selected', function(d) {
            //     if((that.player1 != null) && (d.name === that.player1.name)) {
            //         d3.select(this).raise();
            //         return true;
            //     }
            //     if((that.player2 != null) && (d.name === that.player2.name)) {
            //         d3.select(this).raise();
            //         return true;
            //     }
            //     // return (that.player2 != null) && (d.name === that.player2.name);
            // })
            .attr('class', function(d) {
                if((that.player1 != null) && (d.name === that.player1.name)) {
                    d3.select(this).raise();
                    return 'selected';
                }
                if((that.player2 != null) && (d.name === that.player2.name)) {
                    d3.select(this).raise();
                    return 'selected';
                }
                if (Object.keys(d).includes('year')) {
                    return d.year.position;
                }
                return d.position;
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
                    return that.xScale((keys.includes('year')) ? parseFloat(d.year.receiving[key]) : parseFloat(d.receiving[key]));
                }
                else {
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
            .attr('r', 5);
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
            .range([160, 580])
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
            // let val = x.filter(d => year.includes(d.year) && (d.position === position[0] || d.position === position[1]));

            // if(val.length > 0) {
            //     // if(position)
            // }
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
                            if(key !== 'year' && key !== 'team' && key !== 'position' && key !== 'age') {
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
        this.player2 = (!this.compareEnable) ? null : player2;
        this.updateChart();
    }

    updateSelectedYear(yearIndex) {
        let that = this;
        //Check if comparing players
        if(this.compareEnable) {
            //Check if comparing players for multiple years
            if(yearIndex.length > 1) {
                //TODO: player two indices are incorrect. need to fix. player1Years & player2Years will
                // likely be out of bounds when fixed
                console.log("yearIndex: " + yearIndex);
                let years = [];
                let player1Years = that.player1.years.slice(yearIndex[0][0], yearIndex[0][1] + 1);
                let player2Years = that.player2.years.slice(yearIndex[1][0], yearIndex[1][1] + 1);
                years = player1Years.concat(player2Years).map(d => d.year);
                let removeDups = (years) => years.filter((v,i) => years.indexOf(v) === i);
                years = removeDups(years);
                let position = [this.player1.years[0].position, this.player2.years[0].position];
                this.selectedYear = years;
                //TODO: find out why this is not working properly
                console.log(this.selectedYear);
                d3.select('#chartSubheader')
                    .text(`${d3.min(this.selectedYear)} - ${d3.max(this.selectedYear)}`);
                this.parseDataForYears(this.selectedYear, position)
            }
            //Multiple players, single year
            else {
                //TODO: check if player2 null to select off of correct years
                let yearObjPlayer1 = this.player1.years[yearIndex[0]];
                let yearObjPlayer2 = this.player2.years[yearIndex[0]];
                let year1 = yearObjPlayer1.year;
                let year2 = yearObjPlayer2.year;

                this.selectedYear = yearIndex[0];
                let position = [yearObjPlayer1.position, yearObjPlayer2.position];
                d3.select('#chartSubheader')
                    .text(`${Math.min(year1, year2)} - ${Math.max(year1, year2)}`);
                this.parseDataForYears([year1, year2], position);
            }
        }
        //For multiples years selected for single player
        else if(yearIndex[0].length > 1) {
            let years = [];
            let player1Years = that.player1.years.slice(yearIndex[0][0], yearIndex[0][1] + 1);
            years = player1Years.map(d => d.year);
            let removeDups = (years) => years.filter((v,i) => years.indexOf(v) === i);
            years = removeDups(years);
            let position = [this.player1.years[0].position];
            this.selectedYear = years;
            let yearLabel = (this.selectedYear.length > 1) ? `${d3.min(this.selectedYear)} - ${d3.max(this.selectedYear)}` : `${this.selectedYear}`;
            console.log(this.selectedYear);
            d3.select('#chartSubheader')
                .text(yearLabel);
            this.parseDataForYears(this.selectedYear, position)
        }
        //Single year selected for single player
        else {
            let yearObj = this.player1.years[yearIndex];
            let year = yearObj.year;
            this.selectedYear = yearIndex;
            let position = yearObj.position;
            d3.select('#chartSubheader')
                .text(`${year}`);
            this.parseDataForYear(year, position);
        }

        this.updateChart();
    }

    updateView() {
        this.updateChart();
    }

    setCompareMode(compareEnable) {
        this.compareEnable = compareEnable;
    }

    toggleExtremes() {
        if(this.showExtremes) {
            d3.select('#extremesButton')
                .classed('toggleExtremes', false);

            let circles = d3.select('#overallChartGroup')
                .selectAll('circle');
            circles
                .classed('faded', false)
                .classed('extremes', false);

            // d3.selectAll('select')
            //     .attr('disabled', 'false');
            $("select").prop("disabled", false);

            this.selectedPlayers.forEach(function(player) {
                player.classList = ['selected'];
            });

            this.maxPlayers.forEach(function(player) {
                if (Object.keys(player.__data__).includes('year')) {
                    player.classList = [player.__data__.year.position]
                }
                else {
                    player.classList = [player.__data__.position];
                }
            });

            this.playerXToolTip
                .transition()
                .duration(200)
                .style("opacity", 0);
            this.playerYToolTip
                .transition()
                .duration(200)
                .style("opacity", 0);
        }
        else {
            d3.select('#extremesButton')
                .classed('toggleExtremes', true);

            let circles = d3.select('#overallChartGroup')
                .selectAll('circle');
            let selected = d3.select('#overallChartGroup')
                .selectAll('.selected');

            // d3.selectAll('select')
            //     .attr('disabled', 'true');
            $("select").prop("disabled", true);

            let tempSelected = [];
            selected._groups[0].forEach(function(d) {
               tempSelected.push(d);
            });
            this.selectedPlayers = tempSelected;

            selected
                .classed('selected', false);

            circles
                .classed('faded', true);

            //TODO: if the maxPlayerX and maxPlayerY are the same, only display one extreme tooltip.. (like x)
            this.getMaxPlayers();
            this.maxPlayers.forEach(function(player) {
                player.classList = ['extremes'];
            });
            let playerXData = this.maxPlayers[0].__data__;
            let playerYData = this.maxPlayers[1].__data__;

            let playerXCategory = this.dropdownData.filter((d) => d[0] === this.xIndicator)[0][1];
            let playerXValForCategory = this.xIndicator;
            if(this.xIndicator.includes('PASS')) {
                playerXValForCategory = this.xIndicator.replace('PASS', '');
                let keys = Object.keys(playerXData);
                playerXValForCategory = (keys.includes('year')) ? playerXData.year.passing[playerXValForCategory] : playerXData.passing[playerXValForCategory];
            }
            else if(this.xIndicator.includes('RUSH')) {
                playerXValForCategory = this.xIndicator.replace('RUSH', '');
                let keys = Object.keys(playerXData);
                playerXValForCategory = (keys.includes('year')) ? playerXData.year.rushing[playerXValForCategory] : playerXData.rushing[playerXValForCategory];
            }
            else if(this.xIndicator.includes('REC')) {
                playerXValForCategory = this.xIndicator.replace('REC', '');
                let keys = Object.keys(playerXData);
                playerXValForCategory = (keys.includes('year')) ? playerXData.year.receiving[playerXValForCategory] : playerXData.receiving[playerXValForCategory];
            }
            else {
                let keys = Object.keys(playerXData);
                playerXValForCategory = (keys.includes('year')) ? playerXData.year[playerXValForCategory] : playerXData[playerXValForCategory];
            }

            //TODO: maybe make dictionary to display actual team name instead of abbrev.
            // Need to check if this is for multiple years or not as well
            let teamX = (Object.keys(playerXData).includes('year')) ? playerXData.year.team : playerXData.team;
            d3.select('#playerXToolTipLine1')
                .text(`${playerXData.name.split('_')[0].toUpperCase()} had the most ${playerXCategory} out of any player during this season(s) with ${playerXValForCategory} while playing for ${teamX}.`);

            let playerYCategory = this.dropdownData.filter((d) => d[0] === this.yIndicator)[0][1];
            let playerYValForCategory = this.yIndicator;
            if(this.yIndicator.includes('PASS')) {
                playerYValForCategory = this.yIndicator.replace('PASS', '');
                let keys = Object.keys(playerYData);
                playerYValForCategory = (keys.includes('year')) ? playerYData.year.passing[playerYValForCategory] : playerYData.passing[playerYValForCategory];
            }
            else if(this.yIndicator.includes('RUSH')) {
                playerYValForCategory = this.yIndicator.replace('RUSH', '');
                let keys = Object.keys(playerYData);
                playerYValForCategory = (keys.includes('year')) ? playerYData.year.rushing[playerYValForCategory] : playerYData.rushing[playerYValForCategory];
            }
            else if(this.yIndicator.includes('REC')) {
                playerYValForCategory = this.yIndicator.replace('REC', '');
                let keys = Object.keys(playerYData);
                playerYValForCategory = (keys.includes('year')) ? playerYData.year.receiving[playerYValForCategory] : playerYData.receiving[playerYValForCategory];
            }
            else {
                let keys = Object.keys(playerYData);
                playerYValForCategory = (keys.includes('year')) ? playerYData.year[playerYValForCategory] : playerYData[playerYValForCategory];
            }

            //TODO: maybe make dictionary to display actual team name instead of abbrev.
            // Need to check if this is for multiple years or not as well
            let teamY = (Object.keys(playerYData).includes('year')) ? playerYData.year.team : playerYData.team;
            d3.select('#playerYToolTipLine1')
                .text(`${playerYData.name.split('_')[0].toUpperCase()} had the most ${playerYCategory} out of any player during this season(s) with ${playerYValForCategory} while playing for ${teamY}.`);

            if (this.maxPlayers[0] !== this.maxPlayers[1]) {
                this.playerXToolTip
                    .transition()
                    .duration(500)
                    .style("opacity", .8)
                    .style("left", `${1100 + this.maxPlayers[0].cx.baseVal.value}` + "px")
                    .style("top", `${120 + this.maxPlayers[0].cy.baseVal.value}` + "px");

                this.playerYToolTip
                    .transition()
                    .duration(500)
                    .style("opacity", .8)
                    .style("left", `${1100 + this.maxPlayers[1].cx.baseVal.value}` + "px")
                    .style("top", `${this.maxPlayers[1].cy.baseVal.value}` + "px");
            }
            else {
                this.playerXToolTip
                    .transition()
                    .duration(500)
                    .style("opacity", .8)
                    .style("left", `${1100 + this.maxPlayers[0].cx.baseVal.value}` + "px")
                    .style("top", `${120 + this.maxPlayers[0].cy.baseVal.value}` + "px");
            }
        }
        this.showExtremes = !this.showExtremes;
        this.toggleExtremesCallback(this.showExtremes);
    }

    getMaxPlayers() {
        let that = this;
        let circles = d3.select('#overallChartGroup')
            .selectAll('circle');

        let circleObjs = circles._groups[0];
        //Set up variables to extract minPlayer
        let maxX = 0,
            maxY = 0;
        let maxPlayerX = null,
            maxPlayerY = null;
        //Iterate over circles to find the player with the lowest xIndicator and yIndicator values
        //TODO: need to check xIndicator and yIndicator for PASS, RUSH, REC & not else ifs
        if (that.yIndicator.includes('PASS')) {
            circleObjs.forEach(function(player) {
                let keyY = that.yIndicator.replace('PASS', '');
                let keys = Object.keys(player.__data__);
                if (keys.includes('year')) {
                    if(parseInt(player.__data__.year.passing[keyY]) >= maxY) {
                        maxY = parseInt(player.__data__.year.passing[keyY]);
                        maxPlayerY = player;
                    }
                }
                else {
                    if(parseInt(player.__data__.passing[keyY]) >= maxY) {
                        maxY = parseInt(player.__data__.passing[keyY]);
                        maxPlayerY = player;
                    }
                }
            });
        }
        else if (that.yIndicator.includes('RUSH')) {
            circleObjs.forEach(function(player) {
                let keyY = that.yIndicator.replace('RUSH', '');
                let keys = Object.keys(player.__data__);
                if (keys.includes('year')) {
                    if(parseInt(player.__data__.year.rushing[keyY]) >= maxY) {
                        maxY = parseInt(player.__data__.year.rushing[keyY]);
                        maxPlayerY = player;
                    }
                }
                else {
                    if(parseInt(player.__data__.rushing[keyY]) >= maxY) {
                        maxY = parseInt(player.__data__.rushing[keyY]);
                        maxPlayerY = player;
                    }
                }
            });
        }
       else if (that.yIndicator.includes('REC')) {
            circleObjs.forEach(function(player) {
                let keyY = that.yIndicator.replace('REC', '');
                let keys = Object.keys(player.__data__);
                if (keys.includes('year')) {
                    if(parseInt(player.__data__.year.receiving[keyY]) >= maxY) {
                        maxY = parseInt(player.__data__.year.receiving[keyY]);
                        maxPlayerY = player;
                    }
                }
                else {
                    if(parseInt(player.__data__.receiving[keyY]) >= maxY) {
                        maxY = parseInt(player.__data__.receiving[keyY]);
                        maxPlayerY = player;
                    }
                }
            });
        }
        else {
            circleObjs.forEach(function(player) {
                let keys = Object.keys(player.__data__);
                if (keys.includes('year')) {
                    if (parseInt(player.__data__.year[that.yIndicator]) >= maxY) {
                        maxY = parseInt(player.__data__.year[that.yIndicator]);
                        maxPlayerY = player;
                    }
                }
                else {
                    if (parseInt(player.__data__[that.yIndicator]) >= maxY) {
                        maxY = parseInt(player.__data__[that.yIndicator]);
                        maxPlayerY = player;
                    }
                }
            });
        }
        if(that.xIndicator.includes('PASS')) {
            circleObjs.forEach(function(player) {
                let keyX = that.xIndicator.replace('PASS', '');
                let keys = Object.keys(player.__data__);
                if (keys.includes('year')) {
                    if(parseInt(player.__data__.year.passing[keyX]) >= maxX) {
                        maxX = parseInt(player.__data__.year.passing[keyX]);
                        maxPlayerX = player;
                    }
                }
                else {
                    if(parseInt(player.__data__.passing[keyX]) >= maxX) {
                        maxX = parseInt(player.__data__.passing[keyX]);
                        maxPlayerX = player;
                    }
                }
            });
        }
        else if (that.xIndicator.includes('RUSH')) {
            circleObjs.forEach(function(player) {
                let keyX = that.xIndicator.replace('RUSH', '');
                let keys = Object.keys(player.__data__);
                if (keys.includes('year')) {
                    if(parseInt(player.__data__.year.rushing[keyX]) >= maxX) {
                        maxX = parseInt(player.__data__.year.rushing[keyX]);
                        maxPlayerX = player;
                    }
                }
                else {
                    if(parseInt(player.__data__.rushing[keyX]) >= maxX) {
                        maxX = parseInt(player.__data__.rushing[keyX]);
                        maxPlayerX = player;
                    }
                }
            });
        }
        else if (that.xIndicator.includes('REC')) {
            circleObjs.forEach(function(player) {
                let keyX = that.xIndicator.replace('REC', '');
                let keys = Object.keys(player.__data__);
                if (keys.includes('year')) {
                    if(parseInt(player.__data__.year.receiving[keyX]) >= maxX) {
                        maxX = parseInt(player.__data__.year.receiving[keyX]);
                        maxPlayerX = player;
                    }
                }
                else {
                    if(parseInt(player.__data__.receiving[keyX]) >= maxX) {
                        maxX = parseInt(player.__data__.receiving[keyX]);
                        maxPlayerX = player;
                    }
                }
            });
        }
        else {
            circleObjs.forEach(function(player) {
                let keys = Object.keys(player.__data__);
                if(keys.includes('year')) {
                    if(parseInt(player.__data__.year[that.xIndicator]) >= maxX) {
                        maxX = parseInt(player.__data__.year[that.xIndicator]);
                        maxPlayerX = player;
                    }
                }
                else {
                    if(parseInt(player.__data__[that.xIndicator]) >= maxX) {
                        maxX = parseInt(player.__data__[that.xIndicator]);
                        maxPlayerX = player;
                    }
                }
            });
        }

        this.maxPlayers = [maxPlayerX, maxPlayerY];
    }
}