import React,  { useState } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';
//import { getDi } from 'bpmn-js/lib/util/ModelUtil';
import {showMicroserviceDialog, hideMicroserviceDialog} from '../dialogs/IoTDeviceDialog';
import {showOperationDialog, hideOperationDialog} from '../dialogs/OperationDialog';
import {showEventDialog, hideEventDialog} from '../dialogs/EventDialog';
import {showEventErrorDialog, hideEventErrorDialog} from '../dialogs/EventErrorDialog';
import {showSensorDialog, hideSensorDialog, loadSensors} from '../dialogs/SensorDialog';
import {showSystemDialog, hideSystemDialog} from '../dialogs/FloWareSystemDialog';
import { showMessage } from '../dialogs/MessageDialog';

export default function ElementProperties(props) {
  
  let {
    element,
    modeler
  } = props;

  let configLabel={
      marginTop: "20px",
      width: "100%",
      textAlign: "center",
      color: "gray",
      fontSize: "20px"
    }

  let iot=false;
  let iotLane="noiot";
  let ontology=localStorage.getItem("isOntology")=="1"?true:false;

  const activeClass={
    color: "#fff",
    backgroundColor: "#86b7ff",
    borderColor: "#005cbf"
  }
  let active={
    noiot:{},
    newIoT:{},
    existing:{}
  }

  //For Events
  const [device, setDevice] = useState("");
  const [operation, setOperation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
 
  
  // For Lanes
  const [redraw, setRedraw] = useState(false);
  const [laneName, setLaneName] = useState("");
  const [sensor, setSensor] = useState(true);

  if(device.length>0) loadSensors();

 
  if(is(element, 'bpmn:Lane')){ 

        if(element.businessObject.extensionElements!=null){

          element.businessObject.extensionElements.values.forEach(function(field){
            if(field.name=="iot"){
              iot=field.stringValue=="true"?true:false;
            }
            else if(field.name=="iotLane"){
              iotLane=field.stringValue;
              active[iotLane]=activeClass;
            }else if(field.name=="iotSensor"){
              if(sensor!=JSON.parse(field.stringValue)) setSensor(!sensor);
            }
          });
        }else{
          active.noiot=activeClass;
        }
       
        if(element.businessObject.name && laneName!=element.businessObject.name){
          setLaneName(element.businessObject.name);
        }else if(!element.businessObject.name){
          element.businessObject["name"]=" ";
          setLaneName(" ");
        }

  }else if(element.businessObject.eventDefinitions && connectedToMessageFlow()){ 
  	   var eventTypeField="data";
       if(element.businessObject.extensionElements!=null){

          element.businessObject.extensionElements.values.forEach(function(field){
 
            if(field.name=="eventType"){
              eventTypeField=field.stringValue;
            }
            if(field.name=="description" && field.stringValue!=description){
               setDescription(field.stringValue);
            }
          });

        }

  }else if(is(element, 'bpmn:ServiceTask') && 
              element.businessObject.lanes && 
              element.businessObject.lanes[0].extensionElements && element.businessObject.lanes[0].extensionElements.values){

        //iot=element.businessObject.lanes[0].extensionElements.values[0].stringValue=="true"?true:false;
        iot=element.businessObject.lanes[0].extensionElements.values.some(function(field){
            return field.name=="iot" && (field.stringValue==true || field.stringValue=="true");
        });

  }

  const [eventType, setEventType] = useState(eventTypeField);
  if(eventTypeField && eventType!=eventTypeField) setEventType(eventTypeField);


  if(device!=getEventField("device")){
    setDevice(getEventField("device"));
    setOperation(getEventField("operation"));
    setCondition(getEventField("condition"));
  }

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  function enableAddOperation(){
    setSensorSelected(true);
  }

  function updateName(name) {
    const modeling = modeler.get('modeling');
    //modeling.updateLabel(element, name);
    modeling.updateProperties(element, {'name':name});
    setLaneName(name);
  }

  function updateEventName(name) {
    const modeling = modeler.get('modeling');
    modeling.updateProperties(element, {'name':name});
  }

  function updateOperation(operation) {
    const modeling = modeler.get('modeling');

    modeling.updateProperties(element, {
      'custom:operation': operation
    });

    modeling.updateLabel(element, operation);
  }

  function updateFloWareSystem(system) {
    const modeling = modeler.get('modeling');
    modeling.updateLabel(element, system);
  }


  function showEventList(){
    //var sensorID=element.businessObject.name.split(".")[0];
    if(device){
    	var sensorID=document.getElementById('eventDev').value;//element.businessObject.name.substring(1,element.businessObject.name.length-1);
    	showEventDialog(sensorID);
    }else{
      showEventErrorDialog("device");
    }
  }

  function showSensorList(){
  	if(ontology || element.businessObject.name) showSensorDialog();
    else showEventErrorDialog("eventName");
  }

  

  function showOperationList(){
      
      var IoTDeviceID=element.businessObject.lanes[0].name;

      if(IoTDeviceID!=null && IoTDeviceID!=undefined && IoTDeviceID.trim().length>0){
        //if(getDi(element).$parent.stroke)
            showOperationDialog(IoTDeviceID,1);
        /*else
          showOperationDialog(IoTDeviceID);*/

      }else{
        showMessage("Error","You must associate an IoT Device to the lane.");
      }

  }


  function showDevicesList(){
      showMicroserviceDialog();
  }


  function drawInColor(element, color){
    modeler.get('modeling').setColor(element, {
          stroke: color
      });
  }

  function enableSelection(e){
    if(iotLane!=e.target.id){
        iotLane=e.target.id;

        const camundaNs = 'http://camunda.org/schema/1.0/bpmn';
        const modeling = modeler.get('modeling');
        const moddle= modeler.get('moddle');

        let extensionElements = moddle.create('bpmn:ExtensionElements');
        let field1=moddle.createAny('camunda:field',camundaNs, {name:"iot", stringValue:!(iotLane=="noiot")})
        let field2=moddle.createAny('camunda:field',camundaNs, {name:"iotLane", stringValue:iotLane});
        extensionElements.get('values').push(field1);
        extensionElements.get('values').push(field2);
           
        modeling.updateProperties(element, {'extensionElements':extensionElements});

        updateName("");

        if(iotLane=="noiot"){
          drawInColor(element, "#000000");
        }else if(iotLane=="newIoT"){
          drawInColor(element, "#00c5ff"); 
        }else{
          drawInColor(element, "#0000FF");//Managed also when adding the Iot Device
        }

        setRedraw(!redraw);
    }
   
  }

  function toggleSensor(e){
        const camundaNs = 'http://camunda.org/schema/1.0/bpmn';
        const modeling = modeler.get('modeling');
        const moddle= modeler.get('moddle');

        let extensionElements=element.businessObject.extensionElements;
        let isSensor=e.target.value=="sensor"?true:false;

        let exists=false;
        extensionElements.values.forEach(function(field){
          if(field.name=="iotSensor"){
            exists=true;
            field.stringValue=isSensor;
          }
        });
        if(!exists){
          let field=moddle.createAny('camunda:field',camundaNs, {name:"iotSensor", stringValue:isSensor});
          extensionElements.get('values').push(field);
        }   
        modeling.updateProperties(element, {'extensionElements':extensionElements});

        setRedraw(!redraw);

  }


  function getEventInputLabel(){

      if(element.businessObject.targetRef && element.businessObject.targetRef.name){
        return element.businessObject.name +"."+element.businessObject.targetRef.name;
      }
      else if(element.businessObject.name){
          return element.businessObject.name;
      }
      else return '';
  }

  function connectedToMessageFlow(){
    var connected=false
    if(element.incoming){
      element.incoming.forEach(function(edge){
          if(edge.businessObject.$type=='bpmn:MessageFlow' && edge.businessObject.sourceRef.name=="PHYSICAL WORLD") connected=true;
      });
    }
    return connected; 
  }

  function getEventField(fieldName){
      let value="";
      if(element.businessObject.extensionElements && element.businessObject.extensionElements.values){
        element.businessObject.extensionElements.values.some(field=>{
          if(field.name==fieldName){
            value=field.stringValue;
            return;
          }
        });
      }
      return value;
  }

  function setEventField(fieldName, value){

    function addMessage(element,device){
        element.incoming.some(function(flow){
            if(flow.type=="bpmn:MessageFlow"){
              //flow.businessObject.name= "["+device+"]";
              //flow.label.businessObject.name= "["+device+"]";
              
              const modeling = modeler.get('modeling');
              modeling.updateLabel(flow, "["+device+"]");
      
              drawInColor(flow, "#0000ff");
              drawInColor(flow.target, "#0000ff");
             
              return;

            }
        });
    }

    const moddle= modeler.get('moddle');
    
    var extensionElements=element.businessObject.extensionElements;
    if(!extensionElements){
      extensionElements = moddle.create('bpmn:ExtensionElements');
    }

    let values=extensionElements.get('values').filter(field => field.name!=fieldName);

    var camundaNs = 'http://camunda.org/schema/1.0/bpmn';
    var field=moddle.createAny('camunda:field',camundaNs, {name:fieldName, stringValue:value});
    values.push(field);

    extensionElements.values=values;

    element.businessObject.extensionElements=extensionElements;

    switch(fieldName){
      case "device": addMessage(element,value);
                     setDevice(value);
                     setOperation("");
                      break;
      case "operation": setOperation(value);
                        if(ontology) updateName(value);
                        break;
      case "condition": setCondition(value);break;
      case "description": setDescription(value);break;
    }
    
  }

  function doNothing(){}

  function eventTypeHandler(input){

    setEventType(input.value);

    const moddle= modeler.get('moddle');
    var extensionElements=element.businessObject.extensionElements;
    if(!extensionElements){
      extensionElements = moddle.create('bpmn:ExtensionElements');
    }

    let values=extensionElements.get('values').filter(field => field.name!="eventType");
    let camundaNs = 'http://camunda.org/schema/1.0/bpmn';
    let field=moddle.createAny('camunda:field',camundaNs, {name:"eventType", stringValue:input.value});
    values.push(field);

    extensionElements.values=values;
    element.businessObject.extensionElements=extensionElements;
  }


  return (

    <div className="element-properties" key={ element.id }>
      {
        is(element, 'bpmn:ServiceTask') && iot &&
           <form className="form-inline" style={{paddingTop:"20px"}}>
            <label className="col-4 col-form-label">Operation to execute</label>
            <input id="propertyValue" className="form-control col-4" value={ element.businessObject.get('name') || ''} onChange={ (event) => {
              updateOperation(event.target.value)
            } } />
             <a className="btn btn-primary col-2" onClick={ showOperationList } >Select</a>
          </form>
      }
      {
        is(element, 'bpmn:Lane') &&
          <form className="form-inline" style={{paddingTop:"20px"}}>
            <div className="row" style={{width:"100%"}}>
              <div className="btn-group btn-group-toggle" data-toggle="buttons" style={{position:"absolute", top:"0px", left:"1%"}}>
                <label className="btn btn-primary" style={active.noiot} onClick={enableSelection} id="noiot">
                  <input type="radio" name="iotLane" value="noiot" checked={iotLane=="noiot"} onChange={doNothing}/> 
                  Human
                </label>

                <label className="btn btn-primary" style={active.newIoT} onClick={enableSelection} id="newIoT" >
                  <input type="radio" name="iotLane" value="newIoT" checked={iotLane=="newIoT"} onChange={doNothing}/> 
                  {(element.parent.businessObject.name && element.parent.businessObject.name=="Software Systems")?"New App":"New IoT Device"}
                </label>

                <label className="btn btn-primary" style={active.existing} onClick={enableSelection} id="existing">
                  <input type="radio" name="iotLane" value="existing" checked={iotLane=="existing"} onChange={doNothing}/> 
                  {(element.parent.businessObject.name && element.parent.businessObject.name=="Software Systems")?"Existing App":"Existing IoT Device"}
                </label>

         
              </div>
            </div>

            {iotLane=="existing" && <div className="row" style={{width:"100%"}}>
              <div className="offset-2 col-8" style={{marginTop:"20px"}}>
                <input id="propertyValue" className="form-control" value={laneName} onChange={ (event) => {
                  updateName(event.target.value)
                } } style={{width:"100%"}} disabled={true}/>
              </div>
              <div className="col-2" style={{marginTop:"20px"}}>
                <a id="selectButton" className="btn btn-primary" onClick={ showDevicesList } >Select</a>
              </div>
            </div>}

            {iotLane=="noiot" && <div className="row" style={{width:"100%",marginTop:"20px"}}>
                <div className="offset-1 col-3">
                    <label className="col-form-label">Actor</label>
                </div>
                <div className="col-6">
                    <input id="laneName" className="form-control" value={laneName} 
                     onChange={ (event) => {updateName(event.target.value)} } style={{width:"100%"}}/>
                </div>
            </div>}

            {iotLane=="newIoT" && <div className="row" style={{width:"100%"}}>
                <div className="offset-1 col-3" style={{marginTop:"20px"}}>
                    <label className="col-form-label">IoT Device Name</label>
                </div>
                <div className="col-5" style={{marginTop:"20px"}}>
                    <input id="laneName" className="form-control" value={laneName} 
                     onChange={ (event) => {updateName(event.target.value)} } style={{width:"100%"}}/>
                </div>
                {
                (element.parent.businessObject.name && element.parent.businessObject.name!="Software Systems") && 
                <div className="col-3">
                  <div className="form-check"  style={{justifyContent:"left"}}>
                    <input className="form-check-input" type="radio" name="deviceType" id="sensorRadioOpt" value="sensor" checked={sensor} onChange={toggleSensor}/>
                      <b>Sensor</b>
                  </div>
                  <div className="form-check" style={{justifyContent:"left"}}>
                    <input className="form-check-input" type="radio" name="deviceType" id="actuatorRadioOpt" value="actuator" checked={!sensor} onChange={toggleSensor}/>
                    <b>Actuator</b>
                  </div>
                </div>
                }
            </div>}
         </form>
      }
      {
        is(element, 'bpmn:Participant') && element.businessObject.name!="PHYSICAL WORLD" && localStorage.getItem("isFloWare")=="1" &&
          <form className="form-inline" style={{paddingTop:"20px"}}>
            <label className="col-4 col-form-label">FloWare System</label>
            <input id="propertyValue" className="form-control col-4" value={ element.businessObject.get('name') || ''} onChange={ (event) => {
              updateFloWareSystem(event.target.value)
            } } />
             <a className="btn btn-primary col-2" onClick={ showSystemDialog } >Select</a>
          </form>
      }
      {
        element.businessObject.eventDefinitions && connectedToMessageFlow() &&
           <form className="form-inline">
              <u>Event Type</u>:&nbsp;&nbsp;
              <input type="radio" name="eventType" value="data" checked={eventType=="data"} onChange={(event) => {eventTypeHandler(event.target)} }/> 
                  New Data&nbsp;&nbsp;
              <input type="radio" name="eventType" value="atomic" checked={eventType=="atomic"} onChange={(event) => {eventTypeHandler(event.target)} }/> 
                  Atomic&nbsp;&nbsp;
              <input type="radio" name="eventType" value="complex" checked={eventType=="complex"} onChange={(event) => {eventTypeHandler(event.target)} }/> 
                  Complex

              {eventType=="data" && !ontology &&
              <div className="row" style={{width:"100%", marginTop:"1px"}}>
                 <div className="mb-3 col-4" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventName" className="form-label" style={{display:"inherit"}}>Name</label>
                  <input id="eventName" className="form-control" value={ element.businessObject.name || '' } onChange={ (event) => {
                  updateName(event.target.value)  } } style={{width:"100%"}}/>
                </div>

                  <div className="mb-3 col-8" style={{paddingRight:"0px"}}>
                    <label htmlFor="eventDev" className="form-label" style={{display:"inherit"}}>Device</label>
                    <div className="input-group" >
                      <input type="text" className="form-control" id="eventDev" value={device} disabled={true} onChange={ (event) => {
                    setEventField("device", event.target.value)  } }/>
                      <a className="btn btn-outline-secondary" id="addDev" onClick={ showSensorList }>+</a>
                    </div>
                  </div>
              </div>
              }

              {eventType=="data" && ontology &&
              <div className="row" style={{width:"100%", marginTop:"1px"}}>
                 <div className="mb-3 col-6" style={{paddingRight:"0px"}}>
                    <label htmlFor="eventDev" className="form-label" style={{display:"inherit"}}>Device</label>
                    <div className="input-group" >
                      <input type="text" className="form-control" id="eventDev" value={device} disabled={true} onChange={ (event) => {
                    setEventField("device", event.target.value)  }} style={{width:"40%"}}/>
                      <a className="btn btn-outline-secondary" id="addDev" onClick={ showSensorList }>+</a>
                    </div>
                  </div>

                 <div className="mb-3 col-6" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventOp" className="form-label" style={{display:"inherit"}}>Observation</label>
                  <div className="input-group" >
                      <input type="text" className="form-control" id="eventOp" value={operation} disabled={true} onChange={ (event) => {
                    setEventField("operation", event.target.value) } } style={{width:"40%"}}/>
                      <a className="btn btn-outline-secondary" id="addDev" onClick={ showEventList }>+</a>
                    </div>
                </div>
                 
              </div>
              }

              {eventType=="atomic" &&
              <div className="row" style={{width:"100%", marginTop:"1px"}}>
                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventName" className="form-label" style={{display:"inherit"}}>Name</label>
                  <input id="eventName" className="form-control" value={ element.businessObject.name || '' } onChange={ (event) => {
                  updateEventName(event.target.value)  } } style={{width:"100%"}}/>
                </div>
                
                <div className="mb-3 col-4" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventDev" className="form-label" style={{display:"inherit"}}>Device</label>
                  <div className="input-group" >
                    <input type="text" className="form-control" id="eventDev" value={device} disabled={true} onChange={ (event) => {
                  setEventField("device", event.target.value)  } }/>
                    <a className="btn btn-outline-secondary" id="addDev" onClick={ showSensorList }>+</a>
                  </div>
                </div>

                <div className="mb-3 col-4" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventOp" className="form-label" style={{display:"inherit"}}>Operation</label>
                  <div className="input-group" >
                    <input type="text" className="form-control" id="eventOp" value={operation} disabled={true} onChange={ (event) => {
                  setEventField("operation", event.target.value)  } }/>
                    <a className="btn btn-outline-secondary" id="addOp" onClick={ showEventList } disabled={device.length==0} >+</a>
                  </div>
                </div>

                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventCondition" className="form-label" style={{display:"inherit"}}>Condition</label>
                  <input id="eventCondition" className="form-control" value={condition} onChange={ (event) => {
                  setEventField("condition", event.target.value) }} style={{width:"100%"}}/>
                </div>
              </div>
            }
            {eventType=="complex" && 
            <div className="row" style={{width:"100%", marginTop:"1px"}}>
                <div className="mb-3 col-2" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventName" className="form-label" style={{display:"inherit"}}>Name</label>
                  <input id="eventName" className="form-control" value={ element.businessObject.name || '' } onChange={ (event) => {
                  updateName(event.target.value)  } } style={{width:"100%"}}/>
                </div>
                <div className="mb-3 col-10" style={{paddingRight:"0px"}}>
                  <label htmlFor="eventDescription" className="form-label" style={{display:"inherit"}}>Description</label>
                  <input id="eventDescription" placeholder="Define the complex event in natural language" className="form-control" value={description} onChange={ (event) => {
                  setEventField("description", event.target.value) }} style={{width:"100%"}}/>
                </div>
            </div>  
            }
          </form>
      }
      {
          !is(element, 'bpmn:ServiceTask') && !is(element, 'bpmn:Lane') && 
          !(element.businessObject.eventDefinitions && connectedToMessageFlow()) && 
          !(is(element, 'bpmn:Participant')&& element.businessObject.name!="PHYSICAL WORLD" && localStorage.getItem("isFloWare")=="1") &&  
          <div style={configLabel}>IoT Configuration Panel</div>
      }

    </div>
  );
}