import ReactDOM from 'react-dom';
import React from 'react';
import {updateMenuRedLabel, newComposition} from "../menu/Menu.js";
import {updateDownloadButtonFloWareOption} from "../properties-panel/DownloadButton.js";
import {updateSendButtonFloWareOption} from "../properties-panel/SendButton.js";
import {updateSendDialogFloWareOption} from "../dialogs/SendCompositionDialog.js";

export var showConfig = function(){
    window.configDialog.showConfig(); 
};

export var defaultExampleConfig = function(){
    window.configDialog.defaultExample();
};

export var systemReload = function(system){
    window.configDialog.externalReLoad(system);
};


export default class ConfigDialog extends React.Component {

  constructor(props) {
    super(props);

    window.configDialog=this;

    this.state = {
      title:"IoT System",
      serviceRegistryURLLabel:"URL of the Service Registry",
      serviceRegistryTypeLabel:"Type of the Service Registry",
      BPControllerLabel:"URL of the BP Controller",
      saveButtonLabel:"Save",
      cancelButtonLabel:"Close",
      id:"config-dialog",
      defaultServiceRegistryUrl:"https://pedvalar.webs.upv.es/microservices/",
      defaultManagerUrl:"https://pedvalar.webs.upv.es/microservices/",
      placeHolderRegistryUrl: "default: https://pedvalar.webs.upv.es/eureka/",
      serviceRegistryUrl:"",
      managerUrl:"",
      serviceRegistryType:"eureka",
      iotSystems:[],
      selectedIoTSystem:"",
      other:false,
      error:null,
      firstTime:true
    };

    this.systemUrl="https://pedvalar.webs.upv.es/microservices/systems";

    this.saveConfig=this.saveConfig.bind(this);
    this.changeManagerUrl=this.changeManagerUrl.bind(this);
    this.changeServiceRegistryUrl=this.changeServiceRegistryUrl.bind(this);
    this.changeIoTSystem=this.changeIoTSystem.bind(this);
    this.systemLoad=this.systemLoad.bind(this);
    this.updateValues=this.updateValues.bind(this);
    this.showConfig=this.showConfig.bind(this);
    this.defaultExample=this.defaultExample.bind(this);
    this.showAreYouSureSavingDialog=this.showAreYouSureSavingDialog.bind(this);
  }

  updateFloWareElements(){
    updateMenuRedLabel();
    updateDownloadButtonFloWareOption();
    updateSendButtonFloWareOption();
    updateSendDialogFloWareOption();
  }

  defaultExample(){
      var _this=this; 
      this.state.iotSystems.forEach(function(system,index){
          if(system.id=="SMARTDIST"){
            localStorage.setItem("serviceServerType", system.type);
            localStorage.setItem("serviceServerUrl", system.url);
            localStorage.setItem("selectedSystem", system.id);
            localStorage.setItem("isFloWare", system.isFloWare);
            _this.updateFloWareElements();
          }
      });
     
  }

  changeManagerUrl(event){
      this.setState({managerUrl: event.target.value});
  }

  changeServiceRegistryUrl(event){
      this.setState({serviceRegistryUrl: event.target.value});
  }

  changeIoTSystem(event){
    var placeHolderRegistryUrl= "default: https://pedvalar.webs.upv.es/eureka/";
    if(event.target.value=="other")  placeHolderRegistryUrl="";
    this.setState({selectedIoTSystem: event.target.value, serviceRegistryUrl:"", placeHolderRegistryUrl:placeHolderRegistryUrl, other: event.target.value=="other"});
  }

  showConfig(){
    this.refreshData();
    $('#'+this.state.id).modal();
  }


  showAreYouSureSavingDialog(){
    $('#'+this.state.id).modal('hide');
    if(!this.state.firstTime){
        if(localStorage.getItem("selectedSystem")!=this.state.iotSystems[this.state.selectedIoTSystem].id)
          $('#'+this.state.id+"SURE").modal();
    }else{
      this.setState({firstTime: false});
      this.saveConfig(true);
    }
  }


