import JSZip from 'jszip';
import FileSaver from 'file-saver';
import DataObject from './DataObject.js';

export default class BPMN2DTDL{

	constructor(modeler) {

		this.modeler=modeler;
		this.dataObject=new DataObject();
	}


	downloadDTDL(){

		let zip = new JSZip();

		zip.file("processDTDL.json", JSON.stringify(this.getProcessModelDTDL()));
		console.log(JSON.stringify(this.getProcessModelDTDL()));	
		
		zip.file("actorDTDL.json", JSON.stringify(this.getActorModelDTDL()));
		console.log(JSON.stringify(this.getActorModelDTDL()));	

		zip.file("activityDTDL.json", JSON.stringify(this.getActivityModelDTDL()));
		console.log(JSON.stringify(this.getActivityModelDTDL()));

		zip.file("iotDeviceDTDL.json", JSON.stringify(this.getIoTModelDTDL()));	
		console.log(JSON.stringify(this.getIoTModelDTDL()));	

		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
		let _this=this;
		definitions.rootElements.forEach(function(element,index){
				if (element.$type=="bpmn:Collaboration"){
					let collaboration=element;
					collaboration.participants.forEach(function(participant,index){
						if(participant.name!="PHYSICAL WORLD" && participant.processRef){
							participant.processRef.laneSets[0].lanes.forEach(function(lane){
								if(lane.extensionElements && lane.extensionElements.values){
									let fields={
										iot:false, iotLane:"", iotSensor:null
									}
									lane.extensionElements.values.forEach(function(field){
										fields[field.name]=field.stringValue;
									});
		
									if(fields.iot){
										let stringDTDL="";
										if(fields.iotSensor)
											stringDTDL=JSON.stringify(_this.getIoTDeviceDTDL(lane, collaboration.messageFlows));
										else
											stringDTDL=JSON.stringify(_this.getIoTDeviceDTDL(lane));
										zip.file(lane.name.replaceAll(" ","")+"DTDL.json", stringDTDL);	
									}
									
								} 
							});
						}
					});
				}
		});

		zip.generateAsync({type: "blob"}).then(function(content) {
			 FileSaver.saveAs(content, localStorage.getItem("selectedSystem")+"DTDL.zip");
		});

	}

	getProcessModelDTDL(){
		let dtdl={
			"@id":"dtmi:es:upv:pros:pvalderas:process;1",
			"@context": "dtmi:dtdl:context;2",
			"@type": "Interface",
    		displayName: "Process",
    		contents: [
	    		{
				    "@type": "Relationship",
				    "name": "actors",
				    "target": "dtmi:es:upv:pros:pvalderas:actor;1"
				}
    		]
		};

		return dtdl;
	}

	getActorModelDTDL(){
		let dtdl={
			"@id":"dtmi:es:upv:pros:pvalderas:actor;1",
			"@context": "dtmi:dtdl:context;2",
			"@type": "Interface",
    		displayName: "Actor",
    		contents: [
	    		{
				    "@type": "Relationship",
				    "name": "activities",
				    "target": "dtmi:es:upv:pros:pvalderas:activity;1"
				},
				{
				    "@type": "Relationship",
				    "name": "IoTDevice",
				    "minMultiplicity": 0,
				    "maxMultiplicity": 1,
				    "target": "dtmi:es:upv:pros:pvalderas:iotDevice;1"
				}
    		]
		};

		return dtdl;
	}

	getActivityModelDTDL(){
		let dtdl={
			"@id":"dtmi:es:upv:pros:pvalderas:activity;1",
			"@context": "dtmi:dtdl:context;2",
			"@type": "Interface",
    		displayName: "Activity"
		};

		return dtdl;
	}

	getIoTModelDTDL(){
		let dtdl={
			"@id":"dtmi:es:upv:pros:pvalderas:iotDevice;1",
			"@context": "dtmi:dtdl:context;2",
			"@type": "Interface",
    		displayName: "IoTDevice"
		};

		return dtdl;
	}

