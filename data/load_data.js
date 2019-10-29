const URL = 'http://api.fantasy.nfl.com/v1/players/stats?statType=seasonStats&season=2019&week=9&format=json';

fetch(URL)
    .then(data => {
        console.log(data.json());
        return data.json();
    })
    .then(res => {
        console.log(res);
    })