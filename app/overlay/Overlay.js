import React  from 'react';
import './overlay.css'

export var showOverlay = function(cleanInstance, instanceID){
   window.overlay.show(cleanInstance, instanceID);
};

export var hideOverlay = function(){
    window.overlay.hide();
};

export default class Overlay extends React.Component  {

  constructor(){
     super();

     this.state={
        cleanInstance:null,
        display:"none"
     }

    window.overlay=this;
    this.show=this.show.bind(this);
    this.hide=this.hide.bind(this);
  }
  
  show(cleanInstanceCallback, instanceID){
    this.setState({
      cleanInstance:cleanInstanceCallback,
      display:"block",
      instanceID:instanceID
    })
  }

  hide(){
    let cleanInstance=this.state.cleanInstance;
    cleanInstance();
    this.setState({
      cleanInstance:null,
      display:"none",
      instanceID:null
    })
  }
    
  render() {
    return (
      <div id="instanceViewerGlass" className="overlay" style={{display:this.state.display}} onClick={this.hide}>
        <div style={{width:"100%", textAlign:"center", color:"red"}}><u>Instance ID</u>: {this.state.instanceID}</div>
        <div style={{width:"100%", textAlign:"center", color:"grey"}}>[Click to hide]</div>
      </div>
    )
  }
}