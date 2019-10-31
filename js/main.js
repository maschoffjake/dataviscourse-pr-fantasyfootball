// loadFile('data/Raw_Data_10yrs.csv').then((data) => {
//   let player = new Player();
//   player.createPlayerView();
//   player.updateCurrentPlayers(data[0]);
//   player.updatePlayerView();
// });

class Main {

    constructor(data) {
        this.data = data;
        this.playerView = new Player();
        this.overallView = new Overall(this.data);


        // Setup dropdown player selection event listener
        $('.selectpicker').on('change', function(){
            let selected = $('.selectpicker').val()
            this.playerView.updateCurrentPlayers(selected);
        });
    }

    setupView() {
        this.playerView.createPlayerView();
        this.overallView.createChart();
    }

    updatePlayerView(playerData) {
        //just hardcoded for now
        this.playerView.updateCurrentPlayers(this.data[0], this.data[1]);
        //this function call has an error: Player.updateYearBarAndBrush (player.js:87)
        // this.playerView.updatePlayerView();
    }

    updateOverallView() {

    }
}