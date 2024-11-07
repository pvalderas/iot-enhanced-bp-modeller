import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import './loader.css';

export var showOperationDialog = function(device, iot){
    window.operationDialog.show(device, iot);
};

export var hideOperationDialog = function(device){
    window.operationDialog.hide();
};

export default class OperationDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      operations: [],
      device:null,
      error:null,
      type:"operationList",
      title:"IoT Operations",
      id:"operationDialog",
      loader:"operationLoader"
    };

    window.operationDialog=this;

    this.show=this.show.bind(this);

  }

  hide(){
      document.getElementById(this.state.id).style.display = "none";
  }

  show(device, iot){
    if(device!==this.state.device){
      this.loadOperations(device);
    }
    if(localStorage.getItem("isOntology")==1) this.setState({title:"SAREF Functions"});
    else if(iot==1) this.setState({ title: "IoT Operations" });
    else this.setState({ title: "Software App Operations" });
    document.getElementById(this.state.id).style.display = "block";
  }

  loadOperations(device) {
    document.getElementById(this.state.loader).style.display = "block";

    device=device.replaceAll("[","").replaceAll("]","");

    var urls=JSON.parse(sessionStorage.getItem("urls"));
    var url=urls[device];

    fetch(url)
      .then(function (response) {
        return response.json()
      })
      .then(ops => {
        this.setState({ operations: ops, device: device, error:null });
        document.getElementById(this.state.loader).style.display = "none";
      })
      .catch(error => {
          this.setState({error:error});
        }
      )    
  }


  addOperation(name, url, method){

    let element=document.querySelector('#propertyValue');
    element.value=name;

    const modeler=this.props.modeler;
    const modeling = modeler.get('modeling');
    const moddle= modeler.get('moddle');

    let selectedElement = modeler.get('selection').get()[0];
    modeling.updateLabel(selectedElement, name);
    
    let extensionElements = moddle.create('bpmn:ExtensionElements');
    
    let camundaNs = 'http://camunda.org/schema/1.0/bpmn';
    let iotDevice=selectedElement.businessObject.lanes[0].name;
    let process=selectedElement.businessObject.$parent.$parent.rootElements[0].participants[1].name;
    iotDevice=iotDevice.replaceAll("[","").replaceAll("]","");
    
    let field1, field2;
    if(localStorage.getItem("isOntology")=="1"){
      field1=moddle.createAny('camunda:field',camundaNs, {name:"device", stringValue:iotDevice});
      field2=moddle.createAny('camunda:field',camundaNs, {name:"function", stringValue:name});
      let field3=moddle.createAny('camunda:field',camundaNs, {name:"process", stringValue:process});
      extensionElements.get('values').push(field3);
    }
    else{
      field1=moddle.createAny('camunda:field',camundaNs, {name:"microservice", stringValue:iotDevice});
      field2=moddle.createAny('camunda:field',camundaNs, {name:"operation", stringValue:name});
    }

    extensionElements.get('values').push(field1);
    extensionElements.get('values').push(field2);

    if(url!=undefined && method!=undefined){
       
        let field3=moddle.createAny('camunda:field',camundaNs, {name:"url", stringValue:url});
        let field4=moddle.createAny('camunda:field',camundaNs, {name:"method", stringValue:method});

        extensionElements.get('values').push(field3);
        extensionElements.get('values').push(field4);
       
        /*modeling.updateProperties(selectedElement, {'extensionElements':extensionElements,
                                                    'camunda:type':"external",
                                                    'camunda:topic':"iotoperation"
                                                    });*/

        /*modeling.updateProperties(selectedElement, {'extensionElements':extensionElements,
                                                    'camunda:delegateExpression':"${serviceClass}"
                                                    });*/

    }

    modeling.updateProperties(selectedElement, {'extensionElements':extensionElements});
    
    document.querySelector('#'+this.state.id).style.display = "none";
  }

  render(){
  		var content;
  		if(this.state.error==null) {
        var style={
                color:"blue"
              }
	  		const operations = this.state.operations.map(operation => 
	  			<li key={operation.ID} className="list-group-item"><a href="#" onClick={this.addOperation.bind(this,operation.ID,operation.URL,operation.METHOD)} style={style}>{operation.ID}</a></li>
	  		);
	  		content=<ul className="list-group">{operations}</ul>;
  		}else{
  			content=this.state.error;
  		}
  		return (
  			<Dialog type={this.state.type} title={this.state.title} id={this.state.id} loader={this.state.loader} content={content} />
  		);
  }

}