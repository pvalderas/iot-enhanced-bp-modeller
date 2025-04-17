import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { showMessage } from '../dialogs/MessageDialog';
import {MQTT, HTTP} from '../floWare/FloWareConfig.js'


export default class FloWare2Java{

	constructor(modeler) {
		this.generateMicroservices=this.generateMicroservices.bind(this);
		this.getActuatorClass=this.getActuatorClass.bind(this);
		this.downloadFloWareMicroservices=this.downloadFloWareMicroservices.bind(this);

		this.modeler=modeler;
	}

	generateMicroservices(composition, deviceNames, fragments, devices){
		var _this=this;

		let zip = new JSZip();
		devices.forEach(function(device,index){
			if(deviceNames.includes(device.name)){
				var className=device.name.replaceAll(" ","");
				var packageName='prosvrain.floware.devices.'+className.toLowerCase();
				var folderName=className+"Microservice/src/main/java/"+packageName.replaceAll(".","/")+"/";

				zip.file(folderName+className+"Starter.java", _this.getMainClass(className, packageName, device.name));
				zip.file(folderName+className+"Actuator.java", _this.getActuatorClass(className, packageName, device.operations));
				//zip.file(folderName+"results/"+className+"Result.java", _this.getResultClass(className, packageName));
				zip.file(className+"Microservice/src/main/resources/application.yml", _this.getResourceFile(device.name,"808"+(index+1)));
				zip.file(className+"Microservice/build.gradle",_this.getBuildGradle(className, packageName));
		
				if(fragments!=null) zip.file(className+"Microservice/src/main/resources/fragments/"+composition+"/"+className.toLowerCase()+".bpmn",fragments[className.toLowerCase()].xml);
			}
		});
		
		zip.generateAsync({type: "blob"}).then(function(content) {
		  FileSaver.saveAs(content, "iotDeviceMicroservices.zip");
			})
	

	}

	getMainClass(className, packageName, deviceName){
		
		var mainClass='package '+packageName+';\r\n\r\n';

		mainClass+='import org.springframework.boot.SpringApplication;\r\n';
		mainClass+='import org.springframework.boot.autoconfigure.SpringBootApplication;\r\n';
//		mainClass+='import org.springframework.cloud.client.discovery.EnableDiscoveryClient;\r\n';
		mainClass+='import es.upv.pros.pvalderas.iotcompositioncoordinator.annotations.IoTCompositionCoordinator;\r\n\r\n';

//		mainClass+='@EnableDiscoveryClient\r\n';
		mainClass+='@SpringBootApplication(scanBasePackages = {"'+packageName+'","es.upv.pros.pvalderas.iotcompositioncoordinator"})\r\n';
		mainClass+='@IoTCompositionCoordinator(name="'+deviceName+'",serviceAPIClass='+className+'Actuator.class)\r\n';
		mainClass+='public class '+className+'Starter {\r\n';
		mainClass+='	public static void main(String[] args) {\r\n';
		mainClass+='		SpringApplication.run('+className+'Starter.class, args);\r\n';
		mainClass+='	}\r\n';
		mainClass+='}'; 
	
		return mainClass;
	}

