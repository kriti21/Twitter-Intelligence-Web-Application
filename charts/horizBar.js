function horizBar(data, xaxis, dateOrTitle, toolTip, yaxis) {
  var xaxis1 = xaxis.replace(/"/g, "");
  var spec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "autosize": "pad",
    "padding": 5,
    "width": 800,
    "data": [
      {"name": "brush_store"},
      {
        "name": "source_0",
        "values": data,
        "format": {"type": "json", "parse": {[xaxis] : "date"}}
      }
    ],
    "signals": [
      {"name": "concat_0_height", "value": 200},
      {"name": "concat_1_height", "value": 60},
      {
        "name": "unit",
        "value": {},
        "on": [
          {"events": "mousemove", "update": "isTuple(group()) ? group() : unit"}
        ]
      },
      {"name": "brush", "update": "vlSelectionResolve('brush_store')"}
    ],
    "layout": {"padding": 20, "columns": 1, "bounds": "full", "align": "each"},
    "marks": [
      {
        "type": "group",
        "name": "concat_0_group",
        "encode": {
          "update": {
            "width": {"signal": "width"},
            "height": {"signal": "concat_0_height"}
          }
        },
        "marks": [
          {
            "name": "concat_0_marks",
            "type": "rect",
            "clip": true,
            "style": ["bar"],
            "from": {"data": "source_0"},
            "encode": {
              "update": {
                "fill": [
                  {
                    "test": "datum['"+xaxis1+"'] === null || isNaN(datum['"+xaxis1+"']) || datum['favorite_count'] === null || isNaN(datum['favorite_count'])",
                    "value": null
                  },
                  {"value": "#4c78a8"}
                ],
                "tooltip": {
                  "signal": "{'"+dateOrTitle+"': "+`'${xaxis}'=='created_month' ? monthFormat(month(${toolTip})) : year(${toolTip})`+", 'Favorite Count': format(datum['favorite_count'], '.2s')}"
                },
                "xc": {"scale": "concat_0_x", "field": xaxis},
                "width": {"value": 5},
                "y": {"scale": "concat_0_y", "field": "favorite_count"},
                "y2": {"scale": "concat_0_y", "value": 0}
              }
            }
          }
        ],
        "axes": [
          {
            "scale": "concat_0_x",
            "orient": "bottom",
            "grid": false,
            "labelFlush": true,
            "labelOverlap": true,
            "tickCount": {"signal": "ceil(width/40)"},
            "zindex": 1,
            "labelFontSize": 10,
            "tickSize": 8,
            "tickWidth": 3,
            "tickColor": "black"
          },
          {
            "scale": "concat_0_y",
            "orient": "left",
            "grid": false,
            "title": "Favorite Count",
            "labelOverlap": true,
            "tickCount": {"signal": "ceil(concat_0_height/40)"},
            "zindex": 1,
            "labelFontSize": 14,
            "tickSize": 8,
            "format": "~s"
          }
        ]
      },
      {
        "type": "group",
        "name": "concat_1_group",
        "encode": {
          "update": {
            "width": {"signal": "width"},
            "height": {"signal": "concat_1_height"}
          }
        },
        "signals": [
          {
            "name": "brush_x",
            "value": [],
            "on": [
              {
                "events": {
                  "source": "scope",
                  "type": "mousedown",
                  "filter": [
                    "!event.item || event.item.mark.name !== 'brush_brush'"
                  ]
                },
                "update": "[x(unit), x(unit)]"
              },
              {
                "events": {
                  "source": "window",
                  "type": "mousemove",
                  "consume": true,
                  "between": [
                    {
                      "source": "scope",
                      "type": "mousedown",
                      "filter": [
                        "!event.item || event.item.mark.name !== 'brush_brush'"
                      ]
                    },
                    {"source": "window", "type": "mouseup"}
                  ]
                },
                "update": "[brush_x[0], clamp(x(unit), 0, width)]"
              },
              {
                "events": {"signal": "brush_scale_trigger"},
                "update": "[scale('concat_1_x', brush_date[0]), scale('concat_1_x', brush_date[1])]"
              },
              {
                "events": {"signal": "brush_translate_delta"},
                "update": "clampRange(panLinear(brush_translate_anchor.extent_x, brush_translate_delta.x / span(brush_translate_anchor.extent_x)), 0, width)"
              },
              {
                "events": {"signal": "brush_zoom_delta"},
                "update": "clampRange(zoomLinear(brush_x, brush_zoom_anchor.x, brush_zoom_delta), 0, width)"
              }
            ]
          },
          {
            "name": "brush_date",
            "on": [
              {
                "events": {"signal": "brush_x"},
                "update": "brush_x[0] === brush_x[1] ? null : invert('concat_1_x', brush_x)"
              }
            ]
          },
          {
            "name": "brush_scale_trigger",
            "value": {},
            "on": [
              {
                "events": [{"scale": "concat_1_x"}],
                "update": "(!isArray(brush_date) || (+invert('concat_1_x', brush_x)[0] === +brush_date[0] && +invert('concat_1_x', brush_x)[1] === +brush_date[1])) ? brush_scale_trigger : {}"
              }
            ]
          },
          {
            "name": "brush_tuple",
            "on": [
              {
                "events": [{"signal": "brush_date"}],
                "update": "brush_date ? {unit: 'concat_1', fields: brush_tuple_fields, values: [brush_date]} : null"
              }
            ]
          },
          {
            "name": "brush_tuple_fields",
            "value": [{"field": xaxis, "channel": "x", "type": "R"}]
          },
          {
            "name": "brush_translate_anchor",
            "value": {},
            "on": [
              {
                "events": [
                  {
                    "source": "scope",
                    "type": "mousedown",
                    "markname": "brush_brush"
                  }
                ],
                "update": "{x: x(unit), y: y(unit), extent_x: slice(brush_x)}"
              }
            ]
          },
          {
            "name": "brush_translate_delta",
            "value": {},
            "on": [
              {
                "events": [
                  {
                    "source": "window",
                    "type": "mousemove",
                    "consume": true,
                    "between": [
                      {
                        "source": "scope",
                        "type": "mousedown",
                        "markname": "brush_brush"
                      },
                      {"source": "window", "type": "mouseup"}
                    ]
                  }
                ],
                "update": "{x: brush_translate_anchor.x - x(unit), y: brush_translate_anchor.y - y(unit)}"
              }
            ]
          },
          {
            "name": "brush_zoom_anchor",
            "on": [
              {
                "events": [
                  {
                    "source": "scope",
                    "type": "wheel",
                    "consume": true,
                    "markname": "brush_brush"
                  }
                ],
                "update": "{x: x(unit), y: y(unit)}"
              }
            ]
          },
          {
            "name": "brush_zoom_delta",
            "on": [
              {
                "events": [
                  {
                    "source": "scope",
                    "type": "wheel",
                    "consume": true,
                    "markname": "brush_brush"
                  }
                ],
                "force": true,
                "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
              }
            ]
          },
          {
            "name": "brush_modify",
            "update": "modify('brush_store', brush_tuple, true)"
          }
        ],
        "marks": [
          {
            "name": "brush_brush_bg",
            "type": "rect",
            "clip": true,
            "encode": {
              "enter": {
                "fill": {"value": "#333"},
                "fillOpacity": {"value": 0.125}
              },
              "update": {
                "x": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "signal": "brush_x[0]"
                  },
                  {"value": 0}
                ],
                "y": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "value": 0
                  },
                  {"value": 0}
                ],
                "x2": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "signal": "brush_x[1]"
                  },
                  {"value": 0}
                ],
                "y2": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "field": {"group": "height"}
                  },
                  {"value": 0}
                ]
              }
            }
          },
          {
            "name": "concat_1_marks",
            "type": "rect",
            "style": ["bar"],
            "from": {"data": "source_0"},
            "encode": {
              "update": {
                "fill": [
                  {
                    "test": "datum['"+xaxis1+"'] === null || isNaN(datum['"+xaxis1+"']) || datum['favorite_count'] === null || isNaN(datum['favorite_count'])",
                    "value": null
                  },
                  {"value": "#4c78a8"}
                ],
                "tooltip": {
                  "signal": "{'"+dateOrTitle+"': "+`'${xaxis}'=='created_month' ? monthFormat(month(${toolTip})) : year(${toolTip})`+", 'Favorite Count': format(datum['favorite_count'], '.2s')}"
                },
                "xc": {"scale": "concat_1_x", "field": xaxis},
                "width": {"value": 5},
                "y": {"scale": "concat_1_y", "field": "favorite_count"},
                "y2": {"scale": "concat_1_y", "value": 0}
              }
            }
          },
          {
            "name": "brush_brush",
            "type": "rect",
            "clip": true,
            "encode": {
              "enter": {"fill": {"value": "transparent"}},
              "update": {
                "x": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "signal": "brush_x[0]"
                  },
                  {"value": 0}
                ],
                "y": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "value": 0
                  },
                  {"value": 0}
                ],
                "x2": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "signal": "brush_x[1]"
                  },
                  {"value": 0}
                ],
                "y2": [
                  {
                    "test": "data('brush_store').length && data('brush_store')[0].unit === 'concat_1'",
                    "field": {"group": "height"}
                  },
                  {"value": 0}
                ],
                "stroke": [
                  {"test": "brush_x[0] !== brush_x[1]", "value": "white"},
                  {"value": null}
                ]
              }
            }
          }
        ],
        "axes": [
          {
            "scale": "concat_1_x",
            "orient": "bottom",
            "grid": false,
            "title": "Year",
            "labelFlush": true,
            "labelOverlap": true,
             "tickCount": {"signal": "ceil(width/40)"},
            "zindex": 1
          },
          {
            "scale": "concat_1_x",
            "orient": "bottom",
            "gridScale": "concat_1_y",
            "grid": false,
            "tickCount": {"signal": "ceil(width/40)"},
            "domain": false,
            "labels": false,
            "maxExtent": 0,
            "minExtent": 0,
            "ticks": false,
            "zindex": 0
          },
          {
            "scale": "concat_1_y",
            "orient": "left",
            "grid": false,
            "title": "Favorite Count",
            "tickCount": 3,
            "labelOverlap": true,
            "zindex": 1
          }
        ]
      }
    ],
    "scales": [
      {
        "name": "concat_0_x",
        "type": "time",
        "domain": {"data": "source_0", "field": xaxis},
        "domainRaw": {"signal": "brush['"+xaxis1+"']"},
        "range": [0, {"signal": "width"}],
        "padding": 0.05
      },
      {
        "name": "concat_0_y",
        "type": "linear",
        "domain": {"data": "source_0", "field": "favorite_count"},
        "range": [{"signal": "concat_0_height"}, 0],
        "nice": true,
        "zero": true
      },
      {
        "name": "concat_1_x",
        "type": "time",
        "domain": {"data": "source_0", "field": xaxis},
        "range": [0, {"signal": "width"}],
        "padding": 1
      },
      {
        "name": "concat_1_y",
        "type": "linear",
        "domain": {"data": "source_0", "field": "favorite_count"},
        "range": [{"signal": "concat_1_height"}, 0],
        "nice": true,
        "zero": true
      }
    ]
  }
  return spec

}