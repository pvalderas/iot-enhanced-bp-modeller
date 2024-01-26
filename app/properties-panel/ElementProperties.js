import React, { Component } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';

export var enableAddOp = function(){
   window.elementProperties.enableAddOp();
};

export var showElementProperty = function(element){
   window.elementProperties.showElementProperty(element);
};


export default class ElementProperties extends React.Component{
  
  constructor(props) {
    super(props);
    
    this.modeler=props.modeler;
    this.element=props.element;
   

    const [sensorSelected,setSensorSelected] = useState(false);

    this.state={
      iot:false,
      sensorSelected:false,
      element: props.element
    }

    window.elementProperties=this;


    this.updateName=this.updateName.bind(this);
    this.updateOperation=this.updateOperation.bind(this);
    this.updateFloWareSystem=this.updateFloWareSystem.bind(this);
    this.showOperationList=this.showOperationList.bind(this);
    this.drawInColor=this.drawInColor.bind(this);
    this.enableSelection=this.enableSelection.bind(this);
    this.getEventInputLabel=this.getEventInputLabel.bind(this);
    this.connectedToMessageFlow=this.connectedToMessageFlow.bind(this);
    this.setEventDev=this.setEventDev.bind(this);
    this.getEventDev=this.getEventDev.bind(this);


  }

  showElementProperty(element){
    this.setState({element:element});
  }

  enableAddOp(){
    this.setState({sensorSelected:true});
  }

  componentDidMount(){
     if(is(this.state.element, 'bpmn:Lane') && 
            this.state.element.businessObject.extensionElements!=null){

            this.setState({iot:this.state.element.businessObject.extensionElements.values[0].stringValue=="true"?true:false});

      }else if(is(this.state.element, 'bpmn:ServiceTask') && 
              this.state.element.businessObject.lanes && 
              this.state.element.businessObject.lanes[0].extensionElements!=null){

              this.setState({iot:this.state.element.businessObject.lanes[0].extensionElements.values[0].stringValue=="true"?true:false});

      }else if(this.state.element.businessObject.eventDefinitions && this.connectedToMessageFlow()){ 
          if(this.state.element.businessObject.extensionElements){
              this.state.element.businessObject.extensionElements.values.forEach(property=>{
                if(property.name=="device" && property.stringValue.lengh>0) 
                  this.setState({sensorSelected:true});
              });
          }
      }

      if (this.state.element.labelTarget) {
        this.state.element = this.state.element.labelTarget;
      }
  }

  updateName(name) {
    const modeling = this.modeler.get('modeling');
    modeling.updateLabel(this.state.element, name);
  }

  updateOperation(operation) {
    const modeling = this.modeler.get('modeling');

    modeling.updateProperties(this.state.element, {
      'custom:operation': operation
    });

    modeling.updateLabel(this.state.element, operation);
  }

  updateFloWareSystem(system) {
    const modeling = this.modeler.get('modeling');
    modeling.updateLabel(this.state.element, system);
  }


  showEventList(){
    //var sensorID=this.state.element.businessObject.name.split(".")[0];
    var sensorID=document.getElementById('eventDev').value;//this.state.element.businessObject.name.substring(1,this.state.element.businessObject.name.length-1);
    console.log(sensorID);
    showEventDialog(sensorID);
  }
  

  showOperationList(){
      
      let IoTDeviceID=this.state.element.businessObject.lanes[0].name;

      if(IoTDeviceID!=null && IoTDeviceID!=undefined && IoTDeviceID.trim().lengh>0){
        if(getDi(this.state.element).$parent.stroke)
            showOperationDialog(IoTDeviceID,1);
        else
          showOperationDialog(IoTDeviceID);

      }else{
        window.showMessage("Error","You must associate an IoT Device to the lane.");
      }

  }


  drawInColor(element, color){
    this.modeler.get('modeling').setColor(element, {
          stroke: color
      });
  }

