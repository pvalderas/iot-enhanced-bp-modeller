import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import {showOverlay} from '../overlay/Overlay.js'
import './loader.css';


export var showInstanceDialog = function(){
   window.instanceDialog.show();
};

export var hideInstanceDialog = function(){
    window.instanceDialog.hide();
};

export default class InstanceDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      instances: [],
      error:null,
      type:"modal",
      title:"Running Instances",
      id:"instancesDialog",
      loader:"instancesSystemLoader",
      activities:null
    };

    this.modeler=this.props.modeler;
    this.modeling= this.modeler.get('modeling');
    this.elementRegistry= this.modeler.get('elementRegistry');
    this.bpmServerURL="https://pedvalar.webs.upv.es/microservices/instances/running/";

    window.instanceDialog=this;

    this.loadInstances=this.loadInstances.bind(this);
    this.showInstance=this.showInstance.bind(this);
    this.cleanInstance=this.cleanInstance.bind(this);
    this.drawSequenceFlows=this.drawSequenceFlows.bind(this);
    this.drawMessageFlows=this.drawMessageFlows.bind(this);
  }

  show(){
      this.loadInstances();
      $("#"+this.state.id).modal('show');
  }

  hide(){
     //document.getElementById(this.state.id).style.display = "none";
      $("#"+this.state.id).modal('hide');
  }

  cleanInstance(){
    let _this=this;
    this.state.activities.forEach(function(activity){
      let element=_this.elementRegistry.get(activity.activityId);
      _this.modeling.setColor(element, {
          stroke: 'black'
      });
    });

    let definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;

    definitions.rootElements.forEach(function(element){
        if (element.$type=="bpmn:Collaboration"){
            element.messageFlows.forEach(function(node){
              if (node.$type=="bpmn:MessageFlow"){
                  _this.modeling.setColor(_this.elementRegistry.get(node.id), {
                    stroke: 'black'
                  });
              }
          });
        }
        if (element.$type=="bpmn:Process"){
          element.flowElements.forEach(function(node){
              if (node.$type=="bpmn:SequenceFlow"){
                  _this.modeling.setColor(_this.elementRegistry.get(node.id), {
                    stroke: 'black'
                  });
              }
          });
        }
    });

  }


  loadInstances() {
      document.getElementById(this.state.loader).style.display = "block";

      //let url=this.bpmServerURL+"history/process-instance?processDefinitionId="+sessionStorage.getItem("processId");
      let url=this.bpmServerURL+sessionStorage.getItem("processId");
     
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(instances => {
            this.setState({ instances: instances })
             document.getElementById(this.state.loader).style.display = "none";
        })
        .catch(error => {
            this.setState({error:error});
            console.log(error);
            console.log(url);
            document.getElementById(this.state.loader).style.display = "none";
          }
        )   
  }

  drawMessageFlows(activitiesIds, lastActivities){
    let definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
    let flows=[];
    let _this=this;
    definitions.rootElements.forEach(function(element){
        if (element.$type=="bpmn:Collaboration"){
            element.messageFlows.forEach(function(node){
              if (node.$type=="bpmn:MessageFlow"){
                  if((activitiesIds.includes(node.sourceRef.id) || node.sourceRef.name=="PHYSICAL WORLD") && 
                     (activitiesIds.includes(node.targetRef.id) && !lastActivities.includes(node.targetRef.id))){
                          _this.modeling.setColor(_this.elementRegistry.get(node.id), {
                            stroke: 'red'
                          });
                  }
              }
          });
        }
    });
  }

  drawSequenceFlows(activitiesIds){
    const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
    const modeling= this.modeler.get('modeling');
    const elementRegistry= this.modeler.get('elementRegistry');

    let flows=[];
    definitions.rootElements.forEach(function(element){
        if (element.$type=="bpmn:Process"){
          element.flowElements.forEach(function(node){
              if (node.$type=="bpmn:SequenceFlow"){
                  if(activitiesIds.includes(node.sourceRef.id) && activitiesIds.includes(node.targetRef.id)){
                    modeling.setColor(elementRegistry.get(node.id), {
                      stroke: 'red'
                    });
                  }
              }
          });
        }
    });
  }

  showInstance(id){
      //var url=this.bpmServerURL+"history/activity-instance?processInstanceId="+id;

      let url=this.bpmServerURL+"id/"+id;
    
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(activities => {
            const modeling= this.modeler.get('modeling');
            const elementRegistry= this.modeler.get('elementRegistry');
            let activitiesIds=[];
            let lastActivities=[];

            activities.forEach(function(activity){
              if(activity.endTime==null) lastActivities.push(activity.activityId);
              activitiesIds.push(activity.activityId);
              let element=elementRegistry.get(activity.activityId);
              modeling.setColor(element, {
                  stroke: 'red'
              });

            });

            this.drawSequenceFlows(activitiesIds);
            this.drawMessageFlows(activitiesIds, lastActivities);

            showOverlay(this.cleanInstance, id);
            this.hide();
            this.setState({activities:activities});
        })
        .catch(error => {
            this.setState({error:error});
            console.log(error);
          }
        )   
   
  }



  render(){
  	 var content;
  	 if(this.state.error==null) {
	  		const instances = this.state.instances.map(instance =>{
            console.log(instance);
            return <li className="list-group-item" key={instance.id}><a href="#" onClick={this.showInstance.bind(this,instance.id)} >{"["+instance.startTime+"] "+instance.id}</a></li>;
        });
        
        if(instances.length==0)
         content="There are no running instances available.";
        else
	  		 content=<ul className="list-group">{instances}</ul>;
  	 }else{
  			content="The BPMN server cannot be accessed or an error has occurred";
  	 }


  	return(
      <div className="modal" tabIndex="-1" role="dialog" id={this.state.id}>
        <div className="modal-dialog" role="document">
          <div className="loader_container" id={this.state.loader}>
              <div className="lds-hourglass"></div>
          </div>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{this.state.title}</h5>
            </div>
            <div className="modal-body">
                  {content}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

}