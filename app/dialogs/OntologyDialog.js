import ReactDOM from 'react-dom';
import React from 'react';
import './UploadDialog.css';
import { systemReload } from './ConfigDialog.js';
import { showMessage } from './MessageDialog.js';

import './loader.css';

export var showOntologyDialog = function(){
  ontologyDialog.showDialog();
};

export default class OntologyDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state={
      systemName:"",
      ontologyType:"saref",
    }

    this.id="ontology-composition-dialog";
    this.loader="ontology-loader";
    this.title="Select an OWL Ontology";

    this.fileReader=new FileReader();

    this.url="https://pedvalar.webs.upv.es/microservicesEmu/ontologySystems/insertOntologySystem.php";

    this.fileRead=this.fileRead.bind(this);
    this.createSystem=this.createSystem.bind(this);
    this.close=this.close.bind(this);
    this.fileHandler=this.fileHandler.bind(this);
    this.sendOntologySystem=this.sendOntologySystem.bind(this);
    this.systemNameHandler=this.systemNameHandler.bind(this);
    this.ontologyTypeHandler=this.ontologyTypeHandler.bind(this);

    window.ontologyDialog=this;
  }

  showDialog(){
    $("#ontology-composition-dialog").modal();
  }

  fileRead(e){
    
  }

  close(){
    document.getElementById(this.loader).style.display = "none";
    $("#"+this.id).modal('hide');
  }

  systemNameHandler(event){
    this.setState({"systemName":event.target.value})
  }

  ontologyTypeHandler(event){
    this.setState({"ontologyType":event.target.value})
  }

  fileHandler(file){
    this.fileReader.onloadend=this.fileRead;
    this.fileReader.fileName=file.target.files[0].name
    this.fileReader.readAsText(file.target.files[0]);
  }

  createSystem(){
    let name=this.state.systemName.trim();
    if(name.length==0){
      let fichero=this.fileReader.fileName;
      name=fichero.substring(0,fichero.lastIndexOf("."));
    }
    
    if(this.state.ontologyType=="saref" && !this.fileReader.result.includes("ontologyIRI=\"https://w3id.org/saref\"")){
      showMessage("Error","The selected file does not contain a SAREF ontology");
    }else if(this.state.ontologyType=="sosa" && !this.fileReader.result.includes("ontologyIRI=\"http://www.w3.org/ns/sosa/\"")){
      showMessage("Error","The selected file does not contain a SOSA ontology");
    }else{
      document.getElementById(this.loader).style.display = "inline";
      this.sendOntologySystem(this.fileReader.result, name);
      this.close();
    }
  }


sendOntologySystem(onto, name){
    fetch(this.url,
          {
            method:"POST",
            body: JSON.stringify( {
              ontology:onto,
              name: name,
              type: this.state.ontologyType
            })
          }

      ).then(function (response) {
                return response.json();
              })
              .then(result => {
                  
                  if(result.code==1){
                    systemReload(result.systemID);
                    showMessage("Attention",result.message+".<br> You can now associate IoT devices to BPMN Lanes");
                    //showMessage("Attention","IoT System created correctly.<br> You can now associate IoT devices to BPMN Lanes");
                  }else if(result.code==-1){
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
                      <div className="form-group mb-3">
                        <label forhtml="systemName" className="form-label">System Name</label>
                        <input id="systemName" type="text" className="form-control" value={this.state.systemName} onChange={this.systemNameHandler} placeholder="System Name"/>
                      </div>
                      <div className="form-group mb-3">
                        <label forhtml="ontologyType" className="form-label">Ontology Type</label>
                        <select id="ontologyType" className="form-control form-select" value={this.state.ontologyTpe} onChange={this.ontologyTypeHandler}>
                          <option value="saref">SAREF</option>
                          <option value="sosa">SOSA</option>
                        </select>
                      </div>
                      <div className="form-group files">
                        <input type="file" className="form-control" onChange={this.fileHandler}/>
                      </div>
                      <div className="input-group mb-3">
                          <button className="btn btn-outline-primary" type="button" onClick={this.createSystem}>Create</button>
                      </div>
                </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

}