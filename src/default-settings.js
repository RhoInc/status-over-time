const defaultSettings =
  //Custom template settings
    {start_var: 'start_date'
    ,stop_var: 'stop_date'
    ,status_var: 'status'
    ,statuses: []
    ,id_vars: ['id']
    ,interval: 'day' //valid d3.time.interval (e.g. 'day', 'week', 'month')
    ,date_format: '%m/%d/%y'
    ,date_range: [null,null]
  //Standard webcharts settings
    ,x: {type: 'time'
        ,column: 'date'
        ,label: ''
    }
    ,y: {type: 'linear'
        ,column: 'cumulative'
        ,label: 'Frequency'
        ,behavior: 'flex'
        ,domain: [0,null]
    }
    ,marks:
        [   {type: 'line'
            ,per: ['key']
            ,summarizeY: 'sum'}
        ]
    ,color_by: 'key'
    ,legend:
        {}
    ,gridlines: 'y'
    ,interpolate: 'step-before'
    ,aspect: 2.5
    };

// Replicate settings in multiple places in the settings object
export function syncSettings(settings) {
    settings.x.domain = settings.date_range;
    settings.legend.label =
        settings.status_var.substring(0,1).toUpperCase() +
        settings.status_var.substring( 1 ).toLowerCase();
    settings.legend.order = settings.statuses;

    return settings;
}

// Default Control objects
export const controlInputs =
    [   {type: 'subsetter'
        ,value_col: 'key'
        ,label: 'Filter by Status'
        ,multiple: true}
    ,
        {type: 'radio'
        ,option: 'y.column'
        ,label: 'Frequency Type'
        ,values: ['cumulative', 'count']
        ,relabels: ['Cumulative', 'By status']}
    ];

// Map values from settings to control inputs
export function syncControlInputs(controlInputs, settings) {
    return controlInputs
}

export default defaultSettings
