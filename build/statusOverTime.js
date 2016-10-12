"use strict";

var statusOverTime = (function (webcharts) {
	'use strict';

	var settings = {
		//Custom settings for this template
		start_var: "start_date",
		stop_var: "stop_date",
		status_var: "status",
		id_vars: ["id"],
		interval: "day", //valid d3.time.interval (e.g. "day", "week", "month")
		date_format: "%m/%d/%y",
		cumulative: false,
		display: "line", //"line" or "bar"

		//standard webcharts settings
		"max_width": 1000,
		"aspect": 2,
		"y": {
			"label": "Count",
			"type": "linear",
			"column": "count",
			"behavior": "flex"
		},
		"x": {
			"type": "time",
			"column": "date"
		},
		"marks": [{
			"type": "line",
			"per": ["key"],
			"summarizeY": "sum"
		}],
		"gridlines": "x",
		"color_by": "key",
		"interpolate": "step-before"
	};

	// Replicate settings in multiple places in the settings object
	function syncSettings(settings) {
		//example: settings.y.column = settings.id_col;
		return settings;
	}

	// Default Control objects
	var controlInputs = [{ type: "subsetter", value_col: "key", label: "Filter by Period", multiple: true }, { type: "dropdown", option: "y.column", label: "Cumulative?", values: ["count", "count_cumulative"] }];

	// Map values from settings to control inputs
	function syncControlInputs(controlInputs, settings) {
		//example:
		//	var measureControl = controlInputs.filter(function(d){return d.label=="Measure"})[0]
		//  measureControl.value_col = mergedSettings.measure_col;
		return controlInputs;
	}

	function getStatusCut(raw, statusVar, date) {
		//flag events that are active on the given date
		var matches = raw.filter(function (d) {
			var startFlag = d.start_date <= date;
			var stopFlag = d.stop_date > date;
			return startFlag & stopFlag;
		});

		//return the summary data           
		var totals = d3.nest().key(function (d) {
			return d[statusVar];
		}).entries(matches);

		totals.overall = d3.sum(totals, function (d) {
			return d.values.length;
		});
		totals.count_cumulative = 0;
		totals.percent_cumulative = 0;
		totals.sort(function (a, b) {
			return a.key < b.key ? -1 : b.key < a.key ? 1 : 0;
		});
		totals.forEach(function (d) {
			d.count = d.values.length;
			d.percent = d.count / totals.overall;
			d.date = date;

			totals.count_cumulative = totals.count_cumulative + d.count;
			totals.percent_cumulative = totals.percent_cumulative + d.percent;

			d.count_cumulative = totals.count_cumulative;
			d.percent_cumulative = totals.percent_cumulative;
		});

		return totals;
	}

	//create a data set that is one record per date per status.   
	function getStatusByDate(rawData, dateArray, statusVar) {
		var allData = [];
		dateArray.forEach(function (date, i) {
			//get status information for each time cut
			var statusCut = getStatusCut(rawData, statusVar, date);
			allData = d3.merge([allData, statusCut]);
		});

		return allData;
	}

	function dataPrep(chart) {
		var config = chart.config;

		//print warnings for ids with overlapping dates
		if (config.id_cols) idWarning(config.id_cols);

		//convert dates from character to date objects
		chart.raw_data.forEach(function (d) {
			d.start_date = d3.time.format(config.date_format).parse(d[config.start_var]);
			d.stop_date = d3.time.format(config.date_format).parse(d[config.stop_var]);
		});

		//calculate the first and last date in the data and store them as settings
		var startDates = chart.raw_data.map(function (d) {
			return d.start_date;
		});
		var stopDates = chart.raw_data.map(function (d) {
			return d.stop_date;
		});
		var allDates = d3.merge([startDates, stopDates]);

		var sortedDates = allDates.sort(function (a, b) {
			return a > b ? 1 : a < b ? -1 : 0;
		});

		var minDate = sortedDates[0];
		var maxDate = sortedDates[sortedDates.length - 1];

		//get list of dates where we want to calculate statuses
		var dateArray = d3.time[config.interval].range(minDate, maxDate);

		//create a data set that is one record per date per status.
		chart.super_raw_data = chart.raw_data;
		chart.raw_data = getStatusByDate(chart.super_raw_data, dateArray, config.status_var);
		console.log(chart.raw_data);
	};

	function onInit() {
		var chart = this;
		dataPrep(chart);
	};

	function onLayout() {}

	function onDataTransform() {}

	function onDraw() {}

	function onResize() {}

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

	function statusOverTime(element, settings$$) {

		//merge user's settings with defaults
		var mergedSettings = Object.assign({}, settings, settings$$);

		//keep settings in sync with the data mappings
		mergedSettings = syncSettings(mergedSettings);

		//keep control inputs in sync and create controls object (if needed)
		var syncedControlInputs = syncControlInputs(controlInputs, mergedSettings);
		var controls = webcharts.createControls(element, { location: 'top', inputs: syncedControlInputs });

		//create chart
		var chart = webcharts.createChart(element, mergedSettings, controls);
		chart.on('init', onInit);
		chart.on('layout', onLayout);
		chart.on('datatransform', onDataTransform);
		chart.on('draw', onDraw);
		chart.on('resize', onResize);

		return chart;
	}

	return statusOverTime;
})(webCharts);

