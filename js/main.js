class Main {

    constructor(data) {
        this.data = data;
        this.playerView = new Player();
        this.overallView = new Overall(this.data);

        this.player1 = {};
        this.player2 = {};

        console.log(this.data);

        let that = this;

        // Setup dropdown player selection event listener
        $('.selectpicker').on('change', function(){
            let selectedPlayer = $('.selectpicker').val();
            that.player1 = that.data.find((d) => {
                if (d.name === selectedPlayer) {
                    return d;
                }
            });
            that.updateView();
        });

        // Setup compare button event listener
        d3.select('#compareButton')
            .on('click', function() {

                // Raj put method here
            });
    }

    setupView() {
        this.playerView.createPlayerView();
        this.overallView.createChart();
    }

    updateView() {
        // Update player view.
        this.updatePlayerView();

        // Update overall view.
        this.updateOverallView();
    }

    updatePlayerView() {
        this.playerView.updateCurrentPlayers(this.player1, this.player2);
        this.playerView.updatePlayerView();
    }

    updateOverallView() {

    }
}