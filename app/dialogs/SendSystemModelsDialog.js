import ReactDOM from 'react-dom';
import React from 'react';
import { showMessage } from '../dialogs/MessageDialog';
import FloWarePSM from '../floWare/FloWarePSM.js';
import {loadComposition} from '../dialogs/RemoteDialog.js';
import JSZip from 'jszip';
import FileSaver from 'file-saver';


export var showSendSystemModelsDialog = function(){
    window.sendSystemModels.show();
};

export default class SendSystemModelsDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      type:"modal",
      title:"Deploy FloWare PSM and BPMN models of system "+localStorage.getItem("selectedSystem"),
      userLabel:"Introduce a user ID and click Load",
      dialogLabel:"Select the models to be deployed",
      sendButtonLabel:"Deploy",
      idDiv:"sendSystemModels-dialog",
      loader:"sendingSystemModels-loader",
      deploy: false,
      download: false,
      compositions:[],
      compoSelectedToDeploy:[],
      userID:"",
      idPSM:"",
    };
    this.modeler=this.props.modeler;
    this.compositionsUrl="http://pedvalar.webs.upv.es/microservices/systems/{systemID}/compositions";
    this.deploymentURL="http://pedvalar.webs.upv.es/microservices/deployment";

    this.checkAndSend=this.checkAndSend.bind(this);
    this.error=this.error.bind(this);
    this.success=this.success.bind(this);
    this.addCompoToSend=this.addCompoToSend.bind(this);
    this.loadCompos=this.loadCompos.bind(this);
    this.userIdHandler=this.userIdHandler.bind(this);
    this.idPSMHandler=this.idPSMHandler.bind(this);
    this.sendBPMNModels=this.sendBPMNModels.bind(this);

    this.floWarePSM=new FloWarePSM(this.modeler);

    window.sendSystemModels=this;
  }

  show(){
    this.loadCompos();
    $("#"+this.state.idDiv).modal();
  }

  success(data){
    document.getElementById(this.state.loader).style.display = "none";
    $("#sendComposition-dialog").modal('hide');

    var nasatlx="http://pedvalar.webs.upv.es/iot-enhanced-bp-modeller/v1/nasatlx/nasatlx.html";
    var aLink="<a href='"+nasatlx+"' onclick='window.open(this.href,\"targetWindow\",\"toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500,height=700\"); return false;' data-dismiss='modal'>";

    if(data=="1"){
      showMessage("Congratulations","The BPMN model has been successfully saved in the server","Close"); //<br>Please, fill in the following "+aLink+"evaluation form</a>
    }else{
      var deployment=JSON.parse(data);
      if(deployment.key!=null){
        showMessage("Congratulations","The BPMN model has been saved in the server and deployed into the BPMN engine","Close")
      }else{
        showMessage("Attention","The BPMN model has been successfully saved in the server but some problem occured when deploying it into the BPMN engine","Close")
      }
    }
  }

  error(err){
      document.getElementById(this.state.loader).style.display = "none";
      $("#sendComposition-dialog").modal('hide');
      console.log(err);
      showMessage("Error","Some error occurs when sending the BPMN model");
  }

  sendBPMNModels(success, modelsWithoutPSM, error){
     var _this=this;
     const regex = /(<camunda:field name="microservice")/ig;
     let models=modelsWithoutPSM.map(function(model, index){
          return model.replaceAll(regex,'<camunda:field name="system" stringValue="'+localStorage.getItem("selectedSystem")+'"/>\n\t\t\t<camunda:field name="psm" stringValue="'+_this.state.idPSM+'"/>\n\t\t\t$1');
      });

      if(!success){
        document.getElementById(this.state.loader).style.display = "none";
        showMessage("Error","<br><span style='font-size:larger'>"+error+"<span><br><br><br>");
      }else{
        $("#"+this.state.idDiv).modal('hide');
        this.floWarePSM.sendPSM(models, this.state.idPSM, this.state.compoSelectedToDeploy);
        if(this.state.deploy){
         
          var deployments = models.map(function(model, index){
                    return fetch(_this.deploymentURL,{
                              method:'POST',
                              body: JSON.stringify({"id":_this.state.idPSM+index,"bpmn":model})
                            })
                            .then(function (response) {
                                    return response.text()
                            })
          });

          // Resolve all the deployments
          Promise.all(deployments)
            .then((results) => {
                console.log(results);
          }).catch(function(err) {
              console.log(err);
          })

        }

        if(this.state.download){
          let zip = new JSZip();
          models.forEach(function(model, index){
              zip.file(_this.state.idPSM+index+".bpmn", model);
          });

          zip.generateAsync({type: "blob"}).then(function(content) {
             FileSaver.saveAs(content, _this.state.idPSM+".zip");
          });
        }
        document.getElementById(this.state.loader).style.display = "none";
      }
      
  }

  checkAndSend(){
      var url=localStorage.getItem("managerUrl")+(localStorage.getItem("managerUrl").charAt(localStorage.getItem("managerUrl").length-1)=="/"?"":"/");

      if(this.state.idPSM.trim().length==0){
        showMessage("Error","<br><span style='font-size:larger'>You must define a PSM ID.<span><br><br><br>");
      }else if(this.state.compoSelectedToDeploy.length==0){
        showMessage("Error","<br><span style='font-size:larger'>You must select at least one BPMN model to be deployed<span><br><br><br>");
      }else{
        document.getElementById(this.state.loader).style.display = "inline";
        
        var requests = this.state.compoSelectedToDeploy.map(function(compo){
                    return fetch(url+"compositions/"+compo.user+"/"+compo.id)
                      .then(function (response) {
                        return response.text();
                      })
        });

        // Resolve all the promises
        Promise.all(requests)
          .then((results) => {
              this.floWarePSM.checkPIMrestrictions(results, this.sendBPMNModels);
          }).catch(function(err) {
            console.log(err);
          })

      }

  }

  addCompoToSend(event){
      
      var compositions=this.state.compoSelectedToDeploy;

      if(event.target.checked){
          compositions.push({
            id:event.target.id,
            user:event.target.name
          });
      }else{
          const index = compositions.findIndex(function(element){return element.id==event.target.id;});
          if (index > -1) { 
            compositions.splice(index, 1); 
          }
      }
      this.setState({compoSelectedToDeploy: compositions});
     
  }

  loadCompos(){
      /*var user=this.state.userID;
      if(this.state.userID.length==0){
        this.setState({userID: "default"});
        user="default";
      }*/
      var url=this.compositionsUrl.replace("{systemID}",localStorage.getItem("selectedSystem"));
      //url=url.replace("{userID}",user);
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(compositions => {
           this.setState({compositions:compositions});
        })
        .catch(error => {
            console.log(error);
        }) 
  }

  userIdHandler(event){
    this.setState({"userID":event.target.value, "compoSelectedToDeploy": []});
  }

  idPSMHandler(event){
      this.setState({"idPSM":event.target.value});
  }

  enableDeployment(event){
    if(event.target.checked){
        this.setState({deploy:true});
     }else{
       this.setState({deploy:false});
     }
  }

  enableDownload(event){
    if(event.target.checked){
        this.setState({download:true});
     }else{
       this.setState({download:false});
     }
  }

  render(){
    var titleStyle={
      fontSize:18,
      fontWeight:'bold'
    };

    var models="";
    if(this.state.compositions!=null && this.state.compositions.length>0){
        models=this.state.compositions.map(compo => 
          <div key={compo.id+"_"+compo.user+"_Key"} className="form-check form-switch">
            <input className="form-check-input" type="checkbox" id={compo.id} name={compo.user} onChange={ (event) => {this.addCompoToSend(event)} } />
            <label className="form-check-label" htmlFor={compo.id}>{compo.id} (by {compo.user}) <a href="#" onClick={loadComposition.bind(this,compo)}>[show]</a></label>
          </div>
        );
    }

    return(
      <div className="modal" tabIndex="-1" role="dialog" id={this.state.idDiv}>
        <div className="modal-dialog" role="document">
          <div className="loader_container" id={this.state.loader}>
              <div className="lds-hourglass"></div>
          </div>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.state.title}</h5>
            </div>
            <div className="modal-body">
                {/*<div style={titleStyle}>{this.state.userLabel}</div>
                <div className="input-group mb-3">
                  <input type="text" className="form-control" value={this.state.userID} onChange={this.userIdHandler} placeholder="default"/>
                  <div className="input-group-append">
                    <button className="btn btn-outline-primary" type="button" onClick={this.loadCompos}>Load</button>
                  </div>
                </div>*/}
                <div className="form-group">
                  <label htmlFor="compositionId">PSM ID</label>
                  <input type="text" className="form-control" id="psmId" value={this.state.idPSM} onChange={this.idPSMHandler}/>
                  <div style={titleStyle}>{this.state.dialogLabel}</div>
                  {models}
                  
                </div>
            </div>
            <div className="modal-footer">
              <div className="row">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="deployModels" onChange={ (event) => {this.enableDeployment(event)} } />
                    <label className="form-check-label" htmlFor="deployModels">Deploy models into the BPMN engine</label>
                  </div>
                   <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="downloadModels" onChange={ (event) => {this.enableDownload(event)} } />
                    <label className="form-check-label" htmlFor="downloadModels">Download BPMN models</label>
                  </div>
              </div>
              <div className="row">
                  <button type="button" className="btn btn-primary" onClick={this.checkAndSend} id="compositionActionBtn">{this.state.sendButtonLabel}</button>
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

}