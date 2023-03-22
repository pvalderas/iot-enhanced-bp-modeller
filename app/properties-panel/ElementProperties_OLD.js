import React, { Component } from 'react';
import { is } from 'bpmn-js/lib/util/ModelUtil';

export default class ElementProperties extends Component {
	constructor(props) {
	    super(props);

	    this.modeler=this.props.modeler;
	    this.element=this.props.element;

	    this.state = {
	      isIoT:false
	    };

	 }

	 updateName(name) {
	    const modeling = this.modeler.get('modeling');
	    modeling.updateLabel(this.element, name);
	 }

	 updateOperation(operation) {
	    const modeling = this.modeler.get('modeling');

	    modeling.updateProperties(this.element, {
	      'custom:operation': operation
	    });

	    modeling.updateLabel(this.element, operation);
	  }

	 drawInColor(element, color){
		this.modeler.get('modeling').setColor(element, {
	      	stroke: color
	    });
	 }

	 enableSelection(e){
	 	const modeling = this.modeler.get('modeling');
	    this.setState({isIoT:e.target.checked});
	    if(e.target.checked){
	    	modeling.updateProperties(this.element, {
		      'custom:iot': true
		    });
	    }else{
	    	modeling.updateProperties(this.element, {
		      'custom:iot': false
		    });
	    }
	  }

	 showOperationDialog(){
	      
	      var IoTDeviceID=this.element.businessObject.lanes[0].name;
	      if(IoTDeviceID!=null){

	        $(".microservice-name").html(IoTDeviceID);

	        var urls=JSON.parse(sessionStorage.getItem("urls"));

	        var url=urls[IoTDeviceID];

	        $("#operations-dialog ul").empty();
	        var dialog=document.querySelector('#operations-dialog');
	        dialog.style.display = "block";

	        jQuery.getJSON(url, function(operations){
	          jQuery.each(operations, function(index,operation){
	            jQuery("#operations-dialog ul").append('<li class="list-group-item"><a href="#" onClick="window.addOperation(\''+operation.ID+'\',\''+operation.URL+'\',\''+operation.METHOD+'\')">'+operation.ID+'</a></li>');
	          })
	        }).done(function(){
	          var loader=document.querySelector('#operations-loader');
	          loader.style.display = "none";
	        })

	      }else{
	        window.showMessage("Error","You must associate an IoT Device to the lane.");
	      }
	  };

	  showMicroserviceDialog(){
	      var dialog=document.querySelector('#microservices-dialog');
	      dialog.style.display = "block";
	  };

	  render(){

	  	 
	  	 if(this.element.businessObject.$attr)
	  	 	console.log(this.element.businessObject.$attr['custom:iot']);

	  	 return (
		    <div className="element-properties" key={this.element.id }>
		      {
		        is(this.element, 'bpmn:ServiceTask') &&
		           <form className="form-inline">
		            <label className="col-sm-3 col-form-label">IoT Device Operation</label>
		            <input id="propertyValue" className="form-control col-sm-3" value={ this.element.businessObject.get('name') || ''} 
		            onChange={ (event) => {this.updateOperation(event.target.value)} } />
		             <button className="btn btn-primary col-sm-2" onClick={ this.showOperationDialog } >Select</button>
		          </form>
		      }
		      {
		        is(this.element, 'bpmn:Lane') &&
		          <form className="form-inline">
		            <div className="form-check form-switch">
		              <input className="form-check-input" type="checkbox" id="isIoT" onClick={(event) => this.enableSelection(event)}  />
		              <label className="form-check-label" htmlFor="isIoT">Is an IoT Device</label>
		            </div>
		            <input id="propertyValue" className="form-control col-sm-3" value={ this.element.businessObject.name || '' } 
		            onChange={ (event) => { this.updateName(event.target.value) } } disabled={!this.state.isIoT}/>
		             <button id="selectButton" className="btn btn-primary col-sm-2" onClick={ this.showMicroserviceDialog } 
		             disabled={!this.state.isIoT}>Select</button>
		          </form>
		      }
		      {
		        !is(this.element, 'bpmn:ServiceTask') && !is(this.element, 'bpmn:Lane') &&
		            <span>Please select a service task or a lane.</span>

		      }

		    </div>
		  );
	  }
}
