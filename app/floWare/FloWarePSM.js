import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { showMessage } from '../dialogs/MessageDialog';


export default class FloWarePSM{

	constructor(modeler) {
		this.modeler=modeler;
		this.basePath="http://pedvalar.webs.upv.es/microservices/system/{systemID}/floware";

		this.downloadPSMFile=this.downloadPSMFile.bind(this);
		this.getPSM=this.getPSM.bind(this);
		this.checkPIMrestrictions=this.checkPIMrestrictions.bind(this);
		this.getLeaveSons=this.getLeaveSons.bind(this);
	}

	createFile(system, content){
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
		element.setAttribute('download', system+"PSM.json");

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	getRoot(pim){
		var root=null;
		pim.forEach(function(element){

			if(element.Parent==undefined){
				root=element;
				return;
			}

		});

		return root;
	}

	getFirtLevelNodes(pim){
		var root=getRoot(pim);
		var elements=[];
		pim.forEach(function(element){

			if(element.Parent==root.ID){
				elements.push(element);
			}

		});

		return elements;
	}

	getParent(pim, element){
		var parentElement=null;
		pim.forEach(function(parent, index){

			if(parent.ID==element.Parent){
				parentElement=parent;
				return;
			}

		});

		return parentElement;
	}

	getDirectSons(pim, parent){
		var sons=[];
		pim.forEach(function(element, index){

			if(element.Parent==parent.ID){
				sons.push(element);
			}

		});
		return sons;
	}

	getLeaveSons(pim, element){
		var sons=[];
		var _this=this;
		var directSons=this.getDirectSons(pim, element);
		if(directSons.length==0) sons.push(element);
		else{
			directSons.forEach(function(son){
				sons.push(..._this.getLeaveSons(pim, son));
			});
		}
		return sons;
	}

	getBranchElements(pim, element){
		var parent=this.getParent(pim, element);
		var elements=[];
		while(parent.Parent!=undefined){
			elements.push(parent);
			parent=this.getParent(pim, parent);
		}
		return elements;
	}

	checkPIMrestrictions(models, callback){
		var system=localStorage.getItem("selectedSystem");
		var url= this.basePath.replace("{systemID}",system);
		var _this=this;

		fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(pim => {

          	var root=_this.getRoot(pim);
          	var stopEveryLoop=false;


          	var exitMainEvery=false;
          	pim.every(function(element){
				if(element.Type=="System" && element.Parent==root.ID && element.Relation=="Mandatory"){
					var leaveSons=_this.getLeaveSons(pim, element);
					
					var mandatoryBranch=false;

					models.forEach(function(model){
						var indexLane=model.indexOf("<bpmn:lane");
						
						while(indexLane!=-1 && !mandatoryBranch){
							var indexEnd=model.indexOf(">",indexLane);
							leaveSons.every(function(son){
								var indexName=model.indexOf(son.Name,indexLane);

								if(indexLane<indexName && indexName<indexEnd){
									mandatoryBranch=true;
									return false;
								}
								return true;
							});
							
							indexLane=model.indexOf("<bpmn:lane", indexEnd);
						}

					});

					if(!mandatoryBranch){
          				callback(false, null, "According to the PIM model, a "+element.Name+" device must be included in one BPMN model");
          				exitMainEvery=true;
					}
				}
				return !exitMainEvery;
			});

			if(!exitMainEvery) callback(true, models);
					
        })
      .catch(error => {
          console.log(error);
      }) 
	}


	downloadPSMFile(models){
		var system=localStorage.getItem("selectedSystem");
		var url= this.basePath.replace("{systemID}",system);

		fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(pim => {
             var psm=this.getPSM(pim,models);
             this.createFile(system, JSON.stringify(psm));
          })
          .catch(error => {
              console.log(error);
          }) 
	}



	sendPSM(models, idPSM, compositions){
		var system=localStorage.getItem("selectedSystem");
		var url= this.basePath.replace("{systemID}",system);

		fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(pim => {
            var psm=this.getPSM(pim,models);
            
           	fetch(url,{
				 		method:'POST',
				 		body: JSON.stringify({"id":idPSM, "system":system, "psm":JSON.stringify(psm), "compositions": compositions})
		 	}).then(result =>{
		 		 var psmUrl=url+"/psm/"+idPSM;
		 		 showMessage("Atention","<br><span style='font-size:larger'>PSM model has been saved successfully. You can access it from this <a href='"+psmUrl+"' target='_blank'>url</a>.<br><br> You can access the list of included high-level events from this <a href='"+psmUrl+"/events' target='_blank'>url</a><span><br>");
		 	})
		    .catch(err => {
		        console.log(err);
		    })
          })
          .catch(error => {
              console.log(error);
          }) 
	}

	getPSM(pim, models){
		var actors=this.getBPMNActors(models);
		var psm=pim;
		var _this=this;

        psm.forEach(function(element, index){

			if(element.Type=="Device" && actors.includes(element.Name)){
				element.Selection="Selected";
				var branchElements=_this.getBranchElements(pim,element);
				branchElements.forEach(function(ancestor){
					ancestor.Selection="Selected";
				});
				var operations=_this.getOperations(models, element.Name);
				Object.keys(element.Operations).forEach(function(operationKey){
					if(operations.includes(element.Operations[operationKey]["Operation Name"]))
						element.Operations[operationKey].Selection="Selected";
				});

			}

		});

		var root=this.getRoot(psm);
		root.Selection="Selected";

		return psm;
	}

	getBPMNActors(models){
		let actors=[];
		models.forEach(function(model){

			let indexLane=model.indexOf("<bpmn:lane");
			
			while(indexLane!=-1){

				let indexEnd=model.indexOf("\">",indexLane);
				let indexName=model.indexOf("name=\"",indexLane);

				if(indexName>indexLane && indexName<indexEnd){
					let name= model.substring(indexName+6,indexEnd)
					actors.push(name);
				}
	
				indexLane=model.indexOf("<bpmn:lane", indexEnd);
			}

			let indexFlow=model.indexOf("<bpmn:messageFlow");

			while(indexFlow!=-1){
				let indexFlowEnd=model.indexOf("/>",indexFlow);
				let indexName=model.indexOf("name=\"",indexFlow);
				if(indexName>indexFlow && indexName<indexFlowEnd){
					let indexNameEnd=model.indexOf("]\" sourceRef=",indexFlow);
					let name= model.substring(indexName+7,indexNameEnd)
					actors.push(name);
				}

				indexFlow=model.indexOf("<bpmn:messageFlow", indexFlowEnd);
			}
		});

		return actors;

	}

	getOperations(models, actor){
		var operations=[];
		
		models.forEach(function(model){
			var elements=[]

			var indexLane=model.search("<bpmn:lane id=\".*\" name=\""+actor+"\">");
			var indexFlow=model.indexOf("<bpmn:flowNodeRef>",indexLane);
			var indexEndLane=model.indexOf("</bpmn:lane>",indexLane);

			var subModel=model.substring(indexLane,indexEndLane);
			
			while(indexFlow<indexEndLane && indexFlow!=-1){
				var indexEndFlow=subModel.indexOf("</bpmn:flowNodeRef>",indexFlow);
				elements.push(subModel.substring(indexFlow+18,indexEndFlow));
				indexFlow=subModel.indexOf("<bpmn:flowNodeRef>",indexEndFlow);
			}

			elements.forEach(function(element){
				var indexTask=model.search("<bpmn:serviceTask id=\""+element+"\" ");
				if(indexTask>0){
					var indexName=model.indexOf("name=",indexTask);
					var indexEndName=model.indexOf("\" ",indexName);
					operations.push(model.substring(indexName+6,indexEndName));
				}
			});

			let indexExtensionElements=model.indexOf("<bpmn:extensionElements>");
			
			
			while(indexExtensionElements!=-1){

				let indexDevice=model.indexOf("name=\"device\"",indexExtensionElements);
				let indexActor=model.indexOf("stringValue=\""+actor+"\"",indexDevice);
				let indexEndExtensionElements=model.indexOf("</bpmn:extensionElements>",indexExtensionElements);
				
				if(indexActor>indexExtensionElements && indexActor<indexEndExtensionElements){

					let indexOperation=model.indexOf("<camunda:field name=\"operation\"", indexDevice);

					if(indexOperation>indexExtensionElements && indexOperation<indexEndExtensionElements){
						let indexStringValue=model.indexOf("stringValue=",indexOperation);
						let indexEndStringValue=model.indexOf("\" ",indexStringValue);
						operations.push(model.substring(indexStringValue+13,indexEndStringValue));
						console.log(model.substring(indexStringValue+13,indexEndStringValue));
					}
				}

				indexExtensionElements=model.indexOf("<bpmn:extensionElements>",indexEndExtensionElements);
			}
		});

		return operations;
	}

	regexIndexOf(text, re, i) {
	    var indexInSuffix = text.slice(i).search(re);
	    return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + i;
	}
}

 