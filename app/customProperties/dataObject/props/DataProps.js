import { TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

export default function(element) {

  return [
    {
      id: 'propName',
      element,
      component: PropName,
      isEdited: isTextFieldEntryEdited
    }
  ];
}

function PropName(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const getValue = () => {
    return element.businessObject.spell || '';
  }

  const setValue = value => {
    return modeling.updateProperties(element, {
      propName: value
    });
  }

  return <TextFieldEntry
    id={ id }
    element={ element }
    description={ translate('Name of the property') }
    label={ translate('Name') }
    getValue={ getValue }
    setValue={ setValue }
    debounce={ debounce }
  />
}

