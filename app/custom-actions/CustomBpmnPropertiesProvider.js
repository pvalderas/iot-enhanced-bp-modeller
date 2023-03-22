import { is } from "bpmn-js/lib/util/ModelUtil";

const LOW_PRIORITY = 500;

function isTimer(element){
  if(is(element, 'bpmn:IntermediateCatchEvent') && 
    element.businessObject.eventDefinitions && element.businessObject.eventDefinitions[0] && 
    is(element.businessObject.eventDefinitions[0], 'bpmn:TimerEventDefinition')){
      return true;
  }else if(is(element, 'bpmn:StartEvent') && 
    element.businessObject.eventDefinitions && element.businessObject.eventDefinitions[0] && 
    is(element.businessObject.eventDefinitions[0], 'bpmn:TimerEventDefinition')){
      return true;
  }
  return false;
}


function CustomPropertiesProvider(propertiesPanel, translate) {
 
  this.getGroups = function (element) {
   
    return function (groups) {
      if (is(element, "bpmn:DataObjectReference")) {
        return groups;
        //groups.push(createMetadataGroup(element, translate));
      }else if(isTimer(element)){
        return groups.filter(group=>{
                      if(group.id=='general' || group.id=='documentation' || group.id=='timer') return true;
                      else return false;
                    });
      }else{
        return groups.filter(group=>{
                      if(group.id=='general' || group.id=='documentation') return true;
                      else return false;
                    });
      }

      return [];
    };
  };

  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CustomPropertiesProvider.$inject = ["propertiesPanel", "translate"];

export default {
  __init__: ["customPropertiesProvider"],
  customPropertiesProvider: ["type", CustomPropertiesProvider]
};

/*// Create the custom Metadata group
function createMetadataGroup(element, translate) {
  // create a group called "Metadata".
  const metadataGroup = {
    id: "metadata",
    label: translate("Metadata"),
    entries: metadataProps(element)
  };

  return metadataGroup;
}*/
