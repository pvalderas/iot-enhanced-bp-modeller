import ReactDOM from 'react-dom';
import React from 'react';
import { showMessage } from '../dialogs/MessageDialog';


export var showSendDialog = function(){
    window.sendDialog.show();
};

export var updateSendDialogFloWareOption = function(){
    window.sendDialog.updateFloWare();
};

export default class SendCompositionDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      type:"modal",
      title:"Saving an IoT-Enhanced BP",
      idLabel:"Introduces an ID for the IoT-Enhanced BP and your user",
      idPlaceHolder:"IoT-Enhanced BP ID",
      userPlaceHolder:"User ID",
      meaningLabel:"Give a meaning for each event of the Physical World",
      sendButtonLabel:"Save",
      idDiv:"sendComposition-dialog",
      loader:"sending-loader",
      idCompo:"",
      idUser:"",
      events:null,
      deploy: false,
      isFloWare:localStorage.getItem("isFloWare")=="1"?true:false
    };


    this.sendComposition=this.sendComposition.bind(this);
    this.error=this.error.bind(this);
    this.success=this.success.bind(this);
    this.changeDescription=this.changeDescription.bind(this);
    this.idCompoHandler=this.idCompoHandler.bind(this);
    this.idUserHandler=this.idUserHandler.bind(this);
    this.enableDeployment=this.enableDeployment.bind(this);

    window.sendDialog=this;

  }

  updateFloWare(){
    if(localStorage.getItem("isFloWare")=="1"){
        this.setState({isFloWare: true});
    }else{
      this.setState({isFloWare: false});
    }
  }

  enableDeployment(event){
       if(event.target.checked){
          this.setState({deploy:true});
       }else{
         this.setState({deploy:false});
       }
  }


  show(){
    //this.setState({idCompo: this.props.bpmnManager.getProcessID()});
    this.getEvents();
    $("#"+this.state.idDiv).modal();
  }

  success(data){
    document.getElementById(this.state.loader).style.display = "none";
    $("#sendComposition-dialog").modal('hide');

    var nasatlx="http://pedvalar.webs.upv.es/iot-enhanced-bp-modeller/nasatlx/nasatlx.html";
    var aLink="<a href='"+nasatlx+"' onclick='window.open(this.href,\"targetWindow\",\"toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=500,height=700\"); return false;' data-dismiss='modal'>";

    console.log(data);
    if(data=="1"){
      showMessage("Congratulations","The BPMN model has been successfully saved in the server <br>Please, fill in the following "+aLink+"evaluation form</a>","Close"); //<br>Please, fill in the following "+aLink+"evaluation form</a>
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

  getEvents(){
   var highLevelEvents=this.props.bpmnManager.getEvents(); 
   this.setState({events:highLevelEvents});
  }

  changeDescription(ev){
    const events=this.state.events.map(event => {
        if(event.name+"Meaning"==ev.target.id){
          return {
            "name":event.name,
            "description":ev.target.value
          }
        }else{
          return event;
        }
    });
    this.setState({events:events});
  }

  idCompoHandler(event){
      this.setState({idCompo:event.target.value});
  }

  idUserHandler(event){
      this.setState({idUser:event.target.value});
  }

  sendComposition(){
        this.props.bpmnManager.sendBPMN(this.state.idCompo, this.state.idUser, this.success, this.error, this.state.events, this.state.deploy);
        document.getElementById(this.state.loader).style.display = "inline";
  }

  render(){
    var titleStyle={
      fontSize:18,
      fontWeight:'bold'
    };

    var eventInputs="",eventTitle="";
    if(this.state.events!=null && this.state.events.length>0){
        eventTitle=<div style={titleStyle}>{this.state.meaningLabel}</div>;
        eventInputs=this.state.events.map(event => 
          <div key={event.name.replaceAll(" ","")+"Meaning"}>
            <label htmlFor={event.name+"Meaning"}>{event.name}</label>
            <input type="text" className="form-control" id={event.name+"Meaning"} placeholder={event.name+" meaning"} value={event.description} onChange={this.changeDescription}/>
          </div>
        );
    }

    var deployOption;

    if(!this.state.isFloWare)
      deployOption=<div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" id="deploy" onChange={ (event) => {this.enableDeployment(event)} } />
                  <label className="form-check-label" htmlFor="deploy">Deploy the model into the BPMN engine </label><br/>
                </div>;

    return(
      <div className="modal" tabIndex="-1" role="dialog" id={this.state.idDiv}>
        <div className="modal-dialog" role="document">
          <div className="loader_container" id="sending-loader">
              <div className="lds-hourglass"></div>
          </div>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.state.title}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                {/*<div style={titleStyle}>{this.state.idLabel}</div>*/}
                <label htmlFor="compositionId">Process ID</label>
                <input type="text" className="form-control" id="compositionId" value={this.state.idCompo} onChange={this.idCompoHandler} placeholder={this.state.idPlaceHolder} />
                <label htmlFor="userId" style={{marginTop:"20px"}}>User</label>
                <input type="text" className="form-control" id="userId" value={this.state.idUser} onChange={this.idUserHandler} placeholder={this.state.userPlaceHolder}/>
                <br/>
                {deployOption}
                {/*eventTitle*/}
                {/*eventInputs*/} 
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={this.sendComposition} id="compositionActionBtn">{this.state.sendButtonLabel}</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

}