  saveConfig(close){
    
    if(this.state.other){
      localStorage.setItem("serviceServerType", this.state.serviceRegistryType);

      if(this.state.serviceRegistryUrl.length==0){
        localStorage.setItem("serviceServerUrl", this.state.defaultServiceRegistryUrl);
      }else{
        localStorage.setItem("serviceServerUrl", this.state.serviceRegistryUrl);
      }
      localStorage.setItem("selectedSystem", "other");
    }else{
       localStorage.setItem("serviceServerType", this.state.iotSystems[this.state.selectedIoTSystem].type);
       localStorage.setItem("serviceServerUrl", this.state.iotSystems[this.state.selectedIoTSystem].url);
       localStorage.setItem("selectedSystem", this.state.iotSystems[this.state.selectedIoTSystem].id);
       localStorage.setItem("isFloWare", this.state.iotSystems[this.state.selectedIoTSystem].isFloWare);
       localStorage.setItem("isOntology", this.state.iotSystems[this.state.selectedIoTSystem].isOntology);
       this.updateFloWareElements();
    }


    if(this.state.managerUrl.length==0){
        localStorage.setItem("managerUrl", this.state.defaultManagerUrl);
    }else{
        localStorage.setItem("managerUrl", this.state.managerUrl);
    }

    if(close){
        $('#'+this.state.id).modal('hide');
        $('#'+this.state.id+"SURE").modal('hide');
        newComposition();
    }

    sessionStorage.removeItem("urls");
    sessionStorage.removeItem("processId");
  }

  componentWillMount(){
    this.systemLoad();
  }

  async externalReLoad(system){
    var response = await fetch(this.systemUrl);
    const systems= await response.json();
    var selectedIndex=0;
 
    systems.forEach(function(sys,index){
      if(sys.id==system) selectedIndex=index;
    });
    this.setState({iotSystems: systems, selectedIoTSystem: selectedIndex});
    this.saveConfig(false);
  }

  async systemLoad(){
    var response = await fetch(this.systemUrl);
    const systems= await response.json();
       
    this.setState({iotSystems: systems, selectedIoTSystem: 0});
    this.updateValues();
  }

  updateValues(){
    if(localStorage.getItem("selectedSystem")==null){
      $('#config-dialog').modal();
      this.saveConfig(false);
    }else{
      this.refreshData();
    }
  }

  refreshData(){
    var other=localStorage.getItem("selectedSystem")=="other";
    var selectedSystem="other";
    if(!other){
      this.state.iotSystems.forEach(function(system,index){
        if(system.id==localStorage.getItem("selectedSystem")) selectedSystem=index;
      });
    }
    this.setState({managerUrl: localStorage.getItem("managerUrl"),
                   serviceRegistryUrl: localStorage.getItem("serviceServerUrl"),
                   other:other,
                   selectedIoTSystem:selectedSystem
                 });
    sessionStorage.removeItem("processId");
  }

  render(){
    var titleStyle={
      fontSize:18,
      fontWeight:'bold'
    };

    const systems=this.state.iotSystems.map((system, index) =>
         <option key={"system"+system.id} value={index}>{system.name}</option>
    );
    var registryUrl="";
    var placeHolderRegistryUrl="";

    if(this.state.other){
        registryUrl=this.state.serviceRegistryUrl;
        placeHolderRegistryUrl="default: "+this.state.defaultServiceRegistryUrl;
    }

    return(
      <div>
       <div className="modal" tabIndex="-1" role="dialog" id={this.state.id}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.state.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={titleStyle}>Select an IoT System</div>
              <div className="form-group">
                 <select className="form-control" id="iotSystem" value={this.state.selectedIoTSystem} onChange={this.changeIoTSystem}>
                    {systems}
                    {/*<option key="other" value="other">Other</option>*/}
                    }
                </select>
              </div>
{  /*         <div className="form-group">
                             <label htmlFor="serviceRegistryUrl" disabled={!this.state.other}>{this.state.serviceRegistryURLLabel}</label>
                <input type="text" className="form-control" id="serviceRegistryUrl" placeholder={this.state.placeHolderRegistryUrl}
                    value={registryUrl} onChange={this.changeServiceRegistryUrl} disabled={!this.state.other}/>
              </div>
              <div className="form-group">
                <label htmlFor="serviceRegistryType" disabled={!this.state.other}>{this.state.serviceRegistryTypeLabel}</label>
                <select className="form-control" id="serviceRegistryType" defaultValue={this.state.serviceRegistryType} disabled={!this.state.other}>
                    <option value="eureka">Eureka</option>
                </select>
              </div>
              <hr/>
              <div style={titleStyle}>Business Process Controller</div>
              <div className="form-group">
                <label htmlFor="managerUrl">{this.state.BPControllerLabel}</label>
                <input type="text" className="form-control" id="managerUrl" placeholder={"default: "+this.state.defaultManagerUrl} 
                        value={this.state.managerUrl} onChange={this.changeManagerUrl}/>
              </div>
*/}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.showAreYouSureSavingDialog}>{this.state.saveButtonLabel}</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">{this.state.cancelButtonLabel}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal" tabIndex="-1" role="dialog" id={this.state.id+"SURE"}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.state.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div>If you change the system a new empty BPMN model will be created. Are you sure?</div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.saveConfig.bind(this,true)}>Yes</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">No</button>
            </div>
          </div>
        </div>
      </div>

    </div>
    );
  }
}
