var statusOverTime = function (webcharts) {
    'use strict';

    const defaultSettings =
    //Custom template settings
    { start_var: 'start_date',
        stop_var: 'stop_date',
        status_var: 'status',
        statuses: [],
        id_vars: ['id'],
        interval: 'day' //valid d3.time.interval (e.g. 'day', 'week', 'month')
        , date_format: '%m/%d/%y',
        date_range: [null, null]
        //Standard webcharts settings
        , x: { type: 'time',
            column: 'date',
            label: ''
        },
        y: { type: 'linear',
            column: 'cumulative',
            label: 'Frequency',
            behavior: 'flex',
            domain: [0, null]
        },
        marks: [{ type: 'line',
            per: ['key'],
            summarizeY: 'sum' }],
        color_by: 'key',
        legend: {},
        gridlines: 'y',
        interpolate: 'step-before',
        aspect: 2.5
    };

    // Replicate settings in multiple places in the settings object
    function syncSettings(settings) {
        settings.x.domain = settings.date_range;
        settings.legend.label = settings.status_var.substring(0, 1).toUpperCase() + settings.status_var.substring(1).toLowerCase();
        settings.legend.order = settings.statuses;

        return settings;
    }

    // Default Control objects
    const controlInputs = [{ type: 'subsetter',
        value_col: 'key',
        label: 'Filter by Status',
        multiple: true }, { type: 'radio',
        option: 'y.column',
        label: 'Frequency Type',
        values: ['cumulative', 'count'],
        relabels: ['Cumulative', 'By status'] }];

    // Map values from settings to control inputs
    function syncControlInputs(controlInputs, settings) {
        return controlInputs;
    }

    function getStatusCut(raw, date, statusVar, statuses) {
        //Subset data on events which overlap the given date.
        var matches = raw.filter(d => {
            var startFlag = d.start_date <= date;
            var stopFlag = d.stop_date > date;

            return startFlag && stopFlag;
        });

        //Nest data by [ statusVar ].
        var totals = d3.nest().key(d => d[statusVar]).entries(matches);

        //Create objects for statuses which do not appear in the current data subset.
        statuses.forEach(d => {
            if (totals.map(di => di.key).indexOf(d) === -1) totals.push({ key: d,
                values: [] });
        });

        //Sort nested data by [ statuses ] then count both within each status and across statuses (cumulatively).
        var cumulative = 0;
        totals.sort(function (a, b) {
            return statuses.indexOf(a.key) < statuses.indexOf(b.key) ? -1 : 1;
        }).forEach(function (d, i) {
            d.count = d.values.length;
            cumulative += d.count;
            d.cumulative = cumulative;
            d.date = date;
        });

        return totals;
    }

    //create a data set that is one record per date per status.    
    function getStatusByDate(rawData, dateArray, config) {
        var allData = [];

        dateArray.forEach(function (date, i) {
            var statusCut = getStatusCut(rawData, date, config.status_var, config.statuses);
            allData = d3.merge([allData, statusCut]);
        });

        return allData;
    }

    function dataPrep(chart) {
        var config = chart.config;

        //Print warnings for ids with overlapping dates.
        if (config.id_cols) idWarning(config.id_cols);

        //Convert dates from character to date objects.
        chart.raw_data.forEach(d => {
            d.start_date = d3.time.format(config.date_format).parse(d[config.start_var]);
            d.stop_date = d3.time.format(config.date_format).parse(d[config.stop_var]);
        });

        //Calculate the first and last date in the data and store them as settings.
        var startDates = chart.raw_data.map(d => d.start_date);
        var stopDates = chart.raw_data.map(d => d.stop_date);
        var allDates = d3.merge([startDates, stopDates]);

        var sortedDates = allDates.sort(function (a, b) {
            return a > b ? 1 : a < b ? -1 : 0;
        });

        var minDate = sortedDates[0];
        var maxDate = sortedDates[sortedDates.length - 1];

        //Get list of dates where we want to calculate statuses.
        var dateArray = d3.time[config.interval].range(minDate, maxDate);

        //Create a data set that is one record per date per status.
        chart.super_raw_data = chart.raw_data;
        chart.raw_data = getStatusByDate(chart.super_raw_data, dateArray, config);
    }

    function onInit() {
        var context = this;
        if (!Array.isArray(this.config.statuses) || this.config.statuses.length === 0) this.config.statuses = d3.set(this.raw_data.map(d => d[this.config.status_var])).values().sort();
        dataPrep(context);
    }

    function onLayout() {
        var context = this;
    }

    function onDataTransform() {
        var context = this;
    }

    function onDraw() {
        var context = this;
    }

    function onResize() {
        var context = this;
        //Add x/y values of mouseover.
        var timeFormat = d3.time.format('%d %b %Y');
        var width = this.plot_width;
        var x = this.x;
        var y = this.y;
        var decim = d3.format('.0f');

        var x_mark = this.svg.select('.x.axis').append('g').attr('class', 'hover-item hover-tick hover-tick-x').style('display', 'none');
        x_mark.append('line').attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 0).attr('stroke', '#ddd');
        x_mark.append('text').attr({ 'id': 'dateText', 'x': 0, 'y': -this.plot_height, 'dx': '.5em', 'dy': '.5em' });
        x_mark.append('text').attr({ 'id': 'countText', 'x': 0, 'y': -this.plot_height, 'dx': '.5em', 'dy': '.5em' });
        x_mark.select('line').attr('y1', -this.plot_height);

        //var frequencyType = d3.selectAll('.control-group')
        //    .filter(function() {
        //        return d3.select(this).select('.control-label').text() === 'Frequency Type'; })
        //    .selectAll('option')
        //    .filter(function() {
        //        return d3.select(this).property('selected'); })
        //    .property('value');

        this.svg.on('mousemove', mousemove).on('mouseover', function () {
            context.svg.selectAll('.hover-item').style('display', 'block');
            var leg_items = context.wrap.select('.legend').selectAll('.legend-item');
            leg_items.select('.legend-color-block').style('display', 'none');
            leg_items.select('.legend-mark-text').style('display', 'inline');
        }).on('mouseout', function () {
            context.svg.selectAll('.hover-item').style('display', 'none');
            var leg_items = context.legend.selectAll('.legend-item');
            leg_items.select('.legend-color-block').style('display', 'inline-block');
            leg_items.select('.legend-mark-text').style('display', 'none');
        });

        function mousemove() {
            var mouse = this;

            context.current_data.forEach(function (e) {
                var line_data = e.values;
                var bisectDate = d3.bisector(function (d) {
                    return new Date(d.key);
                }).right;
                var x0 = x.invert(d3.mouse(mouse)[0]);
                var i = bisectDate(line_data, x0, 1, line_data.length - 1);
                var d0 = line_data[i - 1];
                var d1 = line_data[i];

                if (!d0 || !d1) return;

                var d = x0 - new Date(d0.key) > new Date(d1.key) - x0 ? d1 : d0;
                var hover_tick_x = context.svg.select(".hover-tick-x");
                var focus_enr = context.svg.selectAll(".focus").filter(function (f) {
                    return f.key === e.key;
                });

                hover_tick_x.select("#dateText").text(timeFormat(x0)).attr("text-anchor", x(x0) > width / 2 ? "end" : "start").attr("dx", x(x0) > width / 2 ? "-.5em" : ".5em");

                var leg_item = context.wrap.select(".legend").selectAll(".legend-item").filter(function (f) {
                    return f.label === e.key;
                });

                var currentYear = x0.getYear() + 1900;
                var currentMonth = x0.getMonth();
                var currentDay = x0.getDate();
                var nextMonth = new Date(currentYear, currentMonth + 1, 1);
                nextMonth.setDate(nextMonth.getDate() - 1);
                var daysInCurrentMonth = nextMonth.getDate();

                var firstOfTheMonth = timeFormat(new Date(currentYear, x0.getMonth() + (currentDay > Math.round(daysInCurrentMonth / 2) ? 1 : 0), 1));
                var lineDate = timeFormat(d.values.raw[0].date);
                leg_item.select(".legend-mark-text").text((d.values.raw[0].count || d.values.raw[0].count === 0) && lineDate === firstOfTheMonth ? decim(d.values.raw[0].count) : lineDate !== firstOfTheMonth ? 0 : null);
                hover_tick_x.attr("transform", "translate(" + x(x0) + ",0)"); //move tick reference on x-axis
                var total = d3.sum(d3.selectAll('.legend-mark-text').pop(), function (span) {
                    return +span.textContent;
                });
                hover_tick_x.select("#countText").text(total).attr("text-anchor", x(x0) > width / 2 ? "start" : "end").attr("dx", x(x0) > width / 2 ? ".5em" : "-.5em");
            });
        };
    }

    if (typeof Object.assign != 'function') {
        (function () {
            Object.assign = function (target) {
                'use strict';

                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var output = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if (source !== undefined && source !== null) {
                        for (var nextKey in source) {
                            if (source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            };
        })();
    }

    function statusOverTime(element, settings) {

        //Merge user's settings with defaults.
        let mergedSettings = Object.assign({}, defaultSettings, settings);

        //Keep settings in sync with the data mappings.
        mergedSettings = syncSettings(mergedSettings);

        //Keep control inputs in sync and create controls object (if needed).
        let syncedControlInputs = syncControlInputs(controlInputs, mergedSettings);
        let controls = webcharts.createControls(element, { location: 'top',
            inputs: syncedControlInputs });

        //Create chart.
        let chart = webcharts.createChart(element, mergedSettings, controls);
        chart.on('init', onInit);
        chart.on('layout', onLayout);
        chart.on('datatransform', onDataTransform);
        chart.on('draw', onDraw);
        chart.on('resize', onResize);

        return chart;
    }

    return statusOverTime;
}(webCharts);

