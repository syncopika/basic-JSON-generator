// TODO: option for uploading a json file 

var count = 0;
var currentObjEdit; //this will hold the number id of the object being edited 

//important!! this is the array that will hold all the objects
var JSONarray = [];

//make new key-value pair
function addNewPair(){
	var options = document.getElementById('options');
	
	//create new pair
	var pair = document.createElement('div');
	pair.className = "pair";
	
	//append new pair to #options
	options.appendChild(pair);
	
	//now get that new #pair div
	var latestOption = options.childNodes[options.childNodes.length-1];
	
	var pairKey = document.createElement('div');
	pairKey.className = 'keyArea';
	
	//add new label for pairKey, as well as a new input
	var newLabel = document.createElement('label');
	newLabel.textContent = 'key name: ';
	
	latestOption.appendChild(pairKey);
	latestOption.childNodes[0].appendChild(newLabel);
	
	//append new input text
	var newInput = document.createElement('input');
	newInput.className = "key";
	newInput.type = "text";
	latestOption.childNodes[0].appendChild(newInput);
	
	//append newValue (textarea) to .keyArea
	var newValue = document.createElement('textarea');
	newValue.className = "value";
	latestOption.appendChild(newValue);
}

/***

	takes the input for the key and value text areas and adds the key-value pairs to the JSON object 

***/
function addToJSON(){
	
	// prevent adding a blank object!
	// if any key fields are blank, simply return and don't do anything 
	// for input elements, skip the first one since it's for naming the file to save
	// the rest will correspond to key names 
	// it's okay to allow for values to be empty
	var allInputElements = document.getElementsByTagName("input");
	for(var i = 1; i < allInputElements.length; i++){
		if(allInputElements[i].value === ""){
			return;
		}
	}
	
	//look through all key-value pair children in #options
	var children = document.getElementById('options').childNodes;
	var newObject = {};
	
	for(var i = 0; i < children.length; i++){
		
		if(children[i].className === "pair"){			

			// note!! these indices (the 3 and 1) are specific to this implementation. it seems like for children nodes,
			// elements are separated by a 'text' node. so i.e. 
			// for #pair, there is a div and a text area. but the child nodes for #pair are actually text, div, text, textarea. 
			// this is only true for the first div though because every other pair is inserted into the DOM dynamically! see this:
			// https://stackoverflow.com/questions/24589908/childnode-of-li-element-gives-text-ul-ul-text
			var key;
			var keyValue;
			for(var j = 0; j < children[i].childNodes.length; j++){

				if(children[i].childNodes[j].className === "keyArea"){
					
					//get key
					if(i === 1){
						key = (children[i].childNodes[j].childNodes[3]).value;
					}else{
						key = (children[i].childNodes[j].childNodes[1]).value;
					}
				
				}else if(children[i].childNodes[j].className === "value"){
					//get value
					keyValue = children[i].childNodes[j].value;
				}
			}
			newObject[key] = keyValue;
		}
	}
	//important to stringify here!
	JSONarray.push(JSON.stringify(newObject));
	
	//show new object in designated area
	addObjectToDisplay(newObject);
	count++;
	
	//console.log(newObject);
	clearData();
}

function clearData(){
	var children = document.getElementById('options').childNodes;
	
	for(var i = 0; i < children.length; i++){	
		if(children[i].className === "pair"){
			for(var j = 0; j < children[i].childNodes.length; j++){
				if(children[i].childNodes[j].className === "keyArea"){
				/* don't clear the keys for a new object?
					//clear key
					if(i === 1){
						(children[i].childNodes[j].childNodes[3]).value = '';
					}else{
						(children[i].childNodes[j].childNodes[1]).value = '';
					}
				*/
				}else if(children[i].childNodes[j].className === "value"){
					//clear value
					children[i].childNodes[j].value = '';
				}
			}
		}
	}
	hideSave();
}

function addObjectToDisplay(object){
	
	var newObj = document.createElement("div");
	newObj.id = count + "pair";
	
	var displayArea = document.getElementById("currentObjects");
	
	//append the new div first, then add the stuff inside
	displayArea.appendChild(newObj);
	
	var latestObj;
	for(property in object){
		
		var key = document.createElement('p');
		key.className = "theKey";
		key.textContent = property;
		attachClickHandler(key);
		
		var keyValue = document.createElement('p');
		keyValue.className = "theValue hidden";
		keyValue.textContent = object[property];
		
		latestObj = displayArea.childNodes[displayArea.childNodes.length - 1];
		latestObj.appendChild(key);
		latestObj.appendChild(keyValue);
	}
	//add delete option
	var del = document.createElement('p');
	del.textContent = "delete";
	del.className = "delete";
	del.style.display = "inline-block";
	latestObj.appendChild(del);
	deleteObject(del);
	
	//add edit option 
	var edit = document.createElement('p');
	edit.textContent = "edit";
	edit.className = "edit";
	edit.style.display = "inline-block";
	edit.style.padding = '0 0 0 8px';
	edit.style.color = "#007f01";
	latestObj.appendChild(edit);
	editObject(edit);
	
	var breakLine = document.createElement('hr');
	latestObj.appendChild(breakLine);

}


//this code allows the 'keys' to be clickable, and to display their corresponding values when clicked.
//this is needed in the "current objects in JSON" area
function attachClickHandler(element){
	element.addEventListener("click", function(e){
		if(element.nextSibling.className === 'theValue hidden'){
			element.nextSibling.style.display = 'block';
			element.nextSibling.className = "theValue show";
		}else{
			element.nextSibling.style.display = 'none';
			element.nextSibling.className = "theValue hidden";
		}
	});
}

