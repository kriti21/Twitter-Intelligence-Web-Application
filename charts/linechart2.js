function lineChart2(data, xaxis, dateOrTitle, toolTip, yaxis) {
  var spec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "width": 580,
    "height": 200,
    "padding": 5,

    "data": [
      {
        "name": "table",
        "values": data,
        "format": { "type": "json", "parse": { [xaxis]: "date" } }
      }
    ],

    "scales": [
      {
        "name": "x",
        "type": "time",
        "range": "width",
        "domain": { "data": "table", "field": xaxis }
      },
      {
        "name": "y",
        "type": "linear",
        "range": "height",
        "nice": true,
        "zero": true,
        "domain": { "data": "table", "field": yaxis }
      }
    ],

    "axes": [
      { "orient": "bottom", "scale": "x", "labelOverlap": "greedy"
    },
      { "orient": "left", "scale": "y", "title": "Retweet Count", "format": "~s"}
    ],

    "marks": [
      {
        "type": "group",
        "marks": [
          {
            "type": "line",
            "from": { "data": "table" },
            "encode": {
              "enter": {
                "x": { "scale": "x", "field": xaxis },
                "y": { "scale": "y", "field": yaxis },
                "strokeWidth": { "value": 2 }
              },
              "update": {
                "interpolate": { "value": "linear" },
                "fillOpacity": { "value": 1 }
              },
              "hover": {
                "fillOpacity": { "value": 0.5 }
              }
            }
          },
          {
            "type": "symbol",
            "from": { "data": "table" },
            "encode": {
              "enter": {
                "x": { "scale": "x", "field": xaxis },
                "y": { "scale": "y", "field": yaxis },
                "strokeWidth": { "value": 3 },
                "size": { "value": 10 }
              },
              "update": {
                "interpolate": { "value": "linear" },
                "fillOpacity": { "value": 1 },
                "tooltip": { "signal": "{'" + dateOrTitle + "': " + `'${xaxis}'=='created_month' ? monthFormat(month(${toolTip})) : year(${toolTip})` + ",'Retweet Count': format(datum.retweet_count, '.2s')}" }
              }
            }
          }
        ]
      }
    ]
  }
  return spec
}