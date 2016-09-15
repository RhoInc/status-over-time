import getStatusByDate from './getStatusByDate';

export default function dataPrep(chart){
    var config = chart.config;

    //print warnings for ids with overlapping dates
    if(config.id_cols) idWarning(config.id_cols)

    //convert dates from character to date objects
    chart.raw_data.forEach(function(d){
        d.start_date=d3.time.format(config.date_format).parse(d[config.start_var])
        d.stop_date=d3.time.format(config.date_format).parse(d[config.stop_var])
    })

    //calculate the first and last date in the data and store them as settings
    var startDates = chart.raw_data.map(function(d){return d.start_date})
    var stopDates = chart.raw_data.map(function(d){return d.stop_date})
    var allDates = d3.merge([startDates, stopDates])

    var sortedDates = allDates
    .sort(function(a,b){
        return a>b ? 1 : a<b ? -1 : 0;
    })

    var minDate = sortedDates[0]
    var maxDate = sortedDates[sortedDates.length-1];        

    //get list of dates where we want to calculate statuses
    var dateArray = d3.time[config.interval].range(minDate,maxDate)
    
    //create a data set that is one record per date per status.
    chart.super_raw_data = chart.raw_data
    chart.raw_data = getStatusByDate(chart.super_raw_data, dateArray, config.status_var) 
    console.log(chart.raw_data)
};