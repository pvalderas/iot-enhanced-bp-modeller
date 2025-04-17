import { is } from 'bpmn-js/lib/util/ModelUtil';
import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor.js"

export default class IoTServiceTasksCreator extends CommandInterceptor {
  
  	constructor(eventBus, modeling, bpmnReplace, elementRegistry) {
    super(eventBus);

	    /*this.preExecute("shape.create", function(context){
		     let shape = context.shape;

			 console.log(shape);
		     if(is(shape, 'bpmn:Task') && !is(shape, 'bpmn:ServiceTask') 
		     	//&& shape.businessObject.lanes[0].$attrs['custom:iot']!==undefined
		     						){

		     		

		     		//shape.type='bpmn:ServiceTask';
				
	      	}
	    }, true);*/


	   /*  this.postExecute(["shape.append","element.updateAttachment"],({ context }) => {
	     	const shape = context.shape;
			 if(is(shape, 'bpmn:Task') && !is(shape, 'bpmn:ServiceTask')){

				console.log(shape);
				console.log(shape.businessObject.lanes[0].$attrs['custom:iot']);
			}
	     });*/

	}
}

IoTServiceTasksCreator.$inject = [ 'eventBus', 'modeling','bpmnReplace','elementRegistry'];