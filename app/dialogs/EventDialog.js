import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import Dialog from './Dialog.js';
import './loader.css';

export var showEventDialog = function(device){
    window.eventDialog.show(device);
};

export var hideEventDialog = function(device){
    window.eventDialog.hide();
};

export default class EventDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      events: [],
      sensor:null,
      error:null,
      type:"operationList",
      title:"Device Operations",
      id:"eventDialog",
      loader:"eventLoader"
    };

    window.eventDialog=this;

    this.show=this.show.bind(this);

  }

  hide(){
     document.querySelector('#'+this.state.id).style.display = "none";
  }

  show(sensor){
    if(sensor!==this.state.sensor){
      this.loadEvents(sensor);
    }
    document.querySelector('#'+this.state.id).style.display = "block";
  }

  loadEvents(sensor) {
    document.querySelector('#'+this.state.loader).style.display = "block";

    let urls=JSON.parse(sessionStorage.getItem("eventUrls"));
    let url=urls[sensor];

    fetch(url)
      .then(function (response) {
        return response.json()
      })
      .then(events => {
        this.setState({ events: events, sensor: sensor, error:null });
      })
      .catch(error => {
          this.setState({error:error});
        }
      )    
  }

  componentDidUpdate(){
    document.querySelector('#'+this.state.loader).style.display = "none";
  }


  updateInput(value){
    let input=document.getElementById('eventOp');
    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);
    let inputEvent = new Event('input', { bubbles: true});
    input.dispatchEvent(inputEvent);
  }

  addEvent(name){
    this.updateInput(name);
    document.getElementById(this.state.id).style.display = "none";
  }

  render(){
  		var content;
  		if(this.state.error==null) {
        var style={
                color:"black"
              }

	  		const events = this.state.events.map(event => 
	  			<li key={event.id} className="list-group-item"><a href="#" onClick={this.addEvent.bind(this,event.name)} style={style}>{event.name}</a></li>
	  		);
      
	  		content=<ul className="list-group">{events}</ul>;
  		}else{
  			content=this.state.error;
  		}
  		return (
  			<Dialog type={this.state.type} title={this.state.title} id={this.state.id} loader={this.state.loader} content={content} />
  		);
  }

}