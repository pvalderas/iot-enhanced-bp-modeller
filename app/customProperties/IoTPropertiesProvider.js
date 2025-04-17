import { is } from 'bpmn-js/lib/util/ModelUtil';

function IoTPropertiesProvider(propertiesPanel, translate) {

  // Register the iot properties provider.
  // Use a lower priority to ensure it is loaded after the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);

  this.getGroups = function(element) {

    return function(groups) {

      // Add the "ioT" group
      if(is(element, 'bpmn:Lane')) {
        groups.push(createIoTGroup(element, translate));
      }

      return groups;
    }
  };
}