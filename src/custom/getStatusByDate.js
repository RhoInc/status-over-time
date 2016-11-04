import getStatusCut from './getStatusCut';

//create a data set that is one record per date per status.    
export default function getStatusByDate(rawData, dateArray, config) {
    var allData = [];

    dateArray.forEach(function(date,i) {
        var statusCut = getStatusCut(rawData, date, config.status_var, config.statuses);
        allData = d3.merge([allData, statusCut]);
    });

    return allData;
}
