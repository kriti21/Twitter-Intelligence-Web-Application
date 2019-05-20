function bar1(data, xaxis, dateOrTitle, toolTip, yaxis){
  var spec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "autosize": "pad",
    "height": 300,
    "width": 900,
    "padding": 5,
   
    "data": [
      {
        "name": "table",
        "values": data,
        "format": {"type": "json", "parse": {[xaxis]: "date"}}
      }
    ],
  
    "signals": [
      {
        "name": "tooltip",
        "value": {},
        "on": [
          {"events": "rect:mouseover", "update": "datum"},
          {"events": "rect:mouseout",  "update": "{}"}
        ]
      }
    ],
  
    "scales": [
      {
        "name": "xscale",
        "type": "time",
        "domain": {"data": "table", "field": xaxis},
        "range": "width",
        "padding": 0.05,
        "nice": false
      },
      {
        "name": "yscale",
        "domain": {"data": "table", "field": yaxis},
        "range": "height"
      }
    ],
  
    "axes": [
      { "orient": "bottom",
      "scale": "xscale",
      "grid": false,
      "labelFontWeight": "bolder",
      "labelFontSize": 14,
      "tickSize": 10,
      "tickColor": "black", "tickWidth": 1,
      "tickOffset": 15,
      "tickExtra": false
    }, 
      { "orient": "left", "scale": "yscale", "title": "Tweet Count",
      "labelFontSize": 14,
      "tickSize": 9,
      "labelFontWeight": "bolder",
      "format": "~s" }
    ],
  
    "marks": [
      {
        "type": "rect",
        "from": {"data":"table"},
        "encode": {
          "update": {
            "x": {"scale": "xscale", "field": xaxis, "offset": 5},
            "width": {"value": xaxis=="created_month" ? '5' : '25'},
            "y": {"scale": "yscale", "field": yaxis},
            "y2": {"scale": "yscale", "value": 0},
            "tooltip": {"signal": "{'"+dateOrTitle+"': "+`'${xaxis}'=='created_month' ? monthFormat(month(${toolTip})) : year(${toolTip})`+",'Tweet Count': datum.tweet_count}"},
            "fill": {"value": "orange"},
            "cursor": {"value": "pointer"}
          },
          "hover": {
            "fill": {"value": "steelblue"}
          }
        }
      }
    ]
  }
  return spec
}
