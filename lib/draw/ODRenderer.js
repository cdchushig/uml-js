import inherits from 'inherits';

import { assign, isObject } from 'min-dash';

import { append as svgAppend, attr as svgAttr, classes as svgClasses, create as svgCreate } from 'tiny-svg';

import { createLine } from 'diagram-js/lib/util/RenderUtil';
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import { getLabel } from '../features/label-editing/LabelUtil';

import { getBusinessObject, is } from '../util/ModelUtil';
import {
  query as domQuery
} from 'min-dom';

import Actor from '../actor';

import { getFillColor, getRectPath, getSemantic, getStrokeColor } from './ODRendererUtil';
import Ids from 'ids';

var MILESTONE_BORDER_RADIUS = 24;
var RENDERER_IDS = new Ids();
var DEFAULT_FILL_OPACITY = .95;
var HIGH_FILL_OPACITY = .35;

var DEFAULT_TEXT_SIZE = 16;
var markers = {};

export default function ODRenderer(
    config, eventBus, styles,
    canvas, textRenderer, priority) {

  BaseRenderer.call(this, eventBus, priority);

  var defaultFillColor = config && config.defaultFillColor,
      defaultStrokeColor = config && config.defaultStrokeColor;

  var rendererId = RENDERER_IDS.next();

  var computeStyle = styles.computeStyle;

  function drawCircle(parentGfx, width, height, offset, attrs) {
    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    if (attrs.fill === 'none') {
      delete attrs.fillOpacity;
    }

    var cx = width / 2,
        cy = height / 2;

    var circle = svgCreate('circle');
    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4 - offset)
    });

    svgAttr(circle, attrs);

    svgAppend(parentGfx, circle);

    return circle;
  }

  function drawOval(parentGfx, width, height, offset, attrs) {
    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    if (attrs.fill === 'none') {
      delete attrs.fillOpacity;
    }

    var cx = width / 2;
    var cy = height / 2;
    var cx1 = width / 4;
    var cy1 = height / 4;

    var oval = svgCreate('ellipse');
    svgAttr(oval, {
      cx: cx,
      cy: cy,
      rx: width - cx,
      ry: cy1
    });

    svgAttr(oval, attrs);

    svgAppend(parentGfx, oval);

    return oval;
  }

  function drawActor(parentGfx, width, height, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    var url = Actor.dataURL;

    var actor = svgCreate('image', {
      x: 0,
      y: 0,
      width: width,
      height: height,
      href: url
    });

    svgAttr(actor, attrs);
    svgAppend(parentGfx, actor);

    return actor;
  }

  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var rect = svgCreate('rect');
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r
    });

    svgAttr(rect, attrs);

    svgAppend(parentGfx, rect);

    return rect;
  }

  function drawDiamond(parentGfx, width, height, attrs) {

    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [{ x: x_2, y: 0 }, { x: width, y: y_2 }, { x: x_2, y: height }, { x: 0, y: y_2 }];

    var pointsString = points.map(function(point) {
      return point.x + ',' + point.y;
    }).join(' ');

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var polygon = svgCreate('polygon');
    svgAttr(polygon, {
      points: pointsString
    });
    svgAttr(polygon, attrs);

    svgAppend(parentGfx, polygon);

    return polygon;
  }

  function drawParallelogram(parentGfx, width, height, attrs) {

    var x_1 = width / 4;
    var y_1 = height / 4;
    var x_2 = width / 2;
    var y_2 = height / 2;

    var points = [{ x: x_1, y: 0 }, { x: 0, y: height }, { x: width, y: height }, { x: width + x_1, y: 0 } ];
    // var points = [{ x: x_2, y: 0 }, { x: x_1, y: height }, { x: width, y: height }, { x: width + x_1, y: 0 } ];
    // var points = [{ x: 150, y:150}, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 250, y: 150 } ];

    var pointsString = points.map(function(point) {
      return point.x + ',' + point.y;
    }).join(' ');

    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var polygon = svgCreate('polygon');
    svgAttr(polygon, {
      points: pointsString
    });
    svgAttr(polygon, attrs);

    svgAppend(parentGfx, polygon);

    return polygon;
  }

  // function drawRect(parentGfx, width, height, r, offset, attrs) {
  //
  //   if (isObject(offset)) {
  //     attrs = offset;
  //     offset = 0;
  //   }
  //
  //   offset = offset || 0;
  //
  //   attrs = computeStyle(attrs, {
  //     stroke: 'black',
  //     strokeWidth: 2,
  //     fill: 'white'
  //   });
  //
  //   var rect = svgCreate('rect');
  //   svgAttr(rect, {
  //     x: offset,
  //     y: offset,
  //     width: width - offset * 2,
  //     height: height - offset * 2,
  //     rx: r,
  //     ry: r
  //   });
  //   svgAttr(rect, attrs);
  //
  //   svgAppend(parentGfx, rect);
  //
  //   return rect;
  // }

  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, [ 'no-fill' ], {
      strokeWidth: 2,
      stroke: 'black'
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  function renderLabel(parentGfx, label, options) {

    options = assign({
      size: {
        width: 100
      }
    }, options);

    var text = textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align, fontSize) {
    var semantic = getSemantic(element);

    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: getColor(element) === 'black' ? 'white' : 'black',
        fontSize: fontSize || DEFAULT_TEXT_SIZE
      },
    });
  }

  function renderExternalLabel(parentGfx, element) {

    var box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: 'black'
        }
      )
    });
  }

  function renderAttributes(parentGfx, element) {
    var semantic = getSemantic(element);
    if (semantic.attributeValues) {
      renderLabel(parentGfx, semantic.attributeValues, {
        box: {
          height: element.height + 30,
          width: element.width
        },
        padding: 5,
        align: 'center-middle',
        style: {
          fill: defaultStrokeColor
        }
      });
    }
  }

  function renderAttributesGeneral(parentGfx, element) {
    var semantic = getSemantic(element);
    if (semantic.attributeValues) {
      renderLabel(parentGfx, semantic.attributeValues, {
        box: {
          height: element.height,
          width: element.width
        },
        padding: 5,
        align: 'center-middle',
        style: {
          fill: defaultStrokeColor
        }
      });
    }
  }

  function renderAttributesGeneral2(parentGfx, element) {
    var semantic = getSemantic(element);
    if (semantic.attributeValues) {
      renderLabel(parentGfx, semantic.attributeValues, {
        box: {
          height: element.height,
          width: element.width
        },
        padding: 5,
        align: 'center-middle',
        style: {
          fill: defaultStrokeColor
        }
      });
    }
  }

  function addDivider(parentGfx, element) {
    drawLine(parentGfx, [
      { x: 0, y: 30 },
      { x: element.width, y: 30 }
    ], {
      stroke: getStrokeColor(element, defaultStrokeColor)
    });
  }

  function drawLine(parentGfx, waypoints, attrs) {
    attrs = computeStyle(attrs, [ 'no-fill' ], {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'none'
    });

    var line = createLine(waypoints, attrs);

    svgAppend(parentGfx, line);

    return line;
  }

  function renderTitelLabel(parentGfx, element) {
    let semantic = getSemantic(element);
    let text = '';
    if (semantic.name) {
      text = semantic.name;

    }
    renderLabel(parentGfx, text, {
      box: {
        height: 30,
        width: element.width
      },
      padding: 5,
      align: 'center-middle',
      style: {
        fill: defaultStrokeColor
      }
    });
  }

  function createPathFromConnection(connection) {
    var waypoints = connection.waypoints;

    var pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (var i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  function marker(fill, stroke) {
    var id = '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

    if (!markers[id]) {
      createMarker(id, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  function addMarker(id, options) {
    var attrs = assign({
      fill: 'black',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeDasharray: 'none'
    }, options.attrs);

    var ref = options.ref || { x: 0, y: 0 };

    var scale = options.scale || 1;

    // fix for safari / chrome / firefox bug not correctly
    // resetting stroke dash array
    if (attrs.strokeDasharray === 'none') {
      attrs.strokeDasharray = [ 10000, 1 ];
    }

    var marker = svgCreate('marker');

    svgAttr(options.element, attrs);

    svgAppend(marker, options.element);

    svgAttr(marker, {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

    var defs = domQuery('defs', canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');

      svgAppend(canvas._svg, defs);
    }

    svgAppend(defs, marker);

    markers[id] = marker;
  }

  function colorEscape(str) {

    // only allow characters and numbers
    return str.replace(/[^0-9a-zA-z]+/g, '_');
  }

  function createMarker(id, type, fill, stroke) {
    var linkEnd = svgCreate('path');
    svgAttr(linkEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

    addMarker(id, {
      element: linkEnd,
      ref: { x: 11, y: 10 },
      scale: 0.5,
      attrs: {
        fill: stroke,
        stroke: stroke
      }
    });
  }

  this.handlers = {
    'od:Object': function(parentGfx, element, attrs) {
      var rect = drawRect(parentGfx, element.width, element.height, 0, assign({
        fill: getFillColor(element, defaultFillColor),
        fillOpacity: HIGH_FILL_OPACITY,
        stroke: getStrokeColor(element, defaultStrokeColor)
      }, attrs));

      addDivider(parentGfx, element);

      renderTitelLabel(parentGfx, element);

      renderAttributes(parentGfx, element);

      return rect;
    },
    'od:Link': function(parentGfx, element) {
      var pathData = createPathFromConnection(element);

      var fill = getFillColor(element, defaultFillColor),
          stroke = getStrokeColor(element, defaultStrokeColor);

      var attrs = {
        strokeLinejoin: 'round',
        markerEnd: marker(fill, stroke),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };
      return drawPath(parentGfx, pathData, attrs);
    },
    'od:Circle': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawCircle(parentGfx, element.width, element.height, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      renderAttributesGeneral(parentGfx, element);

      return rect;
    },
    'od:Decision': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawDiamond(parentGfx, element.width, element.height, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      renderAttributesGeneral(parentGfx, element);

      return rect;
    },
    'od:Rectangle': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      renderAttributesGeneral(parentGfx, element);

      return rect;
    },
    'od:Parallelogram': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawParallelogram(parentGfx, element.width, element.height, 0, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      renderAttributesGeneral2(parentGfx, element);

      return rect;
    },
    'od:Oval': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawOval(parentGfx, element.width, element.height, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle');
      renderAttributesGeneral(parentGfx, element);

      return rect;
    },
    'od:Actor': function(parentGfx, element) {

      var attrs = {
        fill: getFillColor(element, defaultFillColor),
        stroke: getStrokeColor(element, defaultStrokeColor)
      };

      if (!('fillOpacity' in attrs)) {
        attrs.fillOpacity = DEFAULT_FILL_OPACITY;
      }

      var rect = drawActor(parentGfx, element.width, element.height, attrs);

      // renderEmbeddedLabel(parentGfx, element, 'center-middle');
      // renderAttributesGeneral(parentGfx, element);

      return rect;
    },
    'od:TextBox': function(parentGfx, element) {
      var attrs = {
        fill: 'none',
        stroke: 'none'
      };

      var textSize = element.textSize || DEFAULT_TEXT_SIZE;

      var rect = drawRect(parentGfx, element.width, element.height, 0, attrs);

      renderEmbeddedLabel(parentGfx, element, 'center-middle', textSize);

      return rect;
    },
    'label': function(parentGfx, element) {
      return renderExternalLabel(parentGfx, element);
    }
  };
}


inherits(ODRenderer, BaseRenderer);

ODRenderer.$inject = [
  'config.odm',
  'eventBus',
  'styles',
  'canvas',
  'textRenderer'
];

ODRenderer.prototype.canRender = function(element) {
  return is(element, 'od:BoardElement');
};

ODRenderer.prototype.drawShape = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

ODRenderer.prototype.drawConnection = function(parentGfx, element) {
  var type = element.type;
  var h = this.handlers[type];

  /* jshint -W040 */
  return h(parentGfx, element);
};

ODRenderer.prototype.getShapePath = function(element) {

  return getRectPath(element);
};

// helpers //////////

function getColor(element) {
  var bo = getBusinessObject(element);

  return bo.color || element.color;
}
