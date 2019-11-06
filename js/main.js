class Main {

    constructor(data) {
        this.data = data;
        this.playerView = new Player();
        this.overallView = new Overall(this.data);

        this.player1 = null;
        this.player2 = null;

        this.compareEnable = false;

        console.log(this.data);

        let that = this;

        // Setup dropdown player selection event listener
        $('#player1Dropdown').on('change', function(){
            let selectedPlayer = $('#player1Dropdown').val();
            that.player1 = that.data.find((d) => {
                if (d.name === selectedPlayer) {
                    return d;
                }
            });
            that.updateView();
        });

        // Setup dropdown player selection event listener
        $('#player2Dropdown').on('change', function(){
            let selectedPlayer = $('#player2Dropdown').val();
            that.player2 = that.data.find((d) => {
                if (d.name === selectedPlayer) {
                    return d;
                }
            });
            that.updateView();
        });

        // Setup compare button event listener
        d3.select('#compareButton').on('click', function() {
            that.compareEnable = !that.compareEnable;
            that.playerView.compareMode(that.compareEnable);
            if (that.compareEnable) {
                that.addPlayer2Dropdown();
            } else {
                that.removePlayer2Dropdown();
            }
            that.updateView();
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

    addPlayer2Dropdown() {
        $('#player2DropdownContainer').show('slow');
    }

    removePlayer2Dropdown() {
        $('#player2DropdownContainer').hide('slow');
    }
}