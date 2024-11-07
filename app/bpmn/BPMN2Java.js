import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { showMessage } from '../dialogs/MessageDialog';
import DataObject from './DataObject.js';

export default class BPMN2Java{

	constructor(modeler) {
		this.modeler=modeler;
		this.dataObject=new DataObject();
		this.downloadJava=this.downloadJava.bind(this);
	}

	generateJava(devices){
		if(devices.length>0){
			let zip = new JSZip();

			//Azure class
			let azureClass='@Component\r\npublic class AzureInstance {\r\n\r\n';

			azureClass+='	private DigitalTwinsClient client;\r\n\r\n';
			azureClass+='	public void createInstance(){\r\n';
			azureClass+='		client = new DigitalTwinsClientBuilder()\r\n';
			azureClass+='			    .credential(\r\n';
			azureClass+='			        new ClientSecretCredentialBuilder()\r\n';
			azureClass+='			            .tenantId(getProperties("tenantId"))\r\n';
			azureClass+='			            .clientId(getProperties("clientId"))\r\n';
			azureClass+='			            .clientSecret(getProperties("clientSecret"))\r\n';
			azureClass+='			            .build()\r\n';
			azureClass+='			    )\r\n';
			azureClass+='			    .endpoint("https://SmartDistributionCenter.api.wcus.digitaltwins.azure.net")\r\n';
			azureClass+='			    .buildClient();\r\n\r\n';
			azureClass+='		BasicDigitalTwin process=createDT("'+localStorage.getItem("selectedSystem")+'", "dtmi:es:upv:pros:pvalderas:process;1");\r\n\r\n';

			
			devices.forEach(function(device,index){

				let className=device.name.replaceAll(" ","");

				//IoT Device Main Class
				let mainClassContent='@SpringBootApplication\r\n@IoTDeviceManager(name="'+device.name+'")\r\npublic class '+className+' {\r\n	public static void main(String[] args) {\r\n		SpringApplication.run('+className+'.class, args);\r\n	}\r\n}'; 
				zip.file(className+".java", mainClassContent);

				//IoT Device Actuator
				let actuatorClass='@RestController\r\npublic class '+className+'Actuator {\r\n\r\n';
				device.operations.forEach(function(operation){
					actuatorClass+='	@Actuation (name="'+operation.name+'",\r\n';
					actuatorClass+='				resultType='+operation.name+'Result.class,\r\n';
					actuatorClass+='				description="")\r\n';
					actuatorClass+='	@RequestMapping(value="/'+operation.name.replaceAll(" ","/").toLowerCase()+'",\r\n';
					actuatorClass+='					method=RequestMethod.GET,\r\n';
					actuatorClass+='					produces="application/json")\r\n';
					actuatorClass+='	public String '+operation.name.replaceAll(" ","").toLowerCase()+'(';
					if(operation.inputs.length>0){
						let args="";
						operation.inputs.forEach(function(input){
							args+=input.schema+' '+input.name+',';
						});
						args=args.substring(0,args.length-1);
						actuatorClass+=args;
					}
					actuatorClass+='){\r\n';
					actuatorClass+='		'+operation.name.charAt(0).toUpperCase()+operation.name.substring(1)+'Result result = null;\r\n';
					actuatorClass+='		//Code to interact with the IoT Device\r\n';
					actuatorClass+='		HTTPClient.get("'+operation.url+'");\r\n';
					actuatorClass+='		return result.toString();\r\n';
					actuatorClass+='	}\r\n\r\n';
				});
				actuatorClass+='}';
				zip.file(className+"Actuator.java", actuatorClass);

				//Azure intantiation
				let classNameVar=className.charAt(0).toLowerCase()+className.substring(1);
				azureClass+='		BasicDigitalTwin '+classNameVar+'Actor=createDT("'+className+'Actor", "dtmi:es:upv:pros:pvalderas:actor;1");\r\n';
				azureClass+='		BasicRelationship rel'+className+'Actor=new BasicRelationship(process.getId()+'+classNameVar+'Actor.getId(),process.getId(),'+classNameVar+'Actor.getId(), "actors");\r\n';
				azureClass+='		client.createOrReplaceRelationship(process.getId(),'+classNameVar+'Actor.getId(), rel'+className+'Actor, BasicRelationship.class);\r\n';

				//Result classes for IoT Device's operations and Azure instantiation
				device.operations.forEach(function(operation){
					let operationName=operation.name.charAt(0).toUpperCase()+operation.name.substring(1);
					operationName=operationName.replaceAll(" ","");
					let resultClass='public class '+operationName+'Result {\r\n';
					if(operation.outputs.length>0){
						operation.outputs.forEach(function(output){
							resultClass+='	private '+output.schema.charAt(0).toUpperCase()+output.schema.substring(1)+' '+output.name+';\r\n';
						});
						resultClass+='\r\n';
						resultClass+='	@Override\r\n';
						resultClass+='	public String toString(){\r\n';
						resultClass+='		JSONObject json=new JSONObject();\r\n';
						operation.outputs.forEach(function(output){
							resultClass+='		json.put['+output.name+']=this.'+output.name+';\r\n';
						});
						resultClass+='	return json.toString();';
						resultClass+='	}';
					}
					resultClass+='\r\n}';
					zip.file(operationName+"Result.java", resultClass);

					operationName=operationName.charAt(0).toLowerCase()+operationName.substring(1);
					azureClass+='		BasicDigitalTwin '+classNameVar+operationName+'=createDT("'+operation.name+'", "dtmi:es:upv:pros:pvalderas:activity;1");\r\n';
					azureClass+='		BasicRelationship rel'+classNameVar+operationName+'=new BasicRelationship('+classNameVar+'Actor.getId()+'+classNameVar+operationName+'.getId(),'+classNameVar+'Actor.getId(), '+classNameVar+operationName+'.getId(),"activities");\r\n';
					azureClass+='		client.createOrReplaceRelationship('+classNameVar+'Actor.getId(), '+classNameVar+operationName+'.getId(), rel'+classNameVar+operationName+', BasicRelationship.class);\r\n\r\n';
				});

				//Azure intantiation
				azureClass+='		BasicDigitalTwin '+classNameVar+'Dev=createDT("'+className+'Device", "dtmi:es:upv:pros:pvalderas:iotDevice:'+className+'System;1");\r\n';
				azureClass+='		BasicRelationship rel'+className+'Dev=new BasicRelationship('+classNameVar+'Actor.getId()+'+classNameVar+'Dev.getId(),'+classNameVar+'Actor.getId(), '+classNameVar+'Dev.getId(),"IoTDevice");\r\n';
				azureClass+='		client.createOrReplaceRelationship('+classNameVar+'Actor.getId(), '+classNameVar+'Dev.getId(), rel'+className+'Dev, BasicRelationship.class);\r\n\r\n';

			});

			//Azure class
			azureClass+='	}\r\n\r\n';
			azureClass+='	private BasicDigitalTwin createDT(String id, String model) {\r\n';
			azureClass+='		BasicDigitalTwin basicTwin = new BasicDigitalTwin(id)\r\n';
			azureClass+='			.setMetadata(\r\n';
			azureClass+='				new BasicDigitalTwinMetadata()\r\n';
			azureClass+='					.setModelId(model)\r\n';
			azureClass+='		);\r\n';
			azureClass+='		client.createOrReplaceDigitalTwin(basicTwin.getId(), basicTwin, BasicDigitalTwin.class);\r\n';
			azureClass+='		return basicTwin;\r\n';
			azureClass+='	}\r\n\r\n';

			azureClass+='	private Properties props;\r\n';
			azureClass+='	private  String getProperties(String key){\r\n';
			azureClass+='		if(props==null) {\r\n';
			azureClass+='			YamlPropertiesFactoryBean yamlFactory = new YamlPropertiesFactoryBean();\r\n';
			azureClass+='			yamlFactory.setResources(new ClassPathResource("application.yml"));\r\n';
			azureClass+='			props=yamlFactory.getObject();\r\n';
			azureClass+='		}\r\n';
			azureClass+='		return props.getProperty(key);\r\n';
			azureClass+='	}\r\n';


			azureClass+='}';

			//zip.file("AzureInstance.java", azureClass);
			
			zip.generateAsync({type: "blob"}).then(function(content) {
			  FileSaver.saveAs(content, localStorage.getItem("selectedSystem")+".zip");
			});
		}
		else{
			showMessage("Attention","There are not IoT Devices to be exported.");
		}
	}

