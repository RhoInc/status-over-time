const settings = {
        //Custom settings for this template
        start_var:"start_date",
        stop_var:"stop_date",
        status_var:"status",
        id_vars:["id"],
        interval:"day", //valid d3.time.interval (e.g. "day", "week", "month")
        date_format:"%m/%d/%y",

        //standard webcharts settings
        "max_width":1000,
        "aspect":2,
        "y":{
            "label":"Count",
            "type":"linear",
            "column":"count",
            "behavior":"flex"
        },
        "x":{
            "type":"time",
            "column":"date"
        },
        "marks":[
            {
                "type":"line",
                "per":["key"],
                "summarizeY":"sum"
            }
        ],
        "gridlines":"x",
        "color_by":"key",
        "interpolate":"step-before"
};

// Replicate settings in multiple places in the settings object
export function syncSettings(settings){
    //example: settings.y.column = settings.id_col;
    return settings;
}

// Default Control objects
export const controlInputs = [ 
	{type: "subsetter", value_col: "key", label: "Filter by Period", multiple:true},
];

// Map values from settings to control inputs
export function syncControlInputs(controlInputs, settings){
    //example: 
    //	var measureControl = controlInputs.filter(function(d){return d.label=="Measure"})[0] 
    //  measureControl.value_col = mergedSettings.measure_col; 
    return controlInputs
}

export default settings
