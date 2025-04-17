import ReactDOM from 'react-dom';
import React from 'react';

import Modeler from 'bpmn-js/lib/Modeler';
import PropertiesPanel from './properties-panel';
import DownloadButton from './properties-panel/DownloadButton.js';
import Menu from './menu/Menu.js';
import SendButton from './properties-panel/SendButton.js';
import SendCompositionDialog from "./dialogs/SendCompositionDialog.js";
import DownloadDialog from "./dialogs/DownloadDialog.js";
import UploadDialog from "./dialogs/UploadDialog.js";
import FloWareDialog from "./dialogs/FloWareDialog.js";
import OntologyDialog from "./dialogs/OntologyDialog.js";
import RemoteDialog from "./dialogs/RemoteDialog.js";
import IoTDeviceDialog from "./dialogs/IoTDeviceDialog.js";
import OperationDialog from "./dialogs/OperationDialog.js";
import SensorDialog from "./dialogs/SensorDialog.js";
import EventDialog from "./dialogs/EventDialog.js";
import EventErrorDialog from "./dialogs/EventErrorDialog.js";
import ConfigDialog from "./dialogs/ConfigDialog.js";
import MessageDialog from "./dialogs/MessageDialog.js";
import BPMNManager from "./bpmn/BPMNManager.js";
import SendSystemModelsDialog from "./dialogs/SendSystemModelsDialog.js";
import FloWareSystemDialog from "./dialogs/FloWareSystemDialog.js";
import InstanceDialog from "./dialogs/InstanceDialog.js";
import Overlay from "./overlay/Overlay.js";

import EventLogger from "./custom-actions/EventBusLogger.js";
import CustomLaneActions from "./custom-actions/CustomLaneActions.js";
import CustomMenuActions from "./custom-actions/CustomMenuActions.js";
import CustomBpmnPropertiesProvider from "./custom-actions/CustomBpmnPropertiesProvider.js";
import EventListener from "./custom-actions/EventListener.js";
import MessageFlowCreationRule from "./custom-actions/MessageFlowCreationRule.js"; 
import CreatePoolInterceptor from "./custom-actions/CreatePoolInterceptor.js"; 

// BpmnPropertiesProviderModule,CamundaPlatformPropertiesProviderModule 
import { BpmnPropertiesPanelModule,BpmnPropertiesProviderModule,CamundaPlatformPropertiesProviderModule} from 'bpmn-js-properties-panel';
import CamundaBpmnModdle from 'camunda-bpmn-moddle/resources/camunda.json'

//import dataObjectPropertiesProviderModule from './customProperties/dataObject';
//import dataObjectModdleDescriptor from './customProperties/dataObject/descriptor/DataObject';

import TokenSimulationModule from 'bpmn-js-token-simulation';
import SimulationSupportModule from 'bpmn-js-token-simulation/lib/simulation-support';



import newModel from './NewModel.bpmn';

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');
const $menuContainer = document.querySelector('#menu-container');
const $downloadButtonContainer = document.querySelector('#download-button-container');
const $sendButtonContainer = document.querySelector('#send-button-container');
const $sendCompositionDialogContainer = document.querySelector('#send-composition-dialog-container');
const $sendSystemModelsDialogContainer = document.querySelector('#send-system-models-dialog-container');
const $downloadDialogContainer = document.querySelector('#download-dialog-container');
const $uploadDialogContainer = document.querySelector('#upload-dialog-container');
const $remoteDialogContainer = document.querySelector('#remote-dialog-container');
const $iotDeviceDialogContainer = document.querySelector('#iot-device-dialog-container');
const $operationDialogContainer = document.querySelector('#operation-dialog-container');
const $sensorDialogContainer = document.querySelector('#sensor-dialog-container');
const $eventDialogContainer = document.querySelector('#event-dialog-container');
const $eventErrorDialogContainer = document.querySelector('#event-error-dialog-container');
const $messageDialogContainer = document.querySelector('#message-dialog-container');
const $configDialogContainer = document.querySelector('#config-dialog-container');
const $floWareDialogContainer = document.querySelector('#floWare-dialog-container');
const $ontologyDialogContainer = document.querySelector('#ontology-dialog-container');
const $floWareSystemDialogContainer = document.querySelector('#floWareSystems-dialog-container');
const $instanceDialogContainer = document.querySelector('#instances-dialog-container');
const $overlayContainer = document.querySelector('#overlay-container');

