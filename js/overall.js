class Overall {

    constructor(data) {
        this.allData = data;
        this.overallData = data;
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
            .domain([0, this.allData.length])
            .range([30, 340])
            .nice();

        this.xAxis = d3.axisBottom();
        this.xAxis.scale(this.xScale);

        xAxisGroup.call(this.xAxis);

        let yAxisGroup = overallDiv
            .select('svg')
            .append('g')
            .attr('transform', 'translate(30,0) scale(1,1)');//translate transform to get axis in proper spot

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
            .range([340, 10])
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