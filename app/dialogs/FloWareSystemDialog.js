import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import './loader.css';


export var showSystemDialog = function(){
   window.systemDialog.show();
};

export var hideSystemDialog = function(){
    window.systemDialog.hide();
};

export default class FloWareSystemDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      systems: [],
      error:null,
      type:"floWareSystemList",
      title:"FloWare Systems",
      id:"floWareSystemDialog",
      loader:"floWareSystemLoader"
    };

    this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
    this.serviceServerType=localStorage.getItem("serviceServerType");

    window.systemDialog=this;

    this.loadSystems=this.loadSystems.bind(this);
  }

  show(){
      this.loadSystems();
      document.querySelector('#'+this.state.id).style.display = "block";
  }

  hide(){
     document.querySelector('#'+this.state.id).style.display = "none";
  }


  loadSystems() {
    this.serviceServerUrl=localStorage.getItem("serviceServerUrl");
    this.serviceServerType=localStorage.getItem("serviceServerType");
      document.querySelector('#'+this.state.loader).style.display = "block";

      var url=this.serviceServerUrl+(this.serviceServerUrl.charAt(this.serviceServerUrl.length-1)=="/"?"":"/")+"system/floware/"+localStorage.getItem("selectedSystem")+"/subsystems";
      fetch(url)
        .then(function (response) {
          return response.json();
        })
        .then(systems => {
            //sessionStorage.setItem("subsystems",JSON.stringify(systems));
            this.setState({ systems: systems })
        })
        .catch(error => {
            this.setState({error:error});
          }
        )   
  }

  addSystem(name){
    const modeler=this.props.modeler;

    var element=document.querySelector('#propertyValue');
    element.value=name;
 
    var selectedElement = modeler.get('selection').get()[0];

    const modeling = modeler.get('modeling');
    modeling.updateLabel(selectedElement, name);

    console.log(selectedElement);
    selectedElement.businessObject.processRef.id=name.replaceAll(" ","")+"Process_"+Date.now();
    
    $("#"+this.state.id).css("display","none");
  }

  componentDidUpdate(){
    document.querySelector('#'+this.state.loader).style.display = "none";
  }


  render(){

  	 var content;
  	 if(this.state.error==null) {
	  		let systems = this.state.systems.map(system =>{
          if(system!="Software Systems")
            return <li className="list-group-item" key={system+"LI"}><a href="#" onClick={this.addSystem.bind(this,system)} >{system}</a></li>;
        });
        
        systems.push(<li className="list-group-item" key="SoftwareSystemLI"><a href="#" onClick={this.addSystem.bind(this,"Software Systems")} >[Software Systems]</a></li>);
	  		content=<ul className="list-group">{systems}</ul>;
  	 }else{
  			content=this.state.error;
  	 }

  	return (
  		<Dialog type={this.state.type} title={this.state.title} id={this.state.id} loader={this.state.loader} content={content} />
  	);
  }

}