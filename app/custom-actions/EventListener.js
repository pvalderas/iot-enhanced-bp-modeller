import { is } from 'bpmn-js/lib/util/ModelUtil';

export function EventListener(eventBus, bpmnReplace, elementRegistry, modeling){
	// Transorm a task into a service task if it is defined in an IoT lane
	let priority = 10000;
	/*eventBus.on('render.shape', priority, function(event) {
	  	var shape = event.element;
	  	if(is(shape, 'bpmn:Task') && !is(shape, 'bpmn:ServiceTask') && shape.businessObject.lanes && shape.businessObject.lanes[0].extensionElements){

			if(shape.businessObject.lanes[0].extensionElements.values[0].stringValue=="true"){
				var parent=null;
				console.log(elementRegistry.getGraphics(shape));
				if(shape.parent!==undefined) parent=shape.parent;
				var newElementData =  {
				    type: 'bpmn:ServiceTask'
				};
				bpmnReplace.replaceElement(shape, newElementData);
				if(parent!==null) shape.parent=parent;
				console.log(elementRegistry.getGraphics(shape));
			}		
		}
	});*/

	//Cancel double click from the Physical World Pool to avoid editing its name
	eventBus.on('element.dblclick', priority, function(event) {
	  	var e = event.element;
	  	if(e.businessObject.$instanceOf("bpmn:Participant") && e.businessObject.name!=null &&
				e.businessObject.name=="PHYSICAL WORLD") return false;
	});

	let messageFlowTarget;
	eventBus.on('connection.remove', priority, function(event) {
	  	if(event.element.type=="bpmn:MessageFlow" && event.element.source.businessObject.name=="PHYSICAL WORLD"){
	  		messageFlowTarget=event.element.target;
	  	}
	});
	eventBus.on('commandStack.connection.delete.postExecute', priority, function(event) {
	  	if(messageFlowTarget){
	  		modeling.setColor(messageFlowTarget, {
		          stroke: 'black'
		      });
	  		if(messageFlowTarget.businessObject.extensionElements && 
	  		   messageFlowTarget.businessObject.extensionElements.values) 
	  				messageFlowTarget.businessObject.extensionElements.values=[];
	  		
	  		messageFlowTarget=null;
	  	}
	});
	
	let messageFlow;
	eventBus.on('connection.added', priority, function(event) {
	  	if(event.element.type=="bpmn:MessageFlow" && event.element.source.businessObject.name=="PHYSICAL WORLD"){
	  		messageFlow=event.element;
	  	}
	});
	eventBus.on('commandStack.connection.create.postExecute', priority, function(event) {
	  	if(messageFlow){
	  		modeling.setColor(messageFlow, {
		          stroke: 'blue'
		     }); 
		    modeling.setColor(messageFlow.target, {
		          stroke: 'blue'
		    });	
		    messageFlow=null;	
	  	}
	});

	/*eventBus.on('element.click', priority, function(event) {
	  	var e = event.element;
	  	modeling.setColor(e, {
          stroke: 'blue'
      });
	});*/

}

EventListener.$inject = [ 'eventBus', 'bpmnReplace','elementRegistry','modeling'];

export default {
  __init__: ['eventListener'],
  eventListener: ['type', EventListener]
};