	downloadJava(){

		const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;

		let microservices=[];
		let urls=JSON.parse(sessionStorage.getItem("urls"));
		for (let key in urls) {
	        microservices.push(key);
	    }
		let IoTDevices=[];
		let _this=this;

						function addDevice(lane, laneName){
							let operations=[];
							jQuery.each(lane.flowNodeRef,function(index, element){
								if(element.$type=="bpmn:ServiceTask" && element.name && element.name.length>0){
									let url=element.extensionElements.values.filter((field) => field.name == "url");
									
									let exists=operations.some(function(op){
										return op.name==element.name;
									});
									if(!exists){
										operations.push({
											name:element.name,
											inputs: _this.dataObject.getInputs(element),
											outputs: _this.dataObject.getOutputs(element),
											url: url.length>0?url[0].stringValue:null
										});
									}
									
								}
							});
							IoTDevices.push({
								"name":laneName,
								"operations":operations
							})
						}

						const addWoT = async (laneName) =>{

							let response=await fetch("https://pedvalar.webs.upv.es/microservicesEmu/wot/getWoTDescription.php?name="+laneName.replaceAll(" ","_"));
 							let wot=await response.json();

							let operations=[];

							Object.keys(wot.actions).forEach(function(actionName){
								let url=wot.actions[actionName].forms.filter((form) => form.href!=undefined);
								if(url[0]) url=url[0].href;
								operations.push({
									name:actionName,
									inputs: [],
									outputs: [],
									url: url
								});
							});

							Object.keys(wot.properties).forEach(function(propName){
								let url=wot.properties[propName].forms.filter((form) => form.href!=undefined);
								if(url[0]) url=url[0].href;
								operations.push({
									name:"set"+propName.charAt(0).toUpperCase()+propName.slice(1),
									inputs: [],
									outputs: [],
									url: url+"/set"
								});

								operations.push({
									name:"get"+propName.charAt(0).toUpperCase()+propName.slice(1),
									inputs: [],
									outputs: [],
									url: url+"/get"
								});
							});


							IoTDevices.push({
								"name":wot.title,
								"operations":operations
							})

						}

		let llamadas=[];
		definitions.rootElements.forEach(function(element,index){
				if (element.$type=="bpmn:Collaboration"){
					
					element.participants.forEach(function(participant,index){
					
						if(participant.name!="PHYSICAL WORLD" && participant.processRef){
							jQuery.each(participant.processRef.laneSets[0].lanes,function(index, lane){
								let laneName=lane.name.replaceAll("[","").replaceAll("]","");
								if(microservices.indexOf(laneName)>=0){

 										if(localStorage.getItem("isWoT")==1){
 											llamadas.push(addWoT(laneName));
 										}else{
 											addDevice(lane,laneName);
 										}
 
									
								}
							});
						}
					});
				}
		});

		if(localStorage.getItem("isWoT")==1) Promise.all(llamadas).then(reponse=>{this.generateJava(IoTDevices);})
		else this.generateJava(IoTDevices);
	}
}

 