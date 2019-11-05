class Overall {

    constructor(data) {
        this.data = data;
    }

    createChart() {

        let overallDiv = d3.select('#overallView');
        overallDiv
            .append('svg')
            .attr('width', 360)
            .attr('height', 360);

        let xAxisGroup = overallDiv
            .select('svg')
            .append('g')
            .attr('transform', 'translate(0,340)');

        this.xScale = d3
            .scaleLinear()
            .domain([0, this.data.length])
            .range([30, 340])
            .nice();

        this.xAxis = d3.axisBottom();
        this.xAxis.scale(this.xScale);

        xAxisGroup.call(this.xAxis);

        let yAxisGroup = overallDiv
            .select('svg')
            .append('g')
            .attr('transform', 'translate(30,0)');//translate transform to get axis in proper spot

        //max is not working properly so will need to find a way to get max points from each player
        const max = d3.max(this.data.map(d => d.years.filter(d => d.FantPt)));
        this.yScale = d3
            .scaleLinear()
            .domain([0, 500])
            .range([10, 340]);

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);

        yAxisGroup.call(this.yAxis);
    }

    updateChart() {

    }
}