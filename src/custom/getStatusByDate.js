import getStatusCut from './getStatusCut';

//create a data set that is one record per date per status.    
export default function getStatusByDate(rawData, dateArray, statusVar){
    var allData = []
    dateArray.forEach(function(date,i){
        var statusCut = getStatusCut(rawData, statusVar, date)
        allData = d3.merge([allData, statusCut])
    })

    return allData;
}