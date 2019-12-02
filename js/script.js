loadFile('data/Raw_Data_10yrs.csv').then(data => {
    loadMaxes('data/Raw_Data_10yrs.csv').then(data2 => {
        let mainView = new Main(data, data2);
        mainView.setupView();
        mainView.updateView();
    });

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

// Workaround since jQuery can't click D3 generated element... taken from
// https://stackoverflow.com/questions/9063383/how-to-invoke-click-event-programmatically-in-d3
jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = new MouseEvent("click");
      e.dispatchEvent(evt);
    });
  };

// Click the arcs to show rotation for the user and get default data
$(document).ready(function() {
    setTimeout(function() {
        $('#textPointsFantasyPoints').d3Click();
        $('#textPassingTouchdowns').d3Click();
        $('#textRushingTouchdowns').d3Click();
        $('#textReceivingTouchdowns').d3Click();
    }, 1200);
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

        //For each player, iterate through and create data objects for each year that the player played in the NFL
        let pastData = [];
        for(let player of playerNames) {

            let yearData = d.filter(row => {
                return row.Name === player;
            });
            //Data for each year for current player parsed into an object
            let yearList = [];
            for(let row of yearData) {
                if (row.FantPos === '') {
                    continue;
                }
                let year = row.Year;
                let obj = {
                    "year": year,
                    "team": row.Tm,
                    "position": row.FantPos,
                    "age": isNaN(parseInt(row.Age)) ? 0 : parseInt(row.Age),
                    "games": isNaN(parseInt(row.G)) ? 0 : parseInt(row.G),
                    "gamesStarted": isNaN(parseInt(row.GS)) ? 0 : parseInt(row.GS),
                    "passing": {
                        "completions": isNaN(parseInt(row.Cmp)) ? 0 : parseInt(row.Cmp),
                        "attempts": isNaN(parseInt(row.PassAtt)) ? 0 : parseInt(row.PassAtt),
                        "passingYards": isNaN(parseInt(row.PassYds)) ? 0 : parseInt(row.PassYds),
                        "touchdownPasses": isNaN(parseInt(row.PassTD)) ? 0 : parseInt(row.PassTD),
                        "interceptions": isNaN(parseInt(row.Int)) ? 0 : parseInt(row.Int)
                    },
                    "rushing": {
                        "attempts": isNaN(parseInt(row.RushAtt)) ? 0 : parseInt(row.RushAtt),
                        "rushingYards": isNaN(parseInt(row.RushYds)) ? 0 : parseInt(row.RushYds),
                        "yardsPerAttempt": (row["Y/A"] !== '' || row["Y/A"] > 0) ? row["Y/A"] : '0',
                        "rushingTouchdowns": isNaN(parseInt(row.RushTD)) ? 0 : parseInt(row.RushTD)
                    },
                    "receiving": {
                        "target": isNaN(parseInt(row.Tgt)) ? 0 : parseInt(row.Tgt),
                        "receptions": isNaN(parseInt(row.Rec)) ? 0 : parseInt(row.Rec),
                        "receivingYards": isNaN(parseInt(row.RecYds)) ? 0 : parseInt(row.RecYds),
                        "yardsPerReception": (row["Y/R"] !== '' || row["Y/R"] > 0) ? row["Y/R"] : '0',
                        "receivingTouchdowns": isNaN(parseInt(row.RecTD)) ? 0 : parseInt(row.RecTD)
                    },
                    "fantasyPoints": (row.FantPt !== '' || row.Fantpt > 0) ? row.FantPt : '0',
                    "ppr": row.PPR,
                    "ppg": row.PPG,
                    "pprpg": row.PPRPG,
                    "positionRank": row.PosRank
                };
                //update the year list for given year for player
                yearList.push(obj);
            }
            //add player data to pastData object
            let playerObj = {
                "name": player,
                "years": yearList
            };
            if (yearList.length !== 0) {
                pastData.push(playerObj);
            }
        };

        // Render the dropdown menu with all the player names
        let options = [];
        for (let player of pastData) {
            // Based on first year the player played
            const playerData = player.years[0];

            // For duplicate players, they have there names different with an underscore, so we want to just display the actual name
            const actualName = player.name.split('_')[0];

            let option = `<option value="${player.name}" data-subtext="${playerData.team} ${playerData.position}">${actualName}</option>`;
            options.push(option);
        }

        $('.selectpicker').html(options);
        $('.selectpicker').selectpicker('refresh');

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
            returnObj[i] = {};
            for (let pos of positions) {    
                returnObj[i][pos] = {
                    "Passing": {
                        "Completions": 1,
                        "Attempts": 1,
                        "Passing Yards": 1,
                        "Touchdowns": 1,
                        "Interceptions": 1
                    },
                    "Rushing": {
                        "Attempts": 1,
                        "Rushing Yards": 1,
                        "Yards Per Attempt": 1,
                        "Touchdowns": 1,
                    },
                    "Receiving": {
                        "Targets": 1,
                        "Receptions": 1,
                        "Receiving Yards": 1,
                        "Yards Per Reception": 1,
                        "Touchdowns": 1
                    },
                    "Points": {
                        "Fantasy Points": 1,
                        "PPR Points": 1,
                        "PPG": 1,
                        "PPRPG": 1,
                        "Position Rank": 1
                    }
                }
            }
        }

        for (let row of d) {
            let yearData = returnObj[row.Year][row.FantPos];

            // Un used players have no position, just continue
            if (row.FantPos === '')
                continue;

            // Passing
            yearData['Passing']['Completions'] = yearData['Passing']['Completions'] > Number(row.Cmp) ? yearData['Passing']['Completions'] : Number(row.Cmp);
            yearData['Passing']['Attempts'] = yearData['Passing']['Attempts'] > Number(row.PassAtt) ? yearData['Passing']['Attempts'] : Number(row.PassAtt);
            yearData['Passing']['Passing Yards'] = yearData['Passing']['Passing Yards'] > Number(row.PassYds) ? yearData['Passing']['Passing Yards'] : Number(row.PassYds);
            yearData['Passing']['Touchdowns'] = yearData['Passing']['Touchdowns'] > Number(row.PassTD) ? yearData['Passing']['Touchdowns'] : Number(row.PassTD);
            yearData['Passing']['Interceptions'] = yearData['Passing']['Interceptions'] > Number(row.Int) ? yearData['Passing']['Interceptions'] : Number(row.Int);

            // Rushing
            yearData['Rushing']['Attempts'] = yearData['Rushing']['Attempts'] > Number(row.RushAtt) ? yearData['Rushing']['Attempts'] : Number(row.RushAtt);
            yearData['Rushing']['Rushing Yards'] = yearData['Rushing']['Rushing Yards'] > Number(row.RushYds) ? yearData['Rushing']['Rushing Yards'] : Number(row.RushYds);
            yearData['Rushing']['Yards Per Attempt'] = yearData['Rushing']['Yards Per Attempt'] > Number(row["Y/A"]) ? yearData['Rushing']['Yards Per Attempt'] : Number(row["Y/A"]);
            yearData['Rushing']['Touchdowns'] = yearData['Rushing']['Touchdowns'] > Number(row.RushTD) ? yearData['Rushing']['Touchdowns'] : Number(row.RushTD);

            // Receiving
            yearData['Receiving']['Targets'] = yearData['Receiving']['Targets'] > Number(row.Tgt) ? yearData['Receiving']['Targets'] : Number(row.Tgt);
            yearData['Receiving']['Receptions'] = yearData['Receiving']['Receptions']> Number(row.Rec) ? yearData['Receiving']['Receptions']: Number(row.Rec);
            yearData['Receiving']['Receiving Yards'] = yearData['Receiving']['Receiving Yards'] > Number(row.RecYds) ? yearData['Receiving']['Receiving Yards'] : Number(row.RecYds);
            yearData['Receiving']['Yards Per Reception'] = yearData['Receiving']['Yards Per Reception'] > Number(row["Y/R"]) ? yearData['Receiving']['Yards Per Reception'] : Number(row["Y/R"]);
            yearData['Receiving']['Touchdowns'] = yearData['Receiving']['Touchdowns'] > Number(row.RecTD) ? yearData['Receiving']['Touchdowns'] : Number(row.RecTD);

            // Scoring
            yearData['Points']['Fantasy Points'] = yearData['Points']['Fantasy Points'] > Number(((row.FantPt !== '') ? row.FantPt : 0)) ? yearData['Points']['Fantasy Points'] : Number(((row.FantPt !== '') ? row.FantPt : 0));
            yearData['Points']['PPR Points'] = yearData['Points']['PPR Points'] > Number(((row.PPR !== '') ? row.PPR : 0)) ? yearData['Points']['PPR Points'] : Number(((row.PPR !== '') ? row.PPR : 0));
            yearData['Points']['PPG'] = yearData['Points']['PPG'] > Number(((row.PPG !== '') ? row.PPG : 0)) ? yearData['Points']['PPG'] : Number(((row.PPG !== '') ? row.PPG : 0));
            yearData['Points']['PPRPG'] = yearData['Points']['PPRPG'] > Number(((row.PPRPG !== '') ? row.PPRPG : 0)) ? yearData['Points']['PPRPG'] : Number(((row.PPRPG !== '') ? row.PPRPG : 0));
            yearData['Points']['Position Rank'] = yearData['Points']['Position Rank'] > Number(((row.PosRank !== '') ? row.PosRank : 0)) ? yearData['Points']['Position Rank'] : Number(((row.PosRank !== '') ? row.PosRank : 0));
        }
        return returnObj;
    });
    return data;
}