	getIoTDeviceDTDL(lane, events){
		let _this=this;
		let laneName=lane.name.replaceAll(" ","").replaceAll("[","").replaceAll("]","");
		let dtdl={
			"@id":"dtmi:es:upv:pros:pvalderas:iotDevice:"+laneName+";1",
			"@context": "dtmi:dtdl:context;2",
			"@type": "Interface",
			extends: "dtmi:es:upv:pros:pvalderas:iotDevice;1",
    		displayName: laneName,
    		contents: [
    		]
		};


		lane.flowNodeRef.forEach(function(element){
			if(element.$type=="bpmn:ServiceTask" && element.name && element.name.length>0){
				let inputs=_this.dataObject.getInputs(element);
				let outputs=_this.dataObject.getOutputs(element);
				
				if(events!=undefined && (element.name.indexOf("get")>=0 || element.name.indexOf("set")>=0)){
					let properties=_this.getProperties(element, inputs, outputs);
					dtdl.contents.push(...properties);
				}else{
					let command=_this.getCommand(element, inputs, outputs);
					dtdl.contents.push(command);
				}
			}
		});

		let telemetries=[];
		if(events!=undefined){
			events.forEach(function(event){
				if(event.name==lane.name){
					let exists=telemetries.some(function(tel){return event.targetRef.name.replaceAll(" ","")==tel.name;});
					if(!exists){
						let telemetry={
						    "@type": "Telemetry",
						    name: event.targetRef.name.replaceAll(" ","")
						}
						let outputs=_this.dataObject.getOutputs(event.targetRef);
						if(outputs.length==0){
							telemetry["schema"]="string";
						}else if (outputs.length==1){
							telemetry["schema"]=outputs[0].schema;
						}else{
							telemetry['schema']= {
						    	"@type": "Object",
								fields: outputs
						    };
						}
						telemetries.push(telemetry);
					} 
				} 
			});
			dtdl.contents.push(...telemetries);
		}

		return dtdl;
	}

/*	getInputs(element){
		let inputs=[];
				
		if(element.dataInputAssociations){
			element.dataInputAssociations.forEach(function(assoc){
				assoc.sourceRef.forEach(function(dataObject){
					if(dataObject.extensionElements && dataObject.extensionElements.values){
						dataObject.extensionElements.values.forEach(function(properties){
							if(properties.values){
								properties.values.forEach(function(property){
									inputs.push({
										name:property.name.replaceAll(" ",""),
										schema:property.value
									});
								});
							}
						});
					}
				});
			});
		}

		return inputs;
	}

	getOutputs(element){
		let outputs=[];
		if(element.dataOutputAssociations){
			element.dataOutputAssociations.forEach(function(assoc){
				let dataObject=assoc.targetRef;
				if(dataObject.extensionElements && dataObject.extensionElements.values){
					dataObject.extensionElements.values.forEach(function(properties){
						if(properties.values){
							properties.values.forEach(function(property){
								outputs.push({
									name:property.name.replaceAll(" ",""),
									schema:property.value
								});
							});
						}
					});
				}
			});
		}
		return outputs;
	}
*/
	getProperties(element, inputs, outputs){
		let properties=[];

		if(inputs.length>0){
			let inputProp={
				"@type": "Property",
			};

			if(inputs.length==1){
				inputProp['name']= input[0].name;
				inputProp['schema']= input[0].schema;
			}else if(inputs.length>1){
				inputProp["name"]= element.name.replaceAll(" ","").replaceAll("get","").replaceAll("set","");
			    inputProp['schema']= {
			    	"@type": "Object",
					fields: inputs
			    };
			}

			if(element.name.toLowerCase().indexOf("set")>=0)  inputProp['writable']= true;

			properties.push(inputProp);
		}

		if(outputs.length>0){

			if(outputs.length==1){
				let isInput=false;
		
				if(inputProp.name==outputs[0].name && inputProp.schema==outputs[0].schema){
					isInput=true;
				}

				if(!isInput){
					let outputProp={
						"@type": "Property",
					    name: outputs[0].name,
					    schema: outputs[0].schema
					}
					if(element.name.toLowerCase().indexOf("set")>=0)  outputProp['writable']= true;
					properties.push(outputProp);
				}
			}else if(outputs.length>1){
				let isInput=false;
				properties.forEach(function(prop){
					console.log(prop);
					if(prop.schema["@type"]){
						let fields=prop.schema.fields;
						if(fields.length==output.length){
							let all=true;
							fields.some(function(field){
								let exists=false;
								outputs.forEach(function(output){
									if(field.name==output.name && field.schema!=output.schema){ 
										exists=true;
										return;
									}
								});
								if(!exists){
									all=false;
									return;
								}
							});

							if(all){
								isInput==true;
								return;
							}
						}
					} 	
				});

				if(!isInput){
					let outputProp={
						"@type": "Property",
					    name: element.name.replaceAll(" ","").replaceAll("get","").replaceAll("set",""),
					    schema: {
					    	"@type": "Object",
							fields: outputs
						}
					};
					if(element.name.toLowerCase().indexOf("set")>=0)  outputProp['writable']= true;
					properties.push(outputProp);
				}		
			}
		}
		return properties;
	}

	getCommand(element, inputs, outputs){
		let command={
		    "@type": "Command",
		    name: element.name.replaceAll(" ","")
		};

		if(inputs.length>0){
			let request={
		        name: element.name.replaceAll(" ","")+"_inputs",
		        displayName: "Inputs of "+element.name,
		        schema: {
					"@type": "Object",
					fields: inputs
				}
			}		         
			command['request']=request;
		}

		if(outputs.length>0){
			let response={
		        name: element.name.replaceAll(" ","")+"_output",
		        displayName: "Output of "+element.name,
		        schema: {
					"@type": "Object",
					fields: outputs
				}
			}	
			command['response']=response;
		}

		return command; 
	}
}