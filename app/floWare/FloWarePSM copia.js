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

			if(element.Parent==root.Name){
				elements.push(element);
			}

		});

		return elements;
	}

	getParent(pim, element){
		var parentElement=null;
		pim.forEach(function(parent, index){

			if(parent.Name==element.Parent){
				parentElement=parent;
				return;
			}

		});

		return parentElement;
	}

	getDirectSons(pim, parent){
		var sons=[];
		pim.forEach(function(element, index){

			if(element.Parent==parent.Name){
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

	checkMandatoryBranch(pim, element){
		var mandatoryBranch=true;
		var parent=this.getParent(pim, element);
		while(parent.Parent!=undefined){
			mandatoryBranch=parent.Mandatory;
			parent=this.getParent(pim, parent);
		}
		return mandatoryBranch;
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

          	var allElementAnalysis=[];
          	var mandatoryElements=[];

          	pim.forEach(function(element){
				if(element.Type=="System" && element.Parent==root.Name && element.Mandatory==true){
					var leaveSons=_this.getLeaveSons(pim, element);
							
					var elementAnalysis=models.map(function(model, index){

						return _this.modeler.importXML(model).then((warnings)=>{ 
							var mandatoryBranch=false;
							var modelName="";
							const definitions=_this.modeler.get('canvas').getRootElement().businessObject.$parent;
							jQuery.each(definitions.rootElements, function(index, node){
									if (node.$type=="bpmn:Process"){
										modelName=node.id;
										jQuery.each(node.laneSets[0].lanes, function(index, lane){
											if(leaveSons.some(function(son){return lane.name==son.Name;})){
												mandatoryBranch=true;
												return false;
											}
										});
									}
									if(mandatoryBranch) return false;
							});
							console.log(modelName);
							console.log(model);
							return {model:modelName,element:element.Name,mandatoryBranch: mandatoryBranch};
						});

					});

					allElementAnalysis.push(...elementAnalysis);
					mandatoryElements.push(element.Name);
				}
						
			});

			// Resolve all the promises
        	Promise.all(allElementAnalysis)
	          .then((results) => {
	          		console.log(results);
	          		var elementNoSatisfied=null;
	       			mandatoryElements.every(function(element){
	       				var mandatory=false;
	       				results.every(function(r){
	       					if(r.element==element & r.mandatoryBranch){
	       						mandatory=true;
	       					}
	          			})
	          			if(!mandatory){
	          				elementNoSatisfied=element;
	          				return false;
	          			}
	          			return true;
	       			})
	          		
	          		console.log(elementNoSatisfied);

	              	if(elementNoSatisfied!=null){
						callback(false, null, "According to the PIM model, the "+elementNoSatisfied+" device must be included in one BPMN model");
					}else{
						callback(true, models);
					}
	          }).catch(function(err) {
	            console.log(err);
	          })

          })
          .catch(error => {
              console.log(error);
          }) 
	}


	downloadPSMFile(){
		var system=localStorage.getItem("selectedSystem");
		var url= this.basePath.replace("{systemID}",system);

		fetch(url)
          .then(function (response) {
            return response.json();
          })
          .then(pim => {
             var psm=this.getPSM(pim);
             this.createFile(system, JSON.stringify(psm));
          })
          .catch(error => {
              console.log(error);
          }) 
	}

	getPSM(pim){
		var psm=pim;
		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;

		jQuery.each(definitions.rootElements, function(index, element){
				if (element.$type=="bpmn:Process"){
					jQuery.each(element.laneSets[0].lanes, function(index, lane){

						psm.forEach(function(element, index){

							if(element.Type=="Device" && element.Name==lane.name){
								element.Selection="Selected";

								if(element.Operations){

									var operations=[];
									jQuery.each(lane.flowNodeRef, function(index, node){

										if(node.$type=="bpmn:ServiceTask"){
											
											Object.keys(element.Operations).forEach(opID => {

												 var op=element.Operations[opID];
												 if(op["Operation Name"]==node.name){
												 	op.Selection="Selected";
												 }

											}); // End For Each Operation in Element PIM

										}

									}); // End forEach node of the Lane

								}
							}

						}); // End forEach PIM
						
					}); // End forEach Lane

				} // End if Process

		}); // End forEach RootElement

		return psm;
	}

	
}

 