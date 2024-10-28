import ReactDOM from 'react-dom';
import React from 'react';
import './UploadDialog.css';
import { systemReload } from './ConfigDialog.js';
import { showMessage } from './MessageDialog.js';

import './loader.css';

export var showWoTDialog = function(){
  wotDialog.showDialog();
};

export default class WoTDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state={
      systemName:""
    }

    this.id="wot-composition-dialog";
    this.loader="wot-loader";
    this.title="Select WoT files";

    this.url="https://pedvalar.webs.upv.es/microservicesEmu/wot/insertWoTDescription.php";

    this.createSystem=this.createSystem.bind(this);
    this.close=this.close.bind(this);
    this.fileHandler=this.fileHandler.bind(this);
    this.sendWoTSystem=this.sendWoTSystem.bind(this);
    this.systemNameHandler=this.systemNameHandler.bind(this);

    window.wotDialog=this;

    this.files=[];
  }

  showDialog(){
    $("#wot-composition-dialog").modal();
  }


  close(){
    document.getElementById(this.loader).style.display = "none";
    $("#"+this.id).modal('hide');
  }

  systemNameHandler(event){
    this.setState({"systemName":event.target.value})
  }

  fileHandler(file){

    let _this=this;
    
    for(let oneFile of file.target.files){
        let fileReader=new FileReader();
        
        fileReader.onloadend=function(e){
            _this.files.push(fileReader.result);
            console.log("***LEIDO***");
        }

        fileReader.readAsText(oneFile);
    }

  }

  createSystem(){
    for(let file of this.files){
      this.sendWoTSystem(file);
    }
    this.close();
   /* let name=this.state.systemName.trim();
    if(name.length==0){
      let fichero=this.fileReader.fileName;
      name=fichero.substring(0,fichero.lastIndexOf("."));
    }
    
    if(!this.fileReader.result.includes("ontologyIRI=\"https://w3id.org/saref\"")){
      showMessage("Error","The selected file does not contain a WoT description");
    }else{
      document.getElementById(this.loader).style.display = "inline";
      this.sendWoTSystem(this.fileReader.result, name);
      this.close();
    }*/
  }


sendWoTSystem(wotDescription){
    fetch(this.url,
          {
            method:"POST",
            body: wotDescription
          }
    )
    .then(function (response) {
        return response.json();
    })
    .then(result => {
      console.log(result);
        
        if(result.code==1){
          systemReload(result.systemID);
          //showMessage("Attention",result.message+".<br> You can now associate IoT devices to BPMN Lanes");
          //showMessage("Attention","IoT System created correctly.<br> You can now associate IoT devices to BPMN Lanes");

        console.log(result.message);
        }else if(result.code==-1){
           showMessage("Error",result.message);
        }else{
          showMessage("Error","An error occurred while creating the IoT system. Please contact the person responsible for this tool.");
          console.log(result);
        }

    })
    .catch(error => {
        showMessage("Error","An error occurred while parsing the WoT descriptions. Please contact the person responsible for this tool.");
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
                      <div className="form-group files">
                        <input type="file" className="form-control" onChange={this.fileHandler} multiple/>
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