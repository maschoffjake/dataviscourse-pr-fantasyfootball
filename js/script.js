loadFile('data/Raw_Data_10yrs.csv').then(data => {
    let mainView = new Main(data);
    mainView.setupView();

    // Used for finding duplicates if need be...
    // for (let item of data) {
    //     let playerYears = [];
    //     for (let years of item.years) {
    //         let year = Object.keys(years)[0];
    //         playerYears.push(year);
    //     }
    //     // console.log(playerYears);
    //     let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index);
    //     let dups = findDuplicates(playerYears);
    //     if (dups.length > 0) {
    //         console.log(item.name);
    //     }
    // }
});

async function loadFile(file) {
    let data = await d3.csv(file).then(d => {

        //Get player names from the dataset
        let playerNames = d.map(row => {
            return row.Name;
        });


        //Remove the duplicates of player names for each year
        let removeDuplicateNames = (names) => names.filter((v,i) => names.indexOf(v) === i);
        playerNames = removeDuplicateNames(playerNames).sort();

        // Render the dropdown menu with all the player names
        let options = [];

        for (let player of playerNames) {
            let option = "<option>" + player + "</option>";
            options.push(option);
        }

        $('.selectpicker').html(options);
        $('.selectpicker').selectpicker('refresh');

        //For each player, iterate through and create data objects for each year that the player played in the NFL
        let pastData = [];
        for(let player of playerNames) {

            let yearData = d.filter(row => {
                return row.Name === player;
            });
            //Data for each year for current player parsed into an object
            let yearList = [];
            for(let row of yearData) {
                let year = row.Year;
                let obj = {
                    [year] : {
                        "team": row.Tm,
                        "position": row.FantPos,
                        "age": row.Age,
                        "games": row.G,
                        "gamesStarted": row.GS,
                        "passing": {
                            "completions": row.Cmp,
                            "attempts": row.PassAtt,
                            "passingYards": row.PassYds,
                            "touchdownPasses": row.PassTD,
                            "interceptions": row.Int
                        },
                        "rushing": {
                            "attempts": row.RushAtt,
                            "rushingYards": row.RushYds,
                            "yardsPerAttempt": row["Y/A"],
                            "rushingTouchdowns": row.RushTD
                        },
                        "receiving": {
                            "target": row.Tgt,
                            "receptions": row.Rec,
                            "receivingYards": row.RecYds,
                            "yardsPerReception": row["Y/R"],
                            "receivingTouchdowns": row.RecTD
                        },
                        "fantasyPoints": (row.FantPt !== '') ? row.FantPt : '0',
                        "ppr": row.PPR,
                        "ppg": row.PPG,
                        "pprpg": row.PPRPG,
                        "positionRank": row.PosRank
                    }
                };
                //update the year list for given year for player
                yearList.push(obj);
            }
            //add player data to pastData object
            let playerObj = {
                "name": player,
                "years": yearList
            };
            pastData.push(playerObj);
        };
        return pastData;
    });
    return data;
}
