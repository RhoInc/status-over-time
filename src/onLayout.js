import getStatusByDate from './custom/getStatusByDate';

export default function onLayout() {
    var context = this

  //Select status filter.
    var statusFilter = d3.selectAll('.control-group')
        .filter(function() {
            return d3.select(this).select('.control-label').text() === 'Filter by Status'; });

  //Modify status filter's fucntionality.
    statusFilter
        .on('change', () => {
          //Capture currently selected study statuses.
            var statuses = [];
            statusFilter
                .selectAll('option')
                .filter(function() {
                    return d3.select(this).property('selected'); })
                .each(d => statuses.push(d));

          //Filter raw data on currently selected study statuses.
            var super_raw_data = context.super_raw_data
                .filter(d => statuses.indexOf(d[context.config.status_var]) > -1);

          //Recalculate first and last date in the data and store them as settings.
            var startDates = super_raw_data.map(d => d.start_date);
            var stopDates = super_raw_data.map(d => d.stop_date);
            var allDates = d3.merge([startDates, stopDates]);

            var sortedDates = allDates.sort(function (a, b) {
                return a > b ? 1 : a < b ? -1 : 0;
            });

            var minDate = sortedDates[0];
            var maxDate = sortedDates[sortedDates.length - 1];

          //Get list of dates where we want to calculate statuses.
            var dateArray = d3.time[context.config.interval].range(minDate, maxDate);

            var raw_data = getStatusByDate(super_raw_data, dateArray, context.config);
            context.draw(raw_data);
        });
}
