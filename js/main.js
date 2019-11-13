class Main {

    constructor(data) {
        this.data = data;
        let playerView = new Player(updateSelectedYear);
        let overallView = new Overall(this.data, this.updateSelectedPlayer);

        this.playerView = playerView;
        this.overallView = overallView;

        function updateSelectedYear(yearIndex) {
            overallView.updateSelectedYear(yearIndex);
        }

        this.player1 = this.data[0];
        this.player2 = this.data[0];

        this.compareEnable = false;

        console.log(this.data);
    }

    setupView() {
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
            that.setCompareMode();
            let html = 'Compare Player';
            if (that.compareEnable) {
                that.addPlayer2Dropdown();
                html = 'Single Player';
            } else {
                that.removePlayer2Dropdown();
            }
            $('#compareButton').html(html);
            that.updateView();
        });

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
        this.playerView.updateView();
    }

    updateOverallView() {
        this.overallView.updateCurrentPlayers(this.player1, this.player2);
        this.overallView.updateView();
    }

    addPlayer2Dropdown() {
        $('#player2DropdownContainer').show(1000);
    }

    removePlayer2Dropdown() {
        $('#player2DropdownContainer').hide(1000);
    }

    updateSelectedPlayer(player1) {
        this.player1 = player1;
        this.updateView();
    }

    setCompareMode() {
        this.playerView.setCompareMode(this.compareEnable);
        this.overallView.setCompareMode(this.compareEnable);
    }
}