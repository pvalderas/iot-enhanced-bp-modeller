import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

class CreatePoolInterceptor extends CommandInterceptor {
  constructor(eventBus, modeling, elementFactory) {
    super(eventBus);

    this.postExecuted(["shape.create"], ({ context }) => {
      const { shape } = context;

      const { id } = shape;

      //modeling.updateLabel(shape, id);
      if(shape.type=="bpmn:Participant"){
          modeling.splitLane(shape, 1);
          
          var start = {
            eventDefinitionType: "bpmn:MessageEventDefinition",
            type: "bpmn:StartEvent"
          }
          var end = {
            eventDefinitionType: "bpmn:MessageEventDefinition",
            type: "bpmn:EndEvent"
          }
          
          var startEvent = elementFactory.createBpmnElement('shape', start);
          var endEvent = elementFactory.createBpmnElement('shape', end);

          const positionStart = {
            x: shape.x+100,
            y: shape.y+100
          };

          const positionEnd = {
            x: shape.x+910,
            y: shape.y+100
          };

          modeling.createShape(startEvent, positionStart, shape);
          modeling.createShape(endEvent, positionEnd, shape);
      }
    });
  }
}

CreatePoolInterceptor.$inject = ["eventBus", "modeling", "elementFactory"];

export default {
  __init__: ["createPoolInterceptor"],
  createPoolInterceptor: ["type", CreatePoolInterceptor]
};