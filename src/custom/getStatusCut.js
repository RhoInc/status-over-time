export default function getStatusCut(raw, date, statusVar, statuses) {
  //Subset data on events which overlap the given date.
    var matches = raw.filter(d => {
        var startFlag = d.start_date <= date;
        var stopFlag = d.stop_date > date;

        return startFlag && stopFlag;
    });

  //Nest data by [ statusVar ].
    var totals = d3.nest()
        .key(d => d[statusVar])
        .entries(matches);

  //Create objects for statuses which do not appear in the current data subset.
    statuses
        .forEach(d => {
            if (totals.map(di => di.key).indexOf(d) === -1)
                totals.push(
                    {key: d
                    ,values: []});
        });

  //Sort nested data by [ statuses ] then count both within each status and across statuses (cumulatively).
    var cumulative = 0;
    totals
        .sort(function(a,b) {
            return statuses.indexOf(a.key) < statuses.indexOf(b.key) ? -1 : 1; })
        .forEach(function (d,i) {
            d.count = d.values.length;
            cumulative += d.count;
            d.cumulative = cumulative;
            d.date = date;
        });

    return totals;
}
