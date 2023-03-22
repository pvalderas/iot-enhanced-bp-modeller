import ReactDOM from 'react-dom';
import React from 'react';

import Menu from './Menu';


export default class MenuPanel {

  constructor(options) {

    const {
      modeler,
      container
    } = options;

    ReactDOM.render(
      <Menu modeler={ modeler } />,
      container
    );
  }
}
