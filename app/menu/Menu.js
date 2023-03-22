import React, { Component } from 'react';
import MenuOption from './MenuOption.js';
import defaultExample from '../DistributionCenter.bpmn';
import newModel from '../NewModel.bpmn';
import BPMN2Java from '../bpmn/BPMN2Java.js';
import FloWarePSM from '../floWare/FloWarePSM.js';
import {showConfig,defaultExampleConfig} from '../dialogs/ConfigDialog.js';
import {showDownloadDialog} from '../dialogs/DownloadDialog.js';
import {showUploadDialog} from '../dialogs/UploadDialog.js';
import {showRemoteDialog} from '../dialogs/RemoteDialog.js';
import {showFloWareDialog} from '../dialogs/FloWareDialog.js';
import {showSendSystemModelsDialog} from '../dialogs/SendSystemModelsDialog';
import {showInstanceDialog, hideInstanceDialog} from '../dialogs/InstanceDialog';
import { is } from "bpmn-js/lib/util/ModelUtil";


export var updateMenuFloWareOption = function(){
    window.menu.updateFloWare();
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
		this.floWarePSM=new FloWarePSM(this.modeler);
		this.bpmnManager=this.props.bpmnManager;

		this.state = {
			displayFloWare:localStorage.getItem("isFloWare")=="1"?true:false,
			simulation:false,
			developmentType:"Top-Down",
			propertyPanel: false
		}

		this.updateFloWare=this.updateFloWare.bind(this);
		this.newComposition=this.newComposition.bind(this);
		this.loadDefaultExample=this.loadDefaultExample.bind(this);
		this.generateJava=this.generateJava.bind(this);
		this.startFloWarePSMDownload=this.startFloWarePSMDownload.bind(this);
		this.zoomin=this.zoomin.bind(this);
		this.zoomout=this.zoomout.bind(this);
		this.toggleSimulation=this.toggleSimulation.bind(this);
		this.toggleDevelopmentType=this.toggleDevelopmentType.bind(this);
		this.togglePropertyPanel=this.togglePropertyPanel.bind(this);
	}

	updateFloWare(){

		if(localStorage.getItem("isFloWare")=="1"){
				this.setState({displayFloWare: true});
		}else{
			this.setState({displayFloWare: false});
		}
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
		simulationSupport.toggleSimulation(!this.state.simulation);
		this.setState({simulation:!this.state.simulation})
		//simulationSupport.triggerElement(startEvent[0].id);

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

		var subOptions = [
					{id:"new",label:"New Composition",click:this.newComposition.bind(this, this.props.modeler)},
					{id:"separator"},
					{id:"loadLocal",label:"Load a BPMN File from Local",click:showUploadDialog},
					{id:"loadRemote",label:"Load a BPMN File from the Server",click:showRemoteDialog},
					//{id:"default",label:"Load Distribution Center Example",click:this.loadDefaultExample.bind(this, this.props.modeler)},
					{id:"separator"},
					{id:"java",label:"Download Java Templates",click:this.generateJava},
					{id:"download",label:"Download BPMN File",click:showDownloadDialog},
					{id:"dtdl",label:"Download DTDL Models",click:this.generateDTDL}
					//{id:"config",label:"Server Configuration",click:showConfig}
		];

		// FloWare
		let menuFloWare="";
		let floWareOptions = null;
		if(this.state.displayFloWare){
			subOptions.push({id:"floWare",label:"Download FloWarePSM",click:this.startFloWarePSMDownload});
			
			floWareOptions = [
					{id:"config",label:"Deploy PSM and BPMN models",click:showSendSystemModelsDialog}
			];

			menuFloWare=<MenuOption label="FloWare Server" id="system" items={floWareOptions}/>;
		}


		// Simulator and Development Type
		subOptions.push({id:"separator"});
		var label=this.state.simulation?"Turn OFF Simulation":"Turn ON Simulation";
		subOptions.push({id:"simulator",label: label,click:this.toggleSimulation});

		//if(this.state.displayFloWare==false)
		//	subOptions.push({id:"devType",label: "Change Development Type",click:this.toggleDevelopmentType});


		// System Menu
		const systemOptions = [
					{id:"config",label:"Select an existing system",click:showConfig},
					{id:"floWare",label:"Create an IoT system FloWare",click:showFloWareDialog}
		];
		const systemMenu=<MenuOption label="IoT System" id="system" items={systemOptions}/>;


		//Instances
		let instanceMenu="";
		if(sessionStorage.getItem("processId")!=null && sessionStorage.getItem("processId").length>=0){
			instanceMenu=<MenuOption label="Running Instances" id="instances" click={this.showInstances}/>;
		}


		return(
			<div className="row">
				<div  id="navbarSupportedContent">
					<ul className="navbar-nav mr-auto">
					  <MenuOption label="File" id="file" items={subOptions}/>
					  {systemMenu}
					  {menuFloWare}
					  {instanceMenu}
					  <MenuOption label="+" id="zoominoption" click={this.zoomin}/>
					  <MenuOption label="-" id="zoomoutoption" click={this.zoomout}/>
					</ul>
					
				</div>
				<div id="floWareIcon" style={{position:"absolute", right:"20px",top:"5px", color:"red", display:this.state.displayFloWare?"inline":"none"}}>FloWare</div>
				<div id="floWareIcon" style={{position:"absolute", right:"20px",top:"25px", color:"blue"}}><a href="#" onClick={this.togglePropertyPanel}>{this.state.propertyPanel?"Hide Property Panel":"Show Property Panel"}</a></div>
				
				{/*<div id="DevelopmentIcon" style={{position:"absolute", right:"20px",color:"blue", display:this.state.displayFloWare==false?"inline":"none"}}>{this.state.developmentType}</div>*/}
			</div>
		);

  	}

}