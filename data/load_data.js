const URL = 'http://api.fantasy.nfl.com/v1/players/stats?statType=seasonStats&season=2019&week=9&format=json';

fetch(URL)
    .then(data => {
        console.log(data.json());
        return data.json();
    })
    .then(res => {
        console.log(res);
    });

/**
 * Class used for storing past NFL Fantasy Stats (years 2008 - 2018)
 */
class PastData {

    /**
     * Construct the data object after being passed in a CSV file
     * @param {*} filepath The filepath to the CSV file
     */
    constructor(filepath) {

        

    }
}