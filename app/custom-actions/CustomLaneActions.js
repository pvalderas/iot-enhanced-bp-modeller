import ContextPadProvider from "bpmn-js/lib/features/context-pad/ContextPadProvider"


export class CustomContextPadProvider extends ContextPadProvider {

    constructor(config, injector, eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate, elementRegistry) {
        super(config, injector, eventBus, contextPad, modeling, elementFactory, connect, create, popupMenu, canvas, rules, translate);
        this._elementRegistry=elementRegistry;
    }

    getContextPadEntries(element) {
        var result = super.getContextPadEntries(element);

        var e=element;
        if(e.businessObject.$instanceOf("bpmn:Participant") && (e.businessObject.name!=null) &&
                e.businessObject.name=="PHYSICAL WORLD" ){
            return [];

        }else if (e.businessObject.$parent.lanes && e.businessObject.$parent.lanes.length==1){
            delete result['delete'];
        }else if(e.businessObject.$instanceOf("bpmn:StartEvent")){
            var shapes = this._elementRegistry.filter(function(element) {
              return element.businessObject.$type=="bpmn:StartEvent" && element.businessObject.$parent.id==e.businessObject.$parent.id;
            });

            var bussinessObjects=[];
            shapes.forEach(function(s){
                if(!bussinessObjects.includes(s.businessObject.id)) bussinessObjects.push(s.businessObject.id);
            });
            
            if(bussinessObjects.length==1) delete result['delete'];
 
        }else if(e.businessObject.$instanceOf("bpmn:EndEvent")){
            var shapes = this._elementRegistry.filter(function(element) {
              return element.businessObject.$type=="bpmn:EndEvent" && element.businessObject.$parent.id==e.businessObject.$parent.id;
            });

            var bussinessObjects=[];
            shapes.forEach(function(s){
                if(!bussinessObjects.includes(s.businessObject.id)) bussinessObjects.push(s.businessObject.id);
            });

            if(bussinessObjects.length==1) delete result['delete'];
        }

        return result;
    }

}

CustomContextPadProvider.$inject = ['config.contextPad', 'injector', 'eventBus', 'contextPad', 'modeling', 'elementFactory', 'connect', 'create', 'popupMenu', 'canvas', 'rules', 'translate','elementRegistry'];

export default {
  __init__: ['contextPadProvider'],
  contextPadProvider: ['type', CustomContextPadProvider]
};