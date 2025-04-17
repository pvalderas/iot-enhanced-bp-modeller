import React, { Component } from 'react';
import MenuOption from './MenuOption.js';
import defaultExample from '../DistributionCenter.bpmn';
import newModel from '../NewModel.bpmn';
import BPMN2Java from '../bpmn/BPMN2Java.js';
import BPMN2DTDL from '../bpmn/BPMN2DTDL.js';
import FloWarePSM from '../floWare/FloWarePSM.js';
import {showConfig,defaultExampleConfig} from '../dialogs/ConfigDialog.js';
import {showDownloadDialog} from '../dialogs/DownloadDialog.js';
import {showUploadDialog} from '../dialogs/UploadDialog.js';
import {showRemoteDialog} from '../dialogs/RemoteDialog.js';
import {showFloWareDialog} from '../dialogs/FloWareDialog.js';
import {showOntologyDialog} from '../dialogs/OntologyDialog.js';
import {showSendSystemModelsDialog} from '../dialogs/SendSystemModelsDialog';
import {showInstanceDialog, hideInstanceDialog} from '../dialogs/InstanceDialog';


export var updateMenuRedLabel = function(){
    window.menu.updateMenuRedLabel();
};

export var updateMenuTitle = function(title){
    window.menu.updateMenuTitle(title);
};

export var newComposition = function(){
    window.menu.newComposition();
};

export default class Menu extends React.Component {

	constructor(props) {
		super(props);
		window.menu=this;
		
		this.modeler=this.props.modeler;
		
		this.bpmn2Java=new BPMN2Java(this.modeler);
		this.bpmn2DTDL=new BPMN2DTDL(this.props.modeler);
		this.floWarePSM=new FloWarePSM(this.modeler);
		this.bpmnManager=this.props.bpmnManager;

		this.state = {
			displayFloWare:localStorage.getItem("isFloWare")=="1"?true:false,
			displayOntology:localStorage.getItem("isOntology")=="1"?true:false,
			simulation:false,
			developmentType:"Top-Down",
			propertyPanel: false,
			processTitle:""
		}

		this.updateMenuRedLabel=this.updateMenuRedLabel.bind(this);
		this.newComposition=this.newComposition.bind(this);
		this.loadDefaultExample=this.loadDefaultExample.bind(this);
		this.generateJava=this.generateJava.bind(this);
		this.generateDTDL=this.generateDTDL.bind(this);
		this.startFloWarePSMDownload=this.startFloWarePSMDownload.bind(this);
		this.zoomin=this.zoomin.bind(this);
		this.zoomout=this.zoomout.bind(this);
		this.toggleSimulation=this.toggleSimulation.bind(this);
		this.toggleDevelopmentType=this.toggleDevelopmentType.bind(this);
		this.togglePropertyPanel=this.togglePropertyPanel.bind(this);
	}

	updateMenuRedLabel(){

		if(localStorage.getItem("isFloWare")=="1"){
				this.setState({displayFloWare: true});
		}else{
			this.setState({displayFloWare: false});
		}

		if(localStorage.getItem("isOntology")!="0"){
				this.setState({displayOntology: true});
		}else{
			this.setState({displayOntology: false});
		}
	}

	updateMenuTitle(title){
		this.setState({processTitle: title});
	}	

	newComposition(){
		this.modeler.importXML(newModel);
	}


	loadDefaultExample(){
		this.modeler.importXML(defaultExample);
		defaultExampleConfig();
	}

	generateJava(){
		if(this.bpmnManager.checkBPMN()){
			this.bpmn2Java.downloadJava();
		}
	}

	generateDTDL(){
		if(this.bpmnManager.checkBPMN()){
	        this.bpmn2DTDL.downloadDTDL();
	    }
	}

	generateAzure(){
		
	}

	startFloWarePSMDownload(){
		if(this.bpmnManager.checkBPMN()){
	        this.floWarePSM.downloadPSMFile();
	    }
	}

	showInstances(){
	     showInstanceDialog();
	}

	zoomin(){
		this.modeler.get('canvas').zoom(this.props.modeler.get('canvas').zoom()+0.1);
	}

	zoomout(){
		this.modeler.get('canvas').zoom(this.props.modeler.get('canvas').zoom()-0.1);
	}

	toggleSimulation(){
		
		/*var elementRegistry=this.props.modeler.get('elementRegistry');
		var startEvent=elementRegistry.filter(function (element) {
		    return is(element, 'bpmn:StartEvent');
		  })*/

		const simulationSupport = this.props.modeler.get('simulationSupport');
		const simulationTrace = this.props.modeler.get('simulationTrace');
		simulationSupport.toggleSimulation(!this.state.simulation);
		this.setState({simulation:!this.state.simulation})
		//simulationSupport.triggerElement(startEvent[0].id);

		simulationTrace._log=function(event){
			console.log(event);
		}

		simulationTrace.start();

		if(this.state.simulation) document.getElementById("bottom-view").style.display="flex";
		else document.getElementById("bottom-view").style.display="none";
	}

