loadFile('data/RawData10yrs_v3.xlsx').then(data => {
    console.log(data);
});

async function loadFile(file) {
    let data = await d3.csv(file).then(d => {


    });
    return data;
}