  enableSelection(e){
    var camundaNs = 'http://camunda.org/schema/1.0/bpmn';
    const modeling = this.modeler.get('modeling');
    const moddle= this.modeler.get('moddle');
    if(e.target.checked){

      var extensionElements = moddle.create('bpmn:ExtensionElements');
      var field=moddle.createAny('camunda:field',camundaNs, {name:"iot", stringValue:"true"});
      extensionElements.get('values').push(field);
     
      modeling.updateProperties(this.state.element, {'extensionElements':extensionElements});


      //drawInColor(this.state.element, "#000099"); Managed when adding the Iot Device
    }else{

      var extensionElements = moddle.create('bpmn:ExtensionElements');
      var field=moddle.createAny('camunda:field',camundaNs, {name:"iot", stringValue:"false"});
      extensionElements.get('values').push(field);
    
      modeling.updateProperties(this.state.element, {'extensionElements':extensionElements});
   
      drawInColor(this.state.element, "#000000");
    }
  }


  getEventInputLabel(){

      if(this.state.element.businessObject.targetRef && this.state.element.businessObject.targetRef.name){
        return this.state.element.businessObject.name +"."+this.state.element.businessObject.targetRef.name;
      }
      else if(this.state.element.businessObject.name){
          return this.state.element.businessObject.name;
      }
      else return '';
  }

 connectedToMessageFlow(){
    var connected=false
    if(this.state.element.incoming){
      this.state.element.incoming.forEach(function(edge){
          if(edge.businessObject.$type=='bpmn:MessageFlow' && edge.businessObject.sourceRef.name=="PHYSICAL WORLD") connected=true;
      });
    }
    return connected; 
  }

  setEventDev(event, dev){

    const modeling = this.modeler.get('modeling');
    const moddle= this.modeler.get('moddle');
    
    var extensionElements=this.state.element.businessObject.extensionElements;
    if(!extensionElements){
      extensionElements = moddle.create('bpmn:ExtensionElements');
    }

    var camundaNs = 'http://camunda.org/schema/1.0/bpmn';
    var devField=moddle.createAny('camunda:field',camundaNs, {name:"device", stringValue:dev});
    extensionElements.get('values').push(devField);

    this.state.element.businessObject.extensionElements=extensionElements;

    sensorSelected=true;
  }

  getEventDev(event){
        if(this.state.element.businessObject.extensionElements){
          this.state.element.businessObject.extensionElements.values.forEach(property=>{
            if(property.name=="device"){
              return property.stringValue;
            }
          });
        }else{
          return "";
        }
  }

  setEventOp(event, dev){
  }

  getEventOp(event, dev){
  }

  setEventCondition(event, dev){
  }

  getEventCondition(event, dev){
  }



