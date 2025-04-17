export default class DataObject{

	getInputs(element){
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
}