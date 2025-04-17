import React, { Component, useState } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import {showMicroserviceDialog, hideMicroserviceDialog} from '../dialogs/IoTDeviceDialog';
import {showOperationDialog, hideOperationDialog} from '../dialogs/OperationDialog';
import {showEventDialog, hideEventDialog} from '../dialogs/EventDialog';
import {showSensorDialog, hideSensorDialog} from '../dialogs/SensorDialog';
import {showSystemDialog, hideSystemDialog} from '../dialogs/FloWareSystemDialog';

import ElementProperties from './ElementPropertiesFunction';


import './PropertiesView.css';

let jQuery = require("jquery");
let configLabel={
      marginTop: "20px",
      width: "100%",
      textAlign: "center",
      color: "gray",
      fontSize: "20px"
    }

export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null
    };

    const propertiesPanel = this.props.modeler.get('propertiesPanel');
    propertiesPanel.detach();
  }

  

  componentDidMount() {

    const {
      modeler
    } = this.props;

    modeler.on('selection.changed', (e) => {

          this.setState({
            selectedElements: e.newSelection,
            element: e.newSelection[0]
          });

          //const propertiesPanel = modeler.get('propertiesPanel');
          if(e.newSelection.length!=1 || e.newSelection[0].businessObject.name=='PHYSICAL WORLD'){
            hideOperationDialog();
            hideMicroserviceDialog();
            hideSensorDialog();
            hideEventDialog();
            /*document.getElementById('right-property-panel-container').style.display='none';
            propertiesPanel.detach();
            document.getElementById('modeler-container').className="col-12";*/
          }else  {
            /*document.getElementById('right-property-panel-container').style.display='block';
            propertiesPanel.attachTo('#right-property-panel-container');
            document.getElementById('modeler-container').className="col-10";*/
          }

         /*const propertiesPanel = modeler.get('propertiesPanel');
         if(is(e.newSelection[0], 'bpmn:DataObjectReference') ||isTimer(e.newSelection[0])){
            document.getElementById('right-property-panel-container').style.display='block';
            propertiesPanel.attachTo('#right-property-panel-container');
            //document.getElementById('modeler-container').className="col-10";
          }else{
            document.getElementById('right-property-panel-container').style.display='none';
            propertiesPanel.detach();
            //document.getElementById('modeler-container').className="col-12";
          }*/

    });


    modeler.on('element.changed', (e) => {

        const {
          element
        } = e;

        const currentElement=this.state.element;

        if (!currentElement) {
          return;
        }

        // update panel, if currently selected element changed
       if (element.id !== currentElement.id) {
          this.setState({
            selectedElements:[element],
            element:element
          });
        }

    });
  }

  render() {

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    return (
      <div>
          
        {
          selectedElements.length === 1
            && <ElementProperties modeler={ modeler } element={ element } />
        }

        {
          selectedElements.length !== 1 
            && <div style={configLabel}>IoT Configuration Panel</div> 
        }

      </div>
    );
  }

}

