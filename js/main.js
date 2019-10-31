loadFile('data/Raw_Data_10yrs.csv').then((data) => {
  let player = new Player();
  player.createPlayerView();
  player.updateCurrentPlayers(data[0]);
  player.updatePlayerView();
});