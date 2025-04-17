import React from 'react';
import './button.css'
import { showSendDialog } from '../dialogs/SendCompositionDialog';

import FloWarePSM from '../floWare/FloWarePSM.js';

export var updateSendButtonFloWareOption = function(){
    window.sendButton.updateFloWare();
};

export default class SendButton extends React.Component {

	constructor(props) {
		super(props);
		this.modeler=this.props.modeler;
		this.bpmnManager=this.props.bpmnManager;
		this.floWarePSM=new FloWarePSM(this.modeler);

		this.state = {
			displayFloWare:localStorage.getItem("isFloWare")=="1"?true:false
		}

		this.showSendCompositionDialog=this.showSendCompositionDialog.bind(this);

		window.sendButton=this;
	}

	showSendCompositionDialog(){
		if(this.bpmnManager.checkBPMN()){
			showSendDialog();
	    }
	}

	updateFloWare(){
		if(localStorage.getItem("isFloWare")=="1"){
				this.setState({displayFloWare: true});
		}else{
			this.setState({displayFloWare: false});
		}
	}

	sendPSM(){
		if(this.bpmnManager.checkBPMN()){
	        this.floWarePSM.sendPSMFile();
	    }
	}


	render() {
		var floWareOptions=[];
		/*if(this.state.displayFloWare)
	  		return(
	  			<div className="btn-group dropup">
				  <button type="button" className="btn btn-primary property_panel_button dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				    Send to Server
				  </button>
				  <div className="dropdown-menu">
				  	<a key="sendpsm" className="dropdown-item " href="#" onClick={this.sendFloWarePSM}>FloWare PSM</a>
				    <a key="sendcurrent" className="dropdown-item " href="#" onClick={this.showSendCompositionDialog}>Send Current Model</a>
				  </div>
				</div>
	  		);
	  	else*/
	  		return(
  				<button onClick={this.showSendCompositionDialog} className="btn btn-primary property_panel_button">Send to Server</button>
  			);
	}

}