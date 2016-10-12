export default function getStatusCut(raw, statusVar, date){
    //flag events that are active on the given date 
    var matches = raw.filter(function(d){
        var startFlag = d.start_date <= date
        var stopFlag = d.stop_date > date
        return  startFlag & stopFlag
    })

    //return the summary data            
    var totals = d3.nest()
    .key(function(d){return d[statusVar]})
    .entries(matches)
    
    totals.overall = d3.sum(totals, function(d){return d.values.length});
    totals.count_cumulative = 0;
    totals.percent_cumulative = 0;
    totals.sort(function(a,b){return a.key<b.key ? -1 : b.key<a.key?1:0})
    totals.forEach(function(d){
        d.count=d.values.length;
        d.percent=d.count / totals.overall;
        d.date=date;

        totals.count_cumulative = totals.count_cumulative + d.count;
        totals.percent_cumulative = totals.percent_cumulative + d.percent;

        d.count_cumulative = totals.count_cumulative;
        d.percent_cumulative = totals.percent_cumulative;
    })    

    return totals;
}



