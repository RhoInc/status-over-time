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
    
    totals.forEach(function(d){
        d.count=d.values.length
        d.date=date
    })
    return totals;
}