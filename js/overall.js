class Overall {

    constructor(data) {
        this.allData = data;
        this.overallData = data;
    }

    createChart() {

        let overallDiv = d3.select('#overallView');
        overallDiv
            .append('g')
            .attr('id', 'overallChartGroup');

        overallDiv
            .select('#overallChartGroup')
            // .append('g')
            .append('svg')
            .attr('width', 500)
            .attr('height', 700)
            // .append('g')
            // .attr('id', 'overallChartHeaderGroup')
            .append('text')
            .text('Overall Data for Year')
            .style('font-size', '38px')
            .attr('x', 100)
            .attr('y', 80);

        overallDiv
            .select('#overallChartGroup')
            .select('svg')
            .append('text')
            .attr('id', 'xAxisLabel')
            .attr('transform', 'translate(255, 150)')
            .text('Players')
            .classed('axisLabel', true);
        overallDiv
            .select('#overallChartGroup')
            .select('svg')
            .append('text')
            .attr('id', 'yAxisLabel')
            .attr('transform', 'translate(30, 470) rotate(90) scale(-1,-1)')
            .text('Fantasy Points')
            .classed('axisLabel', true);

        let xAxisGroup = overallDiv
            .select('svg')
            .append('g')
            .attr('transform', 'translate(0,210)');

        this.xScale = d3
            .scaleLinear()
            .domain([0, this.allData.length])
            .range([80, 480])
            .nice();

        this.xAxis = d3.axisTop();
        this.xAxis.scale(this.xScale);

        xAxisGroup.call(this.xAxis);

        let yAxisGroup = overallDiv
            .select('svg')
            .append('g')
            .attr('transform', 'translate(80,0)');//translate transform to get axis in proper spot

        //max is not working properly so will need to find a way to get max points from each player
        // const max = d3.max(this.allData.map(d => d.years.FantPt));
        let ptList = [];
        this.allData.forEach(function(player) {
            player.years.forEach(function(year){
                Object.values(year).forEach(function(key) {
                    ptList.push((key.fantasyPoints != '') ? key.fantasyPoints : '0');
                })
            });
        });
        this.yScale = d3
            .scaleLinear()
            .domain([0, Math.max(...ptList)])
            .range([210, 630])
            .nice();

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);

        yAxisGroup.call(this.yAxis);
        this.parseDataForYear("2016", "QB"); //this may need to be called earlier in the function
    }

    updateChart() {

    }

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
                        "name": player.name,
                        "points": givenYear[0].fantasyPoints,
                        "position": position
                    };
                    updateData.push(playerObj)
                }
            });
        });
        this.overallData = updateData;
    }
}