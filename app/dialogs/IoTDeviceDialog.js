import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import './loader.css';


export var showMicroserviceDialog = function(){
   window.iotDeviceDialog.show();
};

export var hideMicroserviceDialog = function(){
    window.iotDeviceDialog.hide();
};

export var createIoTDevicesList = function(microservices){
    window.iotDeviceDialog.createIoTDevicesList(microservices);
};

export default class IoTDeviceDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      error:null,
      type:"iotDeviceList",
      title:"IoT Devices",
      id:"iotDeviceDialog",
      loader:"iotDeviceLoader"
    };

    this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
    this.serviceServerType=localStorage.getItem("serviceServerType");

    window.iotDeviceDialog=this;

    this.loadIoTDevices=this.loadIoTDevices.bind(this);
    this.drawInColor=this.drawInColor.bind(this);
    this.getPoolName=this.getPoolName.bind(this);
    this.createIoTDevicesList=this.createIoTDevicesList.bind(this);
  }

  show(){
      if(localStorage.getItem("isOntology")==1) this.setState({title:"SAREF IoT Devices"});

  //  if(sessionStorage.getItem("urls")==null){
      this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
      this.serviceServerType=localStorage.getItem("serviceServerType");
      this.loadIoTDevices();
  //  }
    document.querySelector('#'+this.state.id).style.display = "block";
  }

  hide(){
     document.querySelector('#'+this.state.id).style.display = "none";
  }

  getPoolName(){
    var selectedElement = this.props.modeler.get('selection').get()[0];
    var idProcess=selectedElement.businessObject.$parent.$parent.id;
    var poolName=null;

    const definitions=this.props.modeler.get('canvas').getRootElement().businessObject.$parent;
    jQuery.each(definitions.rootElements,function(index, element){
        if (element.$type=="bpmn:Collaboration"){
          jQuery.each(element.participants, function(index, participant){
              if(participant.name!='PHYSICAL WORLD' && participant.processRef && participant.processRef.id==idProcess){
                poolName=participant.name;
                return false;
              }
            });
        }
        if(poolName!=null) return false;
    });

    return poolName;
  }

  createIoTDevicesList(microservices){
      let urls={};
      let devices = microservices.applications.application.reduce((devices,microservice) =>{
          if(microservice.operations.length>0){
            let id=microservice.id;
            let name=microservice.name;
            let host=microservice.instance[0].hostName;
            let port=microservice.instance[0].port.$;
             //urls[name]="http://"+host+":"+port+"/operations"; <-- With microservice architecture
             if(port!=80)
                urls[name]="https://"+host+":"+port+"/microservices/"+id+"/operations"; //<-- With PHP emulator
             else
                urls[name]="https://"+host+"/microservices/"+id+"/operations";
              devices.push({
                name: name,
                iot:microservice.iot,
                sensor:microservice.sensor
              });
          }
          return devices;
      }, []);
      if(devices.length>0){
        this.setState({ devices: devices })
        if(sessionStorage.getItem("urls")!=null){
          var existingUrls=JSON.parse(sessionStorage.getItem("urls"));
          Object.keys(existingUrls).forEach(function(key){
              urls[key]=existingUrls[key];
          });
        }
        sessionStorage.setItem("urls",JSON.stringify(urls));
      }else{
        if(localStorage.getItem("isFloWare")=="1")
            this.setState({error:"There are no devices associated to the FloWare system that provide selectable operations."});
      }
      document.getElementById(this.state.loader).style.display = "none";
  }


  loadIoTDevices() {
      document.getElementById(this.state.loader).style.display = "block";
      this.setState({error:null});

      if(this.serviceServerType=="eureka"){
        var url=null;
        if(localStorage.getItem("isFloWare")=="1"){
          var poolName=this.getPoolName();
          if(poolName==null || poolName.length==0){
            this.setState({error:"Please, associate the pool to a FloWare system."});
            document.getElementById(this.state.loader).style.display = "none";
          }else
            url=this.serviceServerUrl+(this.serviceServerUrl.charAt(this.serviceServerUrl.length-1)=="/"?"":"/")+"system/floware/"+localStorage.getItem("selectedSystem")+"/subsystems/"+poolName;
        }else{
          url=this.serviceServerUrl+(this.serviceServerUrl.charAt(this.serviceServerUrl.length-1)=="/"?"":"/")+localStorage.getItem("selectedSystem")+"/eureka/apps";
        }
   
       //url=url.replaceAll(" ","%20");
 
        if(url!=null){
          fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(microservices => {
                createIoTDevicesList(microservices);
          })
          .catch(error => {
              this.setState({error:error});
            }
          )
        }   
      }
  }

  drawInColor(element, color){
    this.props.modeler.get('modeling').setColor(element, {
          stroke: color
      });
  }

  addIoTDevice(name, iot, sensor){
    const modeler=this.props.modeler;
    var selectedElement = modeler.get('selection').get()[0];
    
    if(sensor==1){
        name="["+name+"]";
        const moddle = modeler.get('moddle');

        var extensionElements=selectedElement.businessObject.extensionElements;
        if(!extensionElements){
          extensionElements = moddle.create('bpmn:ExtensionElements');
        }

        let values=extensionElements.get('values').filter(field => field.name!="iotSensor");

        var camundaNs = 'http://camunda.org/schema/1.0/bpmn';
        var field=moddle.createAny('camunda:field',camundaNs, {name:"iotSensor", stringValue:1});
        values.push(field);

        extensionElements.values=values;
        selectedElement.businessObject.extensionElements=extensionElements;
     } 

    var element=document.querySelector('#propertyValue');
    element.value=name;


    const modeling = modeler.get('modeling');
    modeling.updateLabel(selectedElement, name);

    if(iot==1) this.drawInColor(selectedElement, "#0000FF");
    else this.drawInColor(selectedElement, "#000000");//"#b432be");
    
    $("#"+this.state.id).css("display","none");
  }


  render(){
    //sessionStorage.removeItem("urls");
  	 var content;
  	 if(this.state.error==null) {
	  		const devices = this.state.devices.map(device =>{
            var img="actuator.png";
            var style={
              color:"blue"
            }
            if(device.sensor==1) img="sensor.png";
            if(device.iot==0){
              img="software.png";
              var style={
                color:"#000000"//"#b432be"
              }
            }
            return <li className="list-group-item" key={device.name+"LI"}><img src={"imgs/"+img} height="20px"/>&nbsp;&nbsp;&nbsp;<a href="#" onClick={this.addIoTDevice.bind(this,device.name, device.iot, device.sensor)} style={style}>{device.name}</a></li>;
        });
        
	  		content=<ul className="list-group">{devices}</ul>;
  	 }else{
        var errorStyle={
          textAlign:"center",
          color:"red",
          paddingTop:"10px"
        }
  			content=<div style={errorStyle}>{this.state.error}</div>;
  	 }

  	return (
  		<Dialog type={this.state.type} title={this.state.title} id={this.state.id} loader={this.state.loader} content={content} />
  	);
  }

}