	getActuatorClass(className, packageName, operations){
		var _this=this;
		var http=false, mqtt=false;
		operations.forEach(function(operation,index){
			if(operation.type==HTTP) http=true;
			else if (operation.type==MQTT) mqtt=true;
		});

		var actuatorClass='package '+packageName+';\r\n\r\n';

		actuatorClass+='import org.springframework.beans.factory.annotation.Autowired;\r\n';
		actuatorClass+='import org.springframework.stereotype.Component;\r\n';
		if(http){ 
			actuatorClass+='import org.springframework.web.client.RestTemplate;\r\n';
			actuatorClass+='import org.springframework.boot.web.client.RestTemplateBuilder;\r\n';
			actuatorClass+='import org.springframework.context.annotation.Bean;\r\n';
		}
		actuatorClass+='import es.upv.pros.pvalderas.iotcompositioncoordinator.annotations.Actuation;\r\n';
		actuatorClass+='import es.upv.pros.pvalderas.iotcompositioncoordinator.annotations.Actuator;\r\n';
		if(mqtt) actuatorClass+='import es.upv.pros.pvalderas.iotcompositioncoordinator.messagebroker.MQTTClient;\r\n';
		actuatorClass+='import '+packageName+'.results.'+className+'Result;\r\n\r\n';

		actuatorClass+='@Component\r\n@Actuator\r\npublic class '+className+'Actuator {\r\n\r\n';
		
		if(mqtt){
			actuatorClass+='	@Autowired\r\n';
			actuatorClass+='	private MQTTClient mqttClient;\r\n\r\n';
		}
		if(http){
			actuatorClass+='	@Autowired\r\n';
			actuatorClass+='	private RestTemplate restClient;\r\n';
			actuatorClass+='	@Bean\r\n';
			actuatorClass+='	public RestTemplate restTemplate(RestTemplateBuilder builder) {\r\n';
	  		actuatorClass+='		return builder.build();\r\n';
			actuatorClass+='	}\r\n\r\n';
		}
		operations.forEach(function(operation,index){

			var type, typeClass;
			switch(operation.dataType){
				case "String": typeClass="String.class";break;
				case "Numeric": typeClass="Number.class";break;
			}
			type=typeClass.substring(0,typeClass.length-6);
			
			actuatorClass+='	@Actuation (name="'+operation.name+'",\r\n';
			actuatorClass+='				resultType='+typeClass+',\r\n';
			actuatorClass+='				description="'+operation.description+'")\r\n';
			/*actuatorClass+='	@RequestMapping(value="/'+operation.name.replaceAll(" ","/").toLowerCase()+'",\r\n';
			if(operation.method)
				actuatorClass+='					method=RequestMethod.'+operation.method.toUpperCase()+',\r\n';
			else
				actuatorClass+='					method=RequestMethod.GET,\r\n';
			actuatorClass+='					produces="application/json")\r\n';*/
			actuatorClass+='	public '+type+' '+operation.name+'(){\r\n';
			if(operation.type==HTTP){
				switch(operation.method.toLowerCase()){
					case "get": 
	   							actuatorClass+='		'+type+' result=restClient.getForObject("'+operation.url+':'+operation.port+'", '+typeClass+');\r\n';
	   							actuatorClass+='		//Process result if needed\r\n';
	   							actuatorClass+='		return result;\r\n';
								break;
				}
			}else{
				actuatorClass+='		String broker="'+operation.url+'";\r\n';
				actuatorClass+='		Integer port='+operation.port+';\r\n';
				actuatorClass+='		String topic="'+operation.topic+'";\r\n';
				actuatorClass+='		mqttClient.config(broker, port);\r\n';
				actuatorClass+='		'+type+' message=mqttClient.getMessage(topic, '+typeClass+');\r\n';
				actuatorClass+='		//Process result if needed\r\n';
				actuatorClass+='		return result;\r\n';
			}
			
			actuatorClass+='	}\r\n\r\n';
		});
		actuatorClass+='}';

		return actuatorClass;
	}

	getResultClass(className, packageName){
		var resultClass='package '+packageName+'.results;\r\n\r\n';

		resultClass+='import org.json.JSONObject;\r\n\r\n';

		resultClass+='public class '+className+'Result {\r\n\r\n';
		resultClass+='		//Getters and Setters\r\n\r\n';

		resultClass+='		public static '+className+'Result parseJSON(String json){\r\n';
		resultClass+='			JSONObject objJSON=new JSONObject(json);\r\n';
		resultClass+='			'+className+'Result obj=new '+className+'Result();\r\n';
		resultClass+='			// Parse JSON to create Java object\r\n';
		resultClass+='			return obj;\r\n';
		resultClass+='		}\r\n\r\n';

		resultClass+='		public String toJSON(){\r\n';
		resultClass+='			JSONObject json=new JSONObject();\r\n';
		resultClass+='			// Create JSON from Java object\r\n';
		resultClass+='			return json.toString();\r\n';
		resultClass+='		}\r\n\r\n';
		resultClass+='}';

		return resultClass;
	}

	getResourceFile(deviceName, port){
		var resourceFile='spring:\r\n';
  		resourceFile+='  application:\r\n';
  		resourceFile+='    name: '+deviceName+'\r\n\r\n';
    
  		resourceFile+='server:\r\n';
  		resourceFile+='  port: '+port+'\r\n';
  		resourceFile+='  ip: 127.0.0.1\r\n\r\n';
    
  		resourceFile+='composition:\r\n';
 		resourceFile+='  messagebroker:\r\n';
  		resourceFile+='    type: rabbitmq\r\n';
   		resourceFile+='    host: 172.23.180.72\r\n';
    	resourceFile+='    port: 5672\r\n';
    	resourceFile+='    user: microservice\r\n';
    	resourceFile+='    password: microservice\r\n';
 /* 		resourceFile+='    host: 127.0.0.1\r\n';
  		resourceFile+='    port: 5672\r\n';
  		resourceFile+='  fragmentmanager:\r\n';
  		resourceFile+='    url: http://127.0.0.1:8083\r\n\r\n';
    
  		resourceFile+='eureka:\r\n';
  		resourceFile+='  client:\r\n';
  		resourceFile+='    defaultZone: http://127.0.0.1:2222/eureka\r\n';*/

  		return resourceFile;
	}

