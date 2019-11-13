class Overall {

    constructor(data, updateSelectedPlayer) {
        this.allData = data;
        this.overallData = data;
        this.player1 = null;
        this.player2 = null;
        this.updateSelectedPlayer = updateSelectedPlayer; //will need to extract actual player object from this.allData for selected circle
        this.selectedYear = 0;
        this.compareEnable = false;
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
            .attr('transform', 'translate(0,630)');

        this.xScale = d3
            .scaleLinear()
            .domain([0, Math.max(...ptList)])
            .range([100, 480])
            .nice();

        this.xAxis = d3.axisBottom();
        this.xAxis.scale(this.xScale);

        xAxisGroup.call(this.xAxis);

        //Create the y-axis group and scale
        let yAxisGroup = chartGroup
            .append('g')
            .attr('transform', 'translate(100,0)');//translate transform to get axis in proper spot

        this.yScale = d3
            .scaleLinear()
            .domain([Math.max(...ptList), 0])
            .range([210, 630])
            .nice();

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);

        yAxisGroup.call(this.yAxis);
        this.updateChart();
    }

    /**
     * This function is called any time that the chart needs to update the data for a given year(s).
     * Any time this function is called, the data should call the appropriate parsing function so that
     * the correct data can be represented.
     */
    updateChart() {
        let circles = d3.select('#overallChartGroup')
            .selectAll('circle')
            .data(this.overallData);

        let newCircles = circles
            .enter()
            .append("circle");

        circles.exit()
            .remove();

        circles = newCircles.merge(circles);

        let that = this; //If reference to Overall class is needed for click events
        circles
            //insert click events here when time comes
            .transition()
            .duration(1500)
            .attr('cx', (d) => this.xScale(d.year.fantasyPoints))
            .attr('cy', (d) => this.yScale(d.year.fantasyPoints))
            .attr('r', 3)
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

    updateSelectedYear(year) {
        //will receive an index, so access year via this.player1.years
        // this.selectedYear = year;
        console.log(`Update Selected Year: ${year}`);
    }

    updateView() {
        //updateChart
    }

    setCompareMode(compareEnable) {
        this.compareEnable = compareEnable;
    }
}