	toggleDevelopmentType(){

		if(this.state.developmentType=="Top-Down") this.setState({developmentType:"Bottom-Up"});
		else this.setState({developmentType:"Top-Down"});
	}

	togglePropertyPanel(){

		this.setState({propertyPanel:!this.state.propertyPanel});

		const propertiesPanel = this.props.modeler.get('propertiesPanel');
		if(this.state.propertyPanel){
			document.getElementById('right-property-panel-container').style.display='none';
            propertiesPanel.detach();
            document.getElementById('modeler-container').className="col-12";
		}else{
			document.getElementById('right-property-panel-container').style.display='block';
            propertiesPanel.attachTo('#right-property-panel-container');
            document.getElementById('modeler-container').className="col-10";
		}
	}

	render() {

		// File
		var fileOptions = [
					{id:"new",label:"New IoT-Enhanced BP",click:this.newComposition.bind(this, this.props.modeler)},
					{id:"separator"},
					{id:"loadLocal",label:"Load a BPMN File from Local",click:showUploadDialog},
					{id:"loadRemote",label:"Load a BPMN File from the Server",click:showRemoteDialog},
					//{id:"default",label:"Load Distribution Center Example",click:this.loadDefaultExample.bind(this, this.props.modeler)},
					{id:"separator"},
					{id:"java",label:"Download Java Templates",click:this.generateJava},
					{id:"download",label:"Download BPMN File",click:showDownloadDialog}
					
					//{id:"config",label:"Server Configuration",click:showConfig}
		];

		// System
		const systemOptions = [
			{id:"config",label:"Select an existing system",click:showConfig},
			{id:"floWare",label:"Create an IoT system from FloWare",click:showFloWareDialog},
			{id:"ontology",label:"Create an IoT system from an Ontology",click:showOntologyDialog}
		];


		// FloWare
		let menuFloWare="";
		let floWareOptions = null;
		if(this.state.displayFloWare){
			
			floWareOptions = [
					{id:"floWare",label:"Download FloWarePSM",click:this.startFloWarePSMDownload},
					{id:"separator"},
					{id:"config",label:"Deploy PSM and BPMN models",click:showSendSystemModelsDialog}
			];

			menuFloWare=<MenuOption label="FloWare" id="system" items={floWareOptions}/>;
		}

		// Digital Twin
		let labelSimulation=this.state.simulation?"Turn OFF Simulation":"Turn ON Simulation";
		const digitalTwinOptions=[
				{id:"dtdl",label:"Download DTDL Models",click:this.generateDTDL},
				{id:"azure",label:"Download Azure registration Java Code",click:this.generateAzure},
				{id:"separator"},
				{id:"simulator",label: labelSimulation,click:this.toggleSimulation}
		]

		if(sessionStorage.getItem("processId")!=null && sessionStorage.getItem("processId").length>=0){
			digitalTwinOptions.push({id:"separator"});
			digitalTwinOptions.push({id:"instances", label:"Running Instances", click:this.showInstances});
		}

		let digitalTwinMenu=<MenuOption label="Digital Twin" id="digitaltwin" items={digitalTwinOptions}/>;


		return(
			<div className="row">
				<div  id="navbarSupportedContent">
					<ul className="navbar-nav mr-auto">
					  <MenuOption label="File" id="file" items={fileOptions}/>
					  <MenuOption label="IoT System" id="system" items={systemOptions}/>
					  {menuFloWare}
					  {digitalTwinMenu}
					  <MenuOption label="+" id="zoominoption" click={this.zoomin}/>
					  <MenuOption label="-" id="zoomoutoption" click={this.zoomout}/>
					</ul>
					
				</div>
				<div id="floWareLabel" style={{position:"absolute", right:"20px",top:"5px", color:"red", display:this.state.displayFloWare?"inline":"none"}}>FloWare</div>
				<div id="ontologyLabel" style={{position:"absolute", right:"20px",top:"5px", color:"red", display:this.state.displayOntology?"inline":"none"}}>Ontology</div>
				<div id="showPropLink" style={{position:"absolute", right:"20px",top:"25px", color:"blue"}}><a href="#" onClick={this.togglePropertyPanel}>{this.state.propertyPanel?"Hide BPMN Property Panel":"Show BPMN Property Panel"}</a></div>
				
				<div id="processTitle" style={{position:"absolute", margin:"0 45%", top:"15px", color:"darkgrey"}}>{this.state.processTitle}</div>

				{/*<div id="DevelopmentIcon" style={{position:"absolute", right:"20px",color:"blue", display:this.state.displayFloWare==false?"inline":"none"}}>{this.state.developmentType}</div>*/}
			</div>
		);

  	}

}