	getBuildGradle(className, packageName){
		var buildGradle="buildscript {\r\n";
		buildGradle+="    repositories {\r\n";
		buildGradle+="        mavenCentral()\r\n";
		buildGradle+="    }\r\n";
		buildGradle+="    dependencies {\r\n";
		buildGradle+="        classpath('org.springframework.boot:spring-boot-gradle-plugin:1.5.9.RELEASE')\r\n";
		buildGradle+="    }\r\n";
		buildGradle+="}\r\n\r\n";


		buildGradle+="apply plugin: 'eclipse'\r\n";
		buildGradle+="apply plugin: 'org.springframework.boot'\r\n";
		buildGradle+="apply plugin: 'java'\r\n";
		buildGradle+="apply plugin: 'maven'\r\n\r\n";


		buildGradle+="allprojects {\r\n";
		buildGradle+=" 	repositories {\r\n";
		buildGradle+="	    mavenCentral()\r\n";
		buildGradle+="	    maven { url 'https://jitpack.io' }\r\n";
		buildGradle+="	 }\r\n";
		buildGradle+="}\r\n\r\n";

		buildGradle+="dependencyManagement {\r\n";
		buildGradle+="	imports {\r\n";
		buildGradle+="		mavenBom 'org.springframework.cloud:spring-cloud-dependencies:Edgware.RELEASE'\r\n";
		buildGradle+="	}\r\n";
		buildGradle+="}\r\n\r\n";

		buildGradle+="sourceCompatibility = 1.8\r\n";
		buildGradle+="targetCompatibility = 1.8\r\n\r\n";

		buildGradle+="dependencies {\r\n";
		buildGradle+="    compile 'org.springframework.boot:spring-boot-starter-web'\r\n";
		//buildGradle+="    compile 'org.springframework.cloud:spring-cloud-starter-eureka'\r\n";
		//buildGradle+="    compile 'com.github.pvalderas.microservices-composition-infrastructure:CompositionCoordinator:-SNAPSHOT'\r\n";
		buildGradle+="    compile project(':IoTCompositionCoordinator')";
		buildGradle+="}\r\n\r\n";

		buildGradle+="jar{\r\n";
		buildGradle+="	manifest {\r\n";
		buildGradle+="        attributes 'Main-Class': '"+packageName+"."+className+"Starter'\r\n";
		buildGradle+="    }\r\n";
		buildGradle+="    baseName = '"+packageName+"'\r\n";
		buildGradle+="    version =  '0.1.0'\r\n";
		buildGradle+="}\r\n";

		return buildGradle;
	}


	downloadFloWareMicroservices(){
		var composition=localStorage.getItem("selectedSystem");
		//var managerUrl=localStorage.getItem("managerUrl");
		//var url=managerUrl+(managerUrl.charAt(managerUrl.length-1)=="/"?"":"/")+"fragments";

		//var url="http://172.23.180.72:8083/fragments";
		var url="http://pedvalar.webs.upv.es/floWareSystem/fragmentManager.php";

	   	const definitions=this.modeler.get('canvas').getRootElement().businessObject.$parent;
	   	definitions.id=composition;
	   	definitions.name=composition;

	   	var deviceNames=[];
	   	this.modeler.get('canvas').getRootElement().businessObject.participants.forEach(function(participant,index){
	   		if(participant.processRef){
	   			participant.processRef.laneSets[0].lanes.forEach(function(lane, index){
	   				if(lane.name && lane.name.trim().length>0) deviceNames.push(lane.name);
	   			});
	   		}

	   	});

	   	var eurekaReg=JSON.parse(sessionStorage.getItem("devices"));
	   	var devices=eurekaReg.applications.application;

	   	if(deviceNames.length>0 && devices.length>0){
		
			var _this=this;

			this.modeler.saveXML({ format: true }, function(err, xml) {
				if (err) {
					showMessage("Error","Could not save BPMN 2.0 diagram");
					return console.error('Could not save BPMN 2.0 diagram', err);
				}
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 5000);
				fetch(url,{
					 		method:'POST',
					 		/*headers:{
								"Content-Type":"application/json",
							},*/
					 		body: JSON.stringify({"id":composition,"name":composition, "xml":xml}),
					 		signal: controller.signal
			 		})
				.then(function (response) {
				        return response.json()
				    })
			    .then(fragments => {
			    	_this.generateMicroservices(composition, deviceNames, fragments, devices);
			    	//document.getElementById(loader).style.display = "none";
			    	
			    })
			    .catch(err => {
			    	console.log(err);
			        showMessage("Attention","BPMN Fragment Manager is not available. Note that only Java code is generated and BPMN fargments are ommited. Please, contact <a href='mailto:pvalderas@dsic.upv.es'>pvalderas</a>.");
			    	_this.generateMicroservices(composition, deviceNames, null, devices);
			    })
			})
		}else{
			if(deviceNames.length==0) showMessage("Attention","There are not IoT Devices to be exported.");
			if(devices.length==0) showMessage("Attention","The system that supports this process is not loaded.");
		}
	}
}

 