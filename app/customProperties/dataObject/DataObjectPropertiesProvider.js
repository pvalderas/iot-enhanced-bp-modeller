import { is } from 'bpmn-js/lib/util/ModelUtil';
import dataProps from './props/dataProps';

const LOW_PRIORITY = 500;

export default function DataObjectPropertiesProvider(propertiesPanel, translate) {

  this.getGroups = function(element) {

    return function(groups) {

     

      if(is(element, 'bpmn:DataObjectReference')) {
        groups.push(createDataPropertiesGroup(element, translate));
      }

      return groups;
    
    }
  };


  // Register the iot properties provider.
  // Use a lower priority to ensure it is loaded after the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

DataObjectPropertiesProvider.$inject = [ 'propertiesPanel', 'translate' ];


function createDataPropertiesGroup(element, translate) {

  const dataPropertiesGroup = {
    id: 'dataProps',
    label: translate('Data Properties'),
    entries: dataProps(element)
  };

  return dataPropertiesGroup;
}