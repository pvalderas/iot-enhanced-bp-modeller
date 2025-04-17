import ReactDOM from 'react-dom';
import React from 'react';
import Dialog from "./Dialog.js";

export var showMessage = function(title,text, button){
     window.messageDialog.showMessage(title,text, button);
};

export default class MessageDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      type:"modalWithOK",
      id:"messageDialog"
    };

    window.messageDialog=this;
  }

  showMessage(title,text, button){
    $("#"+this.state.id+" .title").text(title);
    $("#"+this.state.id+" .content").html(text);
    if(button) $("#"+this.state.id+" .button").html(button);
    $("#"+this.state.id).modal();
  }

  render(){
    return(
      <Dialog type={this.state.type}  id={this.state.id} content="" title=""/>
    );
  }

}