import inherits from 'inherits';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import ReplaceMenuProvider from 'bpmn-js/lib/features/popup-menu/ReplaceMenuProvider';

export default function CustomReplaceMenuProvider() {

}

inherits(CustomReplaceMenuProvider, ReplaceMenuProvider);


const _getEntries = ReplaceMenuProvider.prototype.getEntries;

ReplaceMenuProvider.prototype.getEntries = function (element) {
    const entries = _getEntries.apply(this, [element]);

	let isIoT=false;
    if(is(element, 'bpmn:Task') && 
         element.businessObject.lanes && element.businessObject.lanes[0] &&
         element.businessObject.lanes[0].extensionElements!=null && element.businessObject.lanes[0].extensionElements.values){

    	isIoT=element.businessObject.lanes[0].extensionElements.values.some(function(field){
            return field.name=="iot" && (field.stringValue==true || field.stringValue=="true");
        });
        
    }

    if(isIoT){
            return  entries.filter(elem=> elem.label=='Service Task' );
    
    }else{
            return  entries;
    }
}