const $rightPropertyPanelContainer = document.querySelector('#right-property-panel-container');


sessionStorage.clear();

//***************************************
// CREATING THE MODELER AND AN EMPTY MODEL
//***************************************
const modeler = new Modeler({
  container: $modelerContainer,
  propertiesPanel: {
    parent: $rightPropertyPanelContainer
  },
  additionalModules: [
      CustomLaneActions, 
      CustomMenuActions,
      EventListener,
      MessageFlowCreationRule,
      CreatePoolInterceptor,
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      TokenSimulationModule,
      SimulationSupportModule,
      CustomBpmnPropertiesProvider 
  ],
  moddleExtensions: {
    camunda: CamundaBpmnModdle
  },
  keyboard: {
    bindTo: document.body
  }
});
modeler.importXML(newModel);

//***************************************



//***************************************
// ADDING THE TOP MENU
//***************************************
ReactDOM.render(
  <Menu modeler={modeler} bpmnManager={new BPMNManager(modeler)}/>,
  $menuContainer
);
//***************************************



//***************************************
// ADDING THE PROPERTY PANEL AND BUTTONS
//***************************************
const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});


ReactDOM.render(
  <SendButton modeler={modeler} bpmnManager={new BPMNManager(modeler)}/>,
  $sendButtonContainer
);

ReactDOM.render(
  <DownloadButton modeler={modeler} bpmnManager={new BPMNManager(modeler)}/>,
  $downloadButtonContainer
);
//***************************************



//***************************************
// ADDING DIALOGS
//***************************************
ReactDOM.render(
  <ConfigDialog />,
  $configDialogContainer
);

ReactDOM.render(
  <SendCompositionDialog modeler={modeler} bpmnManager={new BPMNManager(modeler)} />,
  $sendCompositionDialogContainer
);

ReactDOM.render(
  <SendSystemModelsDialog modeler={modeler} bpmnManager={new BPMNManager(modeler)} />,
  $sendSystemModelsDialogContainer
);

ReactDOM.render(
  <DownloadDialog modeler={modeler} bpmnManager={new BPMNManager(modeler)} />,
  $downloadDialogContainer
);

ReactDOM.render(
  <UploadDialog modeler={modeler} />,
  $uploadDialogContainer
);

ReactDOM.render(
  <FloWareDialog />,
  $floWareDialogContainer
);

ReactDOM.render(
  <OntologyDialog />,
  $ontologyDialogContainer
);

ReactDOM.render(
  <RemoteDialog modeler={modeler} />,
  $remoteDialogContainer
);

ReactDOM.render(
  <IoTDeviceDialog modeler={modeler}/>,
  $iotDeviceDialogContainer
);

ReactDOM.render(
  <OperationDialog modeler={modeler}/>,
  $operationDialogContainer
);

ReactDOM.render(
  <SensorDialog modeler={modeler}/>,
  $sensorDialogContainer
);

ReactDOM.render(
  <EventDialog modeler={modeler}/>,
  $eventDialogContainer
);

ReactDOM.render(
  <EventErrorDialog id="eventError"/>,
  $eventErrorDialogContainer
);

ReactDOM.render(
  <MessageDialog />,
  $messageDialogContainer
);

ReactDOM.render(
  <FloWareSystemDialog modeler={modeler}/>,
  $floWareSystemDialogContainer
);

ReactDOM.render(
  <InstanceDialog modeler={modeler}/>,
  $instanceDialogContainer
);
//***************************************


//*****************************************
// ADDING THE OVERLAY FOR INSTANCES VIEWER
//*****************************************
ReactDOM.render(
  <Overlay/>,
  $overlayContainer
);
//***************************************





