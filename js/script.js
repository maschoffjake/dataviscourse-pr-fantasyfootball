loadFile('data/Raw_Data_10yrs.csv').then(data => {
    let mainView = new Main(data);
    mainView.setupView();
    mainView.updateView();

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
                        "fantasyPoints": (row.FantPt !== '' && row.Fantpt > 0) ? row.FantPt : '0',
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

async function loadMaxes(file) {
    let data = await d3.csv(file).then(d => {
        let returnObj = {};

        // Add filter for all positions too
        let positions = ['QB', 'RB', 'WR', 'TE'];

        // Intialize object 
        for (let i = 2008; i <= 2018; i++) {
            returnObj[i] = {
                "passing": {
                    "completions": 0,
                    "attempts": 0,
                    "passingYards": 0,
                    "touchdownPasses": 0,
                    "interceptions": 0
                },
                "rushing": {
                    "attempts": 0,
                    "rushingYards": 0,
                    "yardsPerAttempt": 0,
                    "rushingTouchdowns": 0,
                },
                "receiving": {
                    "target": 0,
                    "receptions": 0,
                    "receivingYards": 0,
                    "yardsPerReception": 0,
                    "receivingTouchdowns": 0
                },
                "scoring": {
                    "fantasyPoints": 0,
                    "ppr": 0,
                    "ppg": 0,
                    "pprpg": 0,
                    "positionRank": 0
                }
            }
        }

        for (let row of d) {
            let yearData = returnObj[row.Year];

            // Passing
            yearData.passing.completions = yearData.passing.completions > Number(row.Cmp) ? yearData.passing.completions : Number(row.Cmp);
            yearData.passing.attempts = yearData.passing.attempts > Number(row.PassAtt) ? yearData.passing.attempts : Number(row.PassAtt);
            yearData.passing.passingYards = yearData.passing.passingYards > Number(row.PassYds) ? yearData.passing.passingYards : Number(row.PassYds);
            yearData.passing.touchdownPasses = yearData.passing.touchdownPasses > Number(row.PassTD) ? yearData.passing.touchdownPasses : Number(row.PassTD);
            yearData.passing.interceptions = yearData.passing.interceptions > Number(row.Int) ? yearData.passing.interceptions : Number(row.Int);

            // Rushing
            yearData.rushing.attempts = yearData.rushing.attempts > Number(row.RushAtt) ? yearData.rushing.attempts : Number(row.RushAtt);
            yearData.rushing.rushingYards = yearData.rushing.rushingYards > Number(row.RushYds) ? yearData.rushing.rushingYards : Number(row.RushYds);
            yearData.rushing.yardsPerAttempt = yearData.rushing.yardsPerAttempt > Number(row["Y/A"]) ? yearData.rushing.yardsPerAttempt : Number(row["Y/A"]);
            yearData.rushing.rushingTouchdowns = yearData.rushing.rushingTouchdowns > Number(row.RushTD) ? yearData.rushing.rushingTouchdowns : Number(row.RushTD);

            // Receiving
            yearData.receiving.target = yearData.receiving.target > Number(row.Tgt) ? yearData.receiving.target : Number(row.Tgt);
            yearData.receiving.receptions = yearData.receiving.receptions > Number(row.Rec) ? yearData.receiving.receptions : Number(row.Rec);
            yearData.receiving.receivingYards = yearData.receiving.receivingYards > Number(row.RecYds) ? yearData.receiving.receivingYards : Number(row.RecYds);
            yearData.receiving.yardsPerReception = yearData.receiving.yardsPerReception > Number(row["Y/R"]) ? yearData.receiving.yardsPerReception : Number(row["Y/R"]);
            yearData.receiving.receivingTouchdowns = yearData.receiving.receivingTouchdowns > Number(row.RecTD) ? yearData.receiving.receivingTouchdowns : Number(row.RecTD);

            // Scoring
            yearData.scoring.fantasyPoints = yearData.scoring.fantasyPoints > Number(((row.FantPt !== '' || row.FantPt !== '#DIV/0!') ? row.FantPt : 0)) ? yearData.scoring.fantasyPoints : Number(((row.FantPt !== '') ? row.FantPt : 0));
            yearData.scoring.ppr = yearData.scoring.ppr > Number(((row.PPR !== '' || row.PPR !== '#DIV/0!') ? row.PPR : 0)) ? yearData.scoring.ppr : Number(((row.PPR !== '') ? row.PPR : 0));
            yearData.scoring.ppg = yearData.scoring.ppg > Number(((row.PPG !== '' || row.PPG !== '#DIV/0!') ? row.PPG : 0)) ? yearData.scoring.ppg : Number(((row.PPG !== '') ? row.PPG : 0));
            yearData.scoring.pprpg = yearData.scoring.pprpg > Number(((row.PPRPG !== '' || row.PPRPG !== '#DIV/0!') ? row.PPRPG : 0)) ? yearData.scoring.pprpg : Number(((row.PPRPG !== '') ? row.PPRPG : 0));
            yearData.scoring.positionRank = yearData.scoring.positionRank > Number(((row.PosRank !== '' || row.PosRank !== '#DIV/0!') ? row.PosRank : 0)) ? yearData.scoring.positionRank : Number(((row.PosRank !== '') ? row.PosRank : 0));
       
            if (Number(((row.PPG !== '') ? row.PPG : 0)) === NaN) {
                console.log(row.PPG);
            }
        }

        console.log(returnObj);
        return returnObj;
    });
    return data;
}
