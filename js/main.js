class Main {

    constructor(data, maxData) {
        this.data = data;
        let playerView = new Player(updateSelectedYear, maxData);
        let overallView = new Overall(this.data, updateSelectedPlayer, toggleExtremes);

        this.playerView = playerView;
        this.overallView = overallView;

        function updateSelectedYear(yearIndex) {
            overallView.updateSelectedYear(yearIndex);
        }

        let that = this;
        function updateSelectedPlayer(player1) {
          that.player1 = player1;
          that.updateView();
          overallView.updateSelectedYear([0]);
          $("#player1Dropdown").selectpicker("val", player1.name);
        }

        function toggleExtremes(toggleExtremes) {
          that.playerView.setToggleExtremes(toggleExtremes);
          if (toggleExtremes) {
            $(".selectpicker").prop("disabled", true);
          } else {
            $(".selectpicker").prop("disabled", false);
          }

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
            console.log($('select[name=selValue]').val(1));
            $('.selectpicker').selectpicker('refresh')
            let selectedPlayer = $('#player1Dropdown').val();
            that.player1 = that.data.find((d) => {
                if (d.name === selectedPlayer) {
                    return d;
                }
            });
          that.updateView();
          that.overallView.updateSelectedYear([0]);
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
          that.overallView.updateSelectedYear([0]);
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

    setCompareMode() {
        this.playerView.setCompareMode(this.compareEnable);
        this.overallView.setCompareMode(this.compareEnable);
    }
}