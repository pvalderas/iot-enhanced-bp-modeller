import React, { Component } from 'react';
import './ListDialog.css';

export default class Dialog extends React.Component {

  constructor(props) {
    super(props);
  }

  modalDialogWithOK(id, title, content){
  	let contentProps={
  		paddingTop:"25px",
  		paddingBottom:"25px"
  	}

  	return (
  		<div className="modal" tabIndex="-1" role="dialog" id={id}>
		    <div className="modal-dialog" role="document">
		      <div className="modal-content">
		        <div className="modal-header">
		          <h5 className="modal-title title">{title}</h5>
		          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
		            <span aria-hidden="true">&times;</span>
		          </button>
		        </div>
		        <div className="modal-body content" style={contentProps}>
		            {content}
		        </div>
		       <div className="modal-footer">
		        	<button type="button" className="btn btn-primary button" data-dismiss="modal">OK</button>
		       </div>
		      </div>
		    </div>
	 	</div>
  	);
  }

  modalDialog(id, title, content){
  	return (
  		<div className="modal" tabIndex="-1" role="dialog" id={id}>
		    <div className="modal-dialog" role="document">
		      <div className="modal-content">
		        <div className="modal-header">
		          <h5 className="modal-title title">{title}</h5>
		          <button type="button" className="close" data-dismiss="modal" aria-label="Close">
		            <span aria-hidden="true">&times;</span>
		          </button>
		        </div>
		        <div className="modal-body content">
		            {content}
		        </div>
		      </div>
		    </div>
	 	</div>
  	);
  }

  hide(id){
  	document.querySelector('#'+id).style.display = "none";
  }

  listDialog(id, title, content, loader){
  	let modalHeaderSticky ={
	  position: "sticky",
	  top: 0,
	  backgroundColor: "inherit",
	  zIndex: 1055
	}
  	return(
  		<div id={id} className="microservices-dialog">
	      <div className="loader_container" id={loader}>
	          <div className="lds-hourglass"></div>
	      </div>
	       <div className="modal-header" style={modalHeaderSticky}>
	        	<h5 className="modal-title">{title}</h5>
	        	<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.hide.bind(this,id)}>
	          		<span aria-hidden="true">&times;</span>
	        	</button>
	      </div>
	      {content}
	 	</div>
  	);
  }

  render(){

  	switch(this.props.type){
  		case "modal": return this.modalDialog(this.props.id, this.props.title, this.props.content);
  		case "modalWithOK": return this.modalDialogWithOK(this.props.id, this.props.title, this.props.content);
  		case "iotDeviceList":
  		case "floWareSystemList":
  		case "operationList": return this.listDialog(this.props.id, this.props.title, this.props.content, this.props.loader);
  	}

  }
}