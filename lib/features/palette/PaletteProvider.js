import {
  assign
} from 'min-dash';

import COLORS from '../../util/ColorUtil';
import Cat from '../../actor';


/**
 * A palette provider for od elements.
 */
export default function PaletteProvider(
    palette, create, elementFactory,
    spaceTool, lassoTool, handTool, globalConnect, translate) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;
  this._handTool = handTool;
  this._globalConnect = globalConnect;
  this._translate = translate;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate'
];


PaletteProvider.prototype.getPaletteEntries = function(element) {

  var actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool,
      handTool = this._handTool,
      globalConnect = this._globalConnect,
      translate = this._translate;

  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape);
    }

    var shortType = type.replace(/^od:/, '');

    return {
      group: group,
      className: className,
      title: title || translate('Create {type}', { type: shortType }),
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  function createImage(event) {
    var shape = elementFactory.createShape({
      type: 'od:Cat'
    });

  }

  assign(actions, {
    'hand-tool': {
      group: 'tools',
      className: 'bpmn-icon-hand-tool',
      title: translate('Activate the hand tool'),
      action: {
        click: function(event) {
          handTool.activateHand(event);
        }
      }
    },
    // 'lasso-tool': {
    //   group: 'tools',
    //   className: 'bpmn-icon-lasso-tool',
    //   title: translate('Activate the lasso tool'),
    //   action: {
    //     click: function(event) {
    //       lassoTool.activateSelection(event);
    //     }
    //   }
    // },
    // 'space-tool': {
    //   group: 'tools',
    //   className: 'bpmn-icon-space-tool',
    //   title: translate('Activate the create/remove space tool'),
    //   action: {
    //     click: function(event) {
    //       spaceTool.activateSelection(event);
    //     }
    //   }
    // },
    'tool-separator': {
      group: 'tools',
      separator: true
    },
    'create-object': createAction(
      'od:Object', 'od-elements', 'od-icon-object',
      translate('Create object')
    ),
    'create-circle': createAction(
      'od:Circle', 'od-elements', 'bpmn-icon-start-event-none',
      translate('Create Circle')
    ),
    'create-decision': createAction(
      'od:Decision', 'od-elements', 'bpmn-icon-gateway-none',
      translate('Create Decision')
    ),
    'create-rectangle': createAction(
      'od:Rectangle', 'od-elements', 'bpmn-icon-task',
      translate('Create Rectangle')
    ),
    'create-parallelogram': createAction(
      'od:Parallelogram', 'od-elements', 'pjs-parallelogram',
      translate('Create Rhomboid')
    ),
    'create-oval': createAction(
      'od:Oval', 'od-elements', 'pjs-ellipse',
      translate('Create Oval')
    ),
    'create-actor': createAction(
      'od:Actor', 'od-elements', 'pjs-actor',
      translate('Create Actor')
    ),
    'object-linker': {
      group: 'od-elements',
      className: 'bpmn-icon-connection',
      title: translate('Link objects'),
      action: {
        click: function(event) {
          globalConnect.start(event);
        }
      }
    },
    'od-separator': {
      group: 'od-elements',
      separator: true
    },
    'create.text-box': createAction(
      'od:TextBox', 'text', 'pjs-text-box',
      translate('Create text')
    )
  });

  return actions;
};
