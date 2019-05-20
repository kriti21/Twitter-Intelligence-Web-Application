function wordclouder(data) {
  var fullData;
  data.forEach(function(d) {
    fullData += d.word+" "
  })
  var spec = {
    "$schema": "https://vega.github.io/schema/vega/v4.json",
    "width": 500,
    "height": 300,
    "data": [
      {
        "name": "data_table",
        "values": [
            fullData
        ],
        "transform": [
          {
            "type": "countpattern",
            "field": "data",
            "case": "upper",
            "pattern": "[\\w']{3,}"
          }
        ]
      }
    ],
    "scales": [
      {
        "name": "scales_color",
        "type": "ordinal",
        "domain": {
          "data": "data_table",
          "field": "text"
        },
        "range": {
          "scheme": "sinebow"
        }
      }
    ],
    "marks": [
      {
        "type": "text",
        "from": {
          "data": "data_table"
        },
        "encode": {
          "enter": {
            "text": {
              "field": "text"
            },
            "align": {
              "value": "center"
            },
            "baseline": {
              "value": "alphabetic"
            },
            "fill": {
              "scale": "scales_color",
              "field": "text"
            }
          },
          "update": {
            "fillOpacity": {
              "value": 1
            }
          },
          "hover": {
            "fillOpacity": {
              "value": 1
            }
          }
          
        },
        "transform": [
          {
            "type": "wordcloud",
            "size": [
              {
                "signal": "width"
              },
              {
                "signal": "height"
              }
            ],
            "text": {
              "field": "text"
            },
            "rotate": 0,
            "fontSize": {
              "field": "datum.count"
            },
            "fontSizeRange": [
              12,
              56
            ],
            "padding": 4
          }
        ]
      }
    ]
  }
  return spec
}