  render(){

    var configLabel={
        marginLeft: "100px",
        marginTop: "10px",
    }
    
  return (

    <div className="element-properties" key={ this.state.element.id }>
      {
        is(this.state.element, 'bpmn:ServiceTask') && this.state.iot &&
           <form className="form-inline" style={{paddingTop:"20px"}}>
            <label className="col-4 col-form-label">Operation to execute</label>
            <input id="propertyValue" className="form-control col-4" value={ this.state.element.businessObject.get('name') || ''} onChange={ (event) => {
              this.updateOperation(event.target.value)
            } } />
             <button className="btn btn-primary col-2" onClick={ this.showOperationList } >Select</button>
          </form>
      }
      {
        is(this.state.element, 'bpmn:Lane') &&
          <form className="form-inline" style={{paddingTop:"20px"}}>
            <div className="form-check form-switch col-5">
              <input className="form-check-input" type="checkbox" checked={this.state.iot} id="isIoT" onChange={ (event) => {
              this.enableSelection(event)} } />
              <label className="form-check-label" htmlFor="isIoT">Is an IoT Device or Software App</label>
            </div>
            <input id="propertyValue" className="form-control col-4" value={ this.state.element.businessObject.name || '' } onChange={ (event) => {
              this.updateName(event.target.value)
            } } disabled={!this.state.iot}/>
             <button id="selectButton" className="btn btn-primary col-2" onClick={ this.showMicroserviceDialog } disabled={!this.state.iot}>Select</button>
          </form>
      }
      {
        is(this.state.element, 'bpmn:Participant') && this.state.element.businessObject.name!="PHYSICAL WORLD" && localStorage.getItem("isFloWare")=="1" &&
          <form className="form-inline" style={{paddingTop:"20px"}}>
            <label className="col-4 col-form-label">FloWare System</label>
            <input id="propertyValue" className="form-control col-4" value={ this.state.element.businessObject.get('name') || ''} onChange={ (event) => {
              this.updateFloWareSystem(event.target.value)
            } } />
             <button className="btn btn-primary col-2" onClick={ this.showSystemDialog } >Select</button>
          </form>
      }
      {
        this.state.element.businessObject.eventDefinitions && this.connectedToMessageFlow() &&
           <form className="form-inline">
              {/*<div className="row" style={{marginLeft:"10%",marginBottom:"10px", fontWeight:"bold"}}>High-level Event from the Physical World</div>*/}
              <div className="row" style={{width:"100%"}}>
                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventName" className="form-label" style={{display:"inherit"}}>Name</label>
                  <input id="eventName" className="form-control" value={ this.state.element.businessObject.name || '' } onChange={ (event) => {
                  this.updateName(event.target.value)  } } style={{width:"100%"}}/>
                </div>
                
                <div className="mb-3 col-4" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventDev" className="form-label" style={{display:"inherit"}}>Device</label>
                  <div className="input-group" >
                    <input type="text" className="form-control" id="eventDev" defaultValue={ this.getEventDev(this.state.element.businessObject) } disabled={true} onChange={ (event) => {
                  this.setEventDev(event.target.value)  } }/>
                    <button className="btn btn-outline-secondary" type="button" id="addDev" onClick={ this.showSensorDialog }>+</button>
                  </div>
                </div>

                <div className="mb-3 col-4" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventOp" className="form-label" style={{display:"inherit"}}>Operation</label>
                  <div className="input-group" >
                    <input type="text" className="form-control" id="eventOp" defaultValue={ this.getEventOp(this.state.element.businessObject) } disabled={true}/>
                    <button className="btn btn-outline-secondary" id="addOp" onClick={ this.showEventList } disabled={!this.state.sensorSelected}>+</button>
                  </div>
                </div>

                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventCondition" className="form-label" style={{display:"inherit"}}>Condition</label>
                  <input id="eventCondition" className="form-control" defaultValue={ this.getEventCondition(this.state.element.businessObject) } onChange={ (event) => {
                  this.setEventCondition(this.state.element.businessObject, event.target.value) }} style={{width:"100%"}}/>
                </div>
              </div>
             {/* <input id="eventValue" className="form-control col-5" defaultValue={this.state.element.name} disabled={true} />
              <div>
                <div className="row" style={{marginLeft:"25px", marginBottom:"5px", marginTop:"-10px"}}>
                   <button id="selectSensor" style={{width:"175px"}} className="btn btn-primary" onClick={ showSensorDialog } >1. Select Sensor</button>
                </div>
                <div className="row" style={{marginLeft:"25px"}}>
                   <button id="selectEvent" style={{width:"175px"}} className="btn btn-primary" onClick={ showEventList } disabled={!sensorSelected}>2. Select Event</button>
                </div>
              </div>*/}
          </form>
      }
      {
          !is(this.state.element, 'bpmn:ServiceTask') && !is(this.state.element, 'bpmn:Lane') && 
          !(this.state.element.businessObject.eventDefinitions && this.connectedToMessageFlow()) && 
          !(is(this.state.element, 'bpmn:Participant')&& this.state.element.businessObject.name!="PHYSICAL WORLD" && localStorage.getItem("isFloWare")=="1") &&  
          <div style={configLabel}>Configuration Panel</div>
      }

    </div>
  );
  }
}
