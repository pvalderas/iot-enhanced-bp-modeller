import React from 'react';
import bpmn2Java from '../bpmn/BPMN2Java.js';
import {showDownloadDialog} from '../dialogs/DownloadDialog.js';
import './button.css';
import FloWarePSM from '../floWare/FloWarePSM.js';
import BPMN2DTDL from '../bpmn/BPMN2DTDL.js';

export var updateDownloadButtonFloWareOption = function(){
    window.downloadButton.updateFloWare();
};

export default class DownloadButton extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			displayFloWare:localStorage.getItem("isFloWare")=="1"?true:false
		}

		this.modeler=this.props.modeler;

		this.bpmn2Java=new bpmn2Java(this.props.modeler);
		this.floWarePSM=new FloWarePSM(this.props.modeler);
		this.bpmn2DTDL=new BPMN2DTDL(this.props.modeler);
		this.bpmnManager=this.props.bpmnManager;

		this.showDownloadDialog=this.showDownloadDialog.bind(this);
		this.startJavaDownload=this.startJavaDownload.bind(this);
		this.startFloWarePSMDownload=this.startFloWarePSMDownload.bind(this);
		this.startDTDLDownload=this.startDTDLDownload.bind(this);

		window.downloadButton=this;
	}

	updateFloWare(){

		if(localStorage.getItem("isFloWare")=="1"){
				this.setState({displayFloWare: true});
		}else{
			this.setState({displayFloWare: false});
		}
	}

	showDownloadDialog(){
		if(this.bpmnManager.checkBPMN()){
	        showDownloadDialog();
	    }
	}

	startJavaDownload(){
		if(this.bpmnManager.checkBPMN()){
	        this.bpmn2Java.downloadJava();
	    }
	}

	startFloWarePSMDownload(){
		if(this.bpmnManager.checkBPMN()){
	        this.floWarePSM.downloadPSMFile();
	    }
	}

	startDTDLDownload(){
		if(this.bpmnManager.checkBPMN()){
	        this.bpmn2DTDL.downloadDTDL();
	    }
	}


	render() {
		var floWareOption="";
		/*if(this.state.displayFloWare)
			 floWareOption=<a className="dropdown-item " href="#" onClick={this.startFloWarePSMDownload}>FloWare PSM</a>;
		*/
  		return(
  			<div className="btn-group dropup">
			  <button type="button" className="btn btn-primary property_panel_button dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
			    Download
			  </button>
			  <div className="dropdown-menu">
			  	{floWareOption}
			    <a className="dropdown-item " href="#" onClick={this.startJavaDownload}>Java Template</a>
			    <a className="dropdown-item " href="#" onClick={this.showDownloadDialog}>BPMN Model</a>
			    <a className="dropdown-item " href="#" onClick={this.startDTDLDownload}>DTDL</a>
			  </div>
			</div>
  		);
	}

}