//make the JSON object downloadable!! 
function getJSON(){
	var fileName = document.getElementById("fileName").value;
	
	if(fileName === ""){
		alert("No name was entered!");
		return;
	}
	
	//edit the JSONarray a bit to format it nicely for the json document
	var newArr = "[\n"; //add an opening square bracket and newline
	newArr += JSONarray.join(",\n"); //line break after each object in the array
	newArr += "\n]";
	
	//make blob from JSONarray
	var blob = new Blob([newArr], {type: "application/json"});
	//make a url for that blob
	var url = URL.createObjectURL(blob);
	
	var link = document.createElement('a');
	link.href = url; //link the a element to the blob's url
	link.download = fileName + ".json";
	
	//then simulate a click to the blob url to initiate download
	link.click();
}

// allow deletion of an object - bind this to a click event on 'delete'
// dynamically adds a delete option
function deleteObject(element){

	element.addEventListener('click', function(e){
		//get the parent node and tag it for deletion
		var parent = element.parentElement;
		parent.id = "deleteTag";
		
		//look at the text content for the sibling elements and find
		//the match in the JSONarray
		var siblings = element.parentNode.childNodes;
		var keyToFind;
		var valueToFind;
		
		//subtract 1 to account for the 'delete' element 
		for(var i = 0; i < siblings.length - 1; i++){
			if(siblings[i].className === "theKey"){
				keyToFind = siblings[i].textContent;
			}else if(siblings[i].className.split(" ")[0] === "theValue"){
				valueToFind = siblings[i].textContent;
			}
		}
		
		//find and delete in JSONarray
		for(var j = 0; j < JSONarray.length; j++){
			var match1 = JSONarray[j].match(keyToFind) !== null;
			var match2 = JSONarray[j].match(valueToFind) !== null;
			if(match1 && match2){
				JSONarray.splice(j, 1);
				break;
			}
		}
		
		//then delete entry from #currentObjects
		var nodeToDelete = document.getElementById("deleteTag");
		parent.parentNode.removeChild(nodeToDelete);
		count--;
		
		//now rename pair div ids so that their numbers correspond to their index in JSONarray
		var pairIds = document.querySelectorAll("[id*='pair']");
		for(var i = 0; i < pairIds.length; i++){
			pairIds[i].id = i + 'pair';
		}
		//console.log(pairIds);
	});

}


// be able to edit an existing object in the set
// dynamically adds an edit option, just like deletteObject
function editObject(element){

	//display save? button
	var saveButton = document.querySelector(".save");
	
	//this creates the edit option 
	element.addEventListener('click', function(e){
		
		saveButton.style.display = "block";
		
		//these are the nodes that display the key-value pairs after the <hr> 
		var siblings = element.parentNode.childNodes;
		
		//these are the nodes for the input text boxes
		var inputArea = document.getElementById('options').childNodes;
		
		//tag the save button with the number of the current object being edited
		currentObjEdit = parseInt(element.parentNode.id);
		saveButton.id = currentObjEdit + "save";
		
		//remove any previous "editing # object..."
		if(document.getElementById('whichObject')){
			document.getElementById('whichObject').remove();
		}
		
		//show user which object in JSONarray they are editing
		var whichObject = document.createElement('p');
		whichObject.id = 'whichObject';
		whichObject.textContent = "now editing: object " + currentObjEdit + " ...";
		var options = document.getElementById('options');
		options.appendChild(whichObject);
		
		//need a counter here because the siblings array is arranged differently from inputArea array
		var siblingsCounter = 1; 
		
		for(var i = 1; i < inputArea.length; i++){
			
			//make sure a div.pair is being targeted (sometimes a text node appears)
			var validPair = (inputArea[i].className === "pair");
	
			if(i === 1 && validPair){
				//extra child nodes again...
				inputArea[i].childNodes[3].value = siblings[siblingsCounter].textContent; 
				siblingsCounter += 2;
			}else if(validPair){
				inputArea[i].childNodes[1].value = siblings[siblingsCounter].textContent; 
				siblingsCounter += 2;
			}
		}	
	});
}

//save function
function saveNewData(id){

	var indexToEdit = parseInt(id);
	//console.log(indexToEdit);
	//these are the input fields with the edited data
	var children = document.getElementById('options').childNodes; 
	
	//edit the display with the new info
	var infoDisplay = document.getElementById('currentObjects').childNodes;
	var index = indexToEdit + 1; //offset by 1st text node in the above childNodes
	var infoDisplayCounter = 0;
	
	//edit the object in JSONarray
	for(var i = 0; i < children.length; i++){
		
		if(children[i].className === "pair"){			
			var key;
			var keyValue;
			for(var j = 0; j < children[i].childNodes.length; j++){
				if(children[i].childNodes[j].className === "keyArea"){
					//get key
					if(i === 1){
						key = (children[i].childNodes[j].childNodes[3]).value;
					}else{
						key = (children[i].childNodes[j].childNodes[1]).value;
					}
				}else if(children[i].childNodes[j].className === "value"){
					//get value
					keyValue = children[i].childNodes[j].value;
				}
			}
			var tempObject = JSON.parse(JSONarray[indexToEdit]);
			tempObject[key] = keyValue;
			JSONarray[indexToEdit] = JSON.stringify(tempObject);
			
			//edit displayed info
			infoDisplay[index].childNodes[infoDisplayCounter*2].textContent = key;
			infoDisplay[index].childNodes[infoDisplayCounter*2 + 1].textContent = keyValue;
			infoDisplayCounter++;
		}
	}
	
	// hide the save button after editing 
	hideSave();
}

//hide save button
function hideSave(){
	var save = document.querySelector('.save');
	save.style.display = 'none';
	
	if(document.getElementById('whichObject')){
		document.getElementById('whichObject').remove();
	}
}
