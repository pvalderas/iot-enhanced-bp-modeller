export default class FloWarePIM{

	constructor(pim) {
		this.pim=pim;

		this.getRoot=this.getRoot.bind(this);
		this.getFirtLevelNodes=this.getFirtLevelNodes.bind(this);
		this.getParent=this.getParent.bind(this);
		this.getDirectSons=this.getDirectSons.bind(this);
		this.getLeaveSons=this.getLeaveSons.bind(this);
		this.getBranchElements=this.getBranchElements.bind(this);
	}

	getRoot(){
		var root=null;
		this.pim.forEach(function(element){

			if(element.Parent==undefined){
				root=element;
				return;
			}

		});

		return root;
	}

	getFirtLevelNodes(){
		var root=getRoot();
		var elements=[];
		this.pim.forEach(function(element){

			if(element.Parent==root.ID){
				elements.push(element);
			}

		});

		return elements;
	}

	getParent(element){
		var parentElement=null;
		this.pim.forEach(function(parent, index){

			if(parent.ID==element.Parent){
				parentElement=parent;
				return;
			}

		});

		return parentElement;
	}

	getDirectSons(parent){
		var sons=[];
		this.pim.forEach(function(element, index){

			if(element.Parent==parent.ID){
				sons.push(element);
			}

		});
		return sons;
	}

	getLeaveSons(element){
		var sons=[];
		var _this=this;
		var directSons=this.getDirectSons(element);
		if(directSons.length==0) sons.push(element);
		else{
			directSons.forEach(function(son){
				sons.push(..._this.getLeaveSons(son));
			});
		}
		return sons;
	}

	getBranchElements(element){
		var parent=this.getParent(element);
		var elements=[];
		while(parent.Parent!=undefined){
			elements.push(parent);
			parent=this.getParent(parent);
		}
		return elements;
	}
}