import React from 'react';
import {showMessage} from './MessageDialog.js'
import {updateMenuRedLabel,updateMenuTitle} from "../menu/Menu.js";
import {updateDownloadButtonFloWareOption} from "../properties-panel/DownloadButton.js";
import {updateSendButtonFloWareOption} from "../properties-panel/SendButton.js";
import {updateSendDialogFloWareOption} from "../dialogs/SendCompositionDialog.js";
import {createIoTDevicesList} from "../dialogs/IoTDeviceDialog.js";
import './loader.css';

export var showRemoteDialog = function(){
     $("#load-remote-dialog").modal();
};

export var loadComposition = function(compo){
     window.showRemoteDialog.loadBPMN(compo);
};

export default class UploadDialog extends React.Component {

  constructor(props) {
    super(props);

    this.modeler=this.props.modeler;

    this.state = {
      title:"Select an existing IoT-Enhanced BP from the Server",
      id:"load-remote-dialog",
      userLabel:"Introduce a user ID and click Load",
      compositions:null,
      userID:"",
      loaderID:"remoteLoader"
    };

    this.loadBPMN=this.loadBPMN.bind(this);
    this.loadCompos=this.loadCompos.bind(this);
    this.userIdHandler=this.userIdHandler.bind(this);

    window.showRemoteDialog=this;

  }

  updateSystem(system, isFloWare, isOntology){
    localStorage.setItem("selectedSystem",system);
    localStorage.setItem("isFloWare",isFloWare);
    localStorage.setItem("isOntology",isOntology);
    updateMenuRedLabel();
    updateDownloadButtonFloWareOption();
    updateSendButtonFloWareOption();
    updateSendDialogFloWareOption();
  }

  loadBPMN(compo){
    var user;
    if(compo.system){
      this.updateSystem(compo.system, compo.isFloWare, compo.ontology);
      user=this.state.userID;
    }else{ //is called from SendSystemModelsDialog
      user=compo.user;
    }
   
    if(compo.processId!=null)
      sessionStorage.setItem("processId",compo.processId);
    else 
      sessionStorage.removeItem("processId");

    var url=localStorage.getItem("managerUrl")+(localStorage.getItem("managerUrl").charAt(localStorage.getItem("managerUrl").length-1)=="/"?"":"/");
    updateMenuTitle(compo.id);
    fetch(url+"compositions/"+user+"/"+compo.id)
      .then(function (response) {
        return response.text();
      })
      .then(compoBPMN => {
         this.modeler.importXML(compoBPMN);
         
         $("#"+this.state.id).modal('hide');
/************************************ REPETIDO EN IOTDEVICEDIALOG ************************************/
        let url=localStorage.getItem("serviceServerUrl")+(localStorage.getItem("serviceServerUrl").charAt(localStorage.getItem("serviceServerUrl").length-1)=="/"?"":"/")+localStorage.getItem("selectedSystem")+"/eureka/apps";
        fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(microservices => {
             /* var urls={};
              const devices = microservices.applications.application.reduce((devices,microservice) =>{
                  var id=microservice.id;
                  var name=microservice.name;
                  var host=microservice.instance[0].hostName;
                  var port=microservice.instance[0].port.$;
                   //urls[name]="http://"+host+":"+port+"/operations"; <-- With microservice architecture
                   urls[name]="http://"+host+":"+port+"/microservices/"+id+"/operations"; //<-- With PHP emulator
                   devices.push(name);
                  return devices;
              }, []);
              sessionStorage.setItem("urls",JSON.stringify(urls));*/
              createIoTDevicesList(microservices);
          })
          .catch(error => {
              this.setState({error:error});
            }
          )

/*************************************************************************************************/

      })
      .catch(error => {
          showMessage("Error","Error Loading the selected BP");
        }
      )   
    
  }

  loadCompos(){
      var user=this.state.userID;
      if(this.state.userID.length==0){
        this.setState({userID: "default"});
        user="default";
        //showMessage("Attention","Please, introduce a user ID");
      }//else{
     

      document.getElementById(this.state.loaderID).style.display = "block";

      var url=localStorage.getItem("managerUrl")+(localStorage.getItem("managerUrl").charAt(localStorage.getItem("managerUrl").length-1)=="/"?"":"/");

      fetch(url+"compositions/user/"+user)
        .then(function (response) {
          return response.json();
        })
        .then(compositions => {
            this.setState({ compositions: compositions });
            document.getElementById(this.state.loaderID).style.display = "none";
        })
        .catch(error => {
           showMessage("Error","Error Loading the list of BPs");
          }
        ) 

      //}
  }

  userIdHandler(event){
    this.setState({"userID":event.target.value})
  }

  render(){

    var compoDivs="";
    if(this.state.compositions!=null){
        compoDivs=this.state.compositions.map(compo => 
          <li className="list-group-item" key={compo.id+"LI"}><a href="#" onClick={this.loadBPMN.bind(this,compo)}>{compo.id}</a></li>
        );
    }

    var titleStyle={
      fontSize:18,
      fontWeight:'bold'
    };

    return(
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
                <div className="loader_container" id="remoteLoader">
                    <div className="lds-hourglass"></div>
                </div>
                    <div className="form-group">
                      <div style={titleStyle}>{this.state.userLabel}</div>
                      <div className="input-group mb-3">
                        <input type="text" className="form-control" value={this.state.userID} onChange={this.userIdHandler} placeholder="default"/>
                        <div className="input-group-append">
                          <button className="btn btn-outline-primary" type="button" onClick={this.loadCompos}>Load</button>
                        </div>
                      </div>
                    </div>
                    <div className="loader_container" id={this.state.loaderID}>
                      <div className="lds-hourglass"></div>
                  </div>
                    <ul className="list-group">{compoDivs}</ul>
              </div>
          </div>
        </div>
      </div>
    );
  }

}