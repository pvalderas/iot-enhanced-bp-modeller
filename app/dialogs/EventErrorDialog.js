import React, { Component } from 'react';
import './EventErrorDialog.css';

export var showEventErrorDialog = function(type){
   window.eventErrorDialog.show(type);
};

export var hideEventErrorDialog = function(){
   window.eventErrorDialog.hide();
};

export default class EventNameErrorDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state={
    	message: null,
    	css: {
    		display: "none",
    		left: "200px"
    	}
    }

  	 window.eventErrorDialog=this;
  }

  show(type){
  	let message, left;
  	switch(type){
		case "eventName": message="First, define an event name";left="75px";break;
		case "device": message="First, select a device";left="200px";break;
   	}
   	this.setState({message:message, css:{display:"block",left:left}});
  }

  hide(){
     	this.setState({css:{display:"none"}});
  }

  eventErrorDialog(id){
  	let modalHeaderSticky ={
	  position: "sticky",
	  top: 0,
	  backgroundColor: "inherit",
	  zIndex: 1055
	}
  	return(
  		<div id={id} className="eventError-dialog" style={this.state.css}>
	       <div className="modal-header" style={modalHeaderSticky}>
	        	<h5 className="modal-title">{this.state.message}</h5>
	        	<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.hide.bind(this,id)}>
	          		<span aria-hidden="true">&times;</span>
	        	</button>
	      </div>
	      <div><img src="imgs/bottomArrow.jpeg" height="16px"/></div>
	  </div>
  	)
  }


  render(){
  	return this.eventErrorDialog(this.props.id);
  }
}