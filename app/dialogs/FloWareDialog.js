import ReactDOM from 'react-dom';
import React from 'react';
import './UploadDialog.css';
import { loadIoTDevicesFromFloWare } from './IoTDeviceDialog';
import { systemReload } from './ConfigDialog';
import { showMessage } from './MessageDialog';
import {MQTT, HTTP} from '../floWare/FloWareConfig.js'
import FloWarePIM from '../floWare/FloWarePIM.js'
import './loader.css';

export var showFloWareDialog = function(){
     $("#floWare-composition-dialog").modal();
};

export default class FloWareDialog extends React.Component {

  constructor(props) {
    super(props);

    this.title="Select a FloWare description of microservices";
    this.id="floWare-composition-dialog";
    this.loader="floWare-loader";

    this.fileReader=new FileReader();

    this.url="https://pedvalar.webs.upv.es/microservicesEmu/insertFloWareSystem.php";

    this.fileRead=this.fileRead.bind(this);
    this.close=this.close.bind(this);
    this.fileHandler=this.fileHandler.bind(this);
    this.sendFloWareSystem=this.sendFloWareSystem.bind(this);
  }

  fileRead(e){
    document.getElementById(this.loader).style.display = "inline";
    
    //var floWareDesc=JSON.parse(this.fileReader.result);
    //this.saveIoTSystem(floWareDesc, this.fileReader.fileName.substring(0,this.fileReader.fileName.length-5));
    this.sendFloWareSystem(this.fileReader.result);
    this.close();
  }

  close(){
    document.getElementById(this.loader).style.display = "none";
    $("#"+this.id).modal('hide');
  }

  fileHandler(file){
    this.fileReader.onloadend=this.fileRead;
    this.fileReader.fileName=file.target.files[0].name
    this.fileReader.readAsText(file.target.files[0]);
  }

/*  saveIoTSystem(pim, fileName){

    var systemID=pim[0].Name.replaceAll(" ","");
    var systemName=pim[0].Name;

    var floWarePIM=new FloWarePIM(pim);
    var subSystems=floWarePIM.getFirtLevelNodes();
    console.log(sybSystems);

    var iotDevices=[];  
    pim.forEach(entity => {
      if(entity.Type=="Device"){
        var operations=[];
        var events=[];

        if(entity.Operations){
          Object.keys(entity.Operations).forEach(opID => {
            var op=entity.Operations[opID];

            var iotOp={
                  "name": op["Operation Name"],
                  "description": op.Description
              };

          }); // End For Each Operation
        } // End with Operations

        iotDevices.push({
                    "name":entity.Name,
                    "sensor": entity["Device type"]=="Sensor"?1:0,
                    "operations":operations
                    //"events":events,
                  });

      } // End IF type = DEVICE

    }); //End For Each Entity

    var system={
          "systemID": systemID,
          "systemName": systemName,
          "iotDevices":iotDevices,
          "subSystems":subSystems
        }

    console.log(JSON.stringify(system));

    sendFloWareSystem(JSON.stringify(system));
}*/

sendFloWareSystem(floWare){
    fetch(this.url,
          {
            method:"POST",
            body: floWare
          }

      ).then(function (response) {
                return response.json();
              })
              .then(result => {
                  console.log(result);
                  if(result.code==1){
                    systemReload(result.systemID);
                    showMessage("Attention","IoT System created correctly.<br> You can now associate IoT devices to BPMN Lanes");
                  }else if(result.code==-2){
                     showMessage("Error",result.message);
                  }else{
                    showMessage("Error","An error occurred while creating the IoT system. Please contact the person responsible for this tool.");
                    console.log(result);
                  }
              })
              .catch(error => {
                  showMessage("Error","An error occurred while creating the IoT system. Please contact the person responsible for this tool.");
                  console.log(error);
                }
              )   

   
  }

/*      document.querySelector('#'+this.state.loader).style.display = "block";

      if(this.serviceServerType=="eureka"){
        var url=this.serviceServerUrl+(this.serviceServerUrl.charAt(this.serviceServerUrl.length-1)=="/"?"":"/")+localStorage.getItem("selectedSystem")+"/eureka/apps";
        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(microservices => {
              var urls={};
              const devices = microservices.applications.application.reduce((devices,microservice) =>{
                  if(microservice.operations.length>0){
                    var id=microservice.id;
                    var name=microservice.name;
                    var host=microservice.instance[0].hostName;
                    var port=microservice.instance[0].port.$;
                     //urls[name]="http://"+host+":"+port+"/operations"; <-- With microservice architecture
                     urls[name]="http://"+host+":"+port+"/microservices/"+id+"/operations"; //<-- With PHP emulator
                     devices.push({
                        name: name,
                        iot:microservice.iot,
                        sensor:microservice.sensor
                      });
                  }
                  return devices;
              }, []);
              this.setState({ devices: devices })
              //sessionStorage.setItem("urls",JSON.stringify(urls));
          })
          .catch(error => {
              this.setState({error:error});
            }
          )   
      }
  }*/
 
  render(){
    return(
     <div className="modal" tabIndex="-1" role="dialog" id={this.id}>
        <div className="modal-dialog" role="document">
         <div className="loader_container" id={this.loader}>
              <div className="lds-hourglass"></div>
          </div>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
                <form method="post">
                      <div className="form-group files">
                        <input type="file" className="form-control" onChange={this.fileHandler}/>
                      </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

}