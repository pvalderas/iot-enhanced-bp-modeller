import React, { Component } from 'react';

export default class MenuOption extends Component {

  constructor(props) {
    super(props);
  }

  render() {
	  	if(this.props.items!=undefined){
	  		const subItems=this.props.items.map((item, index) => {

	  					if(item.id=="separator"){
	  						return (<div className="dropdown-divider" key={index} id={index}></div>)
						}else if(item.click!=undefined){
							return (<a className="dropdown-item" href="#" key={item.id} id={item.id} onClick={item.click}>{item.label}</a>)
						}	
		        	}
		    );
		    return(
		  		<li className="nav-item dropdown" >
			        <a className="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
			       		 id={this.props.id}>
			         {this.props.label}
			         </a>
			        <div className="dropdown-menu" aria-labelledby="navbarDropdown">{subItems}</div>
		     	</li>
		    );
	  	}else{
	  		return(
			  	<li className="nav-item" >
				    <a className="nav-link" href="#"  
				    		onClick={this.props.click} id={this.props.id} key={this.props.id}>
				     {this.props.label}
				    </a>
			  	</li>
			);
		}
	  }
 }