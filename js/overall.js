class Overall {

    constructor(data) {
        this.data = data;
    }

    createChart() {

        let overallDiv = d3.select('#overallView');
        overallDiv
            .append('svg')
            .attr('width', 800)
            .attr('height', 800)
            .append('g');

        this.xScale = d3
            .scaleLinear()
            .domain([0, this.data.length])
            .range([10, 790])
            .nice();

        this.xAxis = d3.axisBottom();
        this.xAxis.scale(this.xScale);

        this.yScale = d3
            .scaleLinear()
            .domain([0, d3.max(this.data.map(d => d.years.filter(d => d.FantPt)))])
            .range([10, 790]);

        this.yAxis = d3.axisLeft();
        this.yAxis.scale(this.yScale);
    }

    updateChart() {

    }
}