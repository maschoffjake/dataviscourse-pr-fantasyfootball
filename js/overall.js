class Overall {

    constructor(data) {
        this.allData = data;
        this.overallData = data;
    }

    createChart() {
        this.parseDataForYear("2016", "QB"); //this may need to be called earlier in the function
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
            .attr('transform', 'translate(225, 150)')
            .text('Fantasy Points')
            .classed('axisLabel', true);
        overallDiv
            .select('#overallChartGroup')
            .select('svg')
            .append('text')
            .attr('id', 'yAxisLabel')
            .attr('transform', 'translate(30, 470) rotate(90) scale(-1,-1)')
            .text('Player Names')
            .classed('axisLabel', true);

        let ptList = [];
        this.overallData.forEach(function(player) {
            ptList.push(player.year.fantasyPoints);
        });

        let xAxisGroup = overallDiv
            .select('svg')
            .append('g')
            .attr('transform', 'translate(0,210)');

        this.xScale = d3
            .scaleLinear()
            .domain([0, Math.max(...ptList)])
            .range([80, 480])
            .nice();

        this.xAxis = d3.axisTop();
        this.xAxis.scale(this.xScale);

        xAxisGroup.call(this.xAxis);

        let yAxisGroup = overallDiv
            .select('svg')
            .append('g')
            .attr('transform', 'translate(80,0)');//translate transform to get axis in proper spot

        // const tickVals = this.overallData.map(d => d.name).filter(function(d, i) {
        //     if(this.overallData.length < 20) {
        //         return i;
        //     }
        //     else{
        //         return i%10;
        //     }
        // });
        this.yScale = d3
            .scaleBand()
            .domain(this.overallData.map(d => d.name))
            .range([210, 680]);

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);

        yAxisGroup.call(this.yAxis);
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
                        'name': player.name,
                        'year': givenYear[0]
                    };
                    updateData.push(playerObj)
                }
            });
        });
        this.overallData = updateData;
    }
}