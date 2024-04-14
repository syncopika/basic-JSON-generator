// TODO: option for uploading a json file 

var count = 0;
var currentObjEdit; // This will hold the number id of the object being edited 

// Important!! this is the array that will hold all the objects
var JSONarray = [];

// Make new key-value pair
function addNewPair(){
	var options = document.getElementById('options');
	
	// Create new pair
	var pair = document.createElement('div');
	pair.className = "aside__pair pair";
	options.appendChild(pair); // Append new pair to #options
	var latestOption = options.childNodes[options.childNodes.length-1]; // Now get that new #pair div
	
	// Create key area
	var pairKey = document.createElement('div');
	pairKey.className = 'keyArea';
	
	// Add new label for pairKey, as well as a new input
	var newKeyLabel = document.createElement('label');
	newKeyLabel.textContent = 'key: ';
	
	latestOption.appendChild(pairKey);
	latestOption.childNodes[0].appendChild(newKeyLabel);
	
	// Append new input text for key
	var newInput = document.createElement('input');
	newInput.className = "aside__textInput key";
	newInput.type = "text";
	newInput.placeholder = "key";
	latestOption.childNodes[0].appendChild(newInput);
	
	// Create value area
	var valueArea = document.createElement('div');
	valueArea.className = 'valueArea';
	
	// Add new label for valueArea, as well as a new input
	var newValueLabel = document.createElement('label');
	newValueLabel.textContent = 'value: ';

	// Append value label to value area
	valueArea.appendChild(newValueLabel);
	
	// Append value area
	latestOption.appendChild(valueArea);

	// Append new input text for value
	var newValue = document.createElement('input');
	newValue.className = "aside__textInput value";
	newValue.placeholder = "value";
	valueArea.appendChild(newValue);
}



/***

	takes the input for the key and value text areas and adds the key-value pairs to the JSON object 

***/
function addToJSON(){
	// Prevent adding a blank object!
	// if any key fields are blank, simply return and don't do anything 
	// for input elements, skip the first one since it's for naming the file to save
	// the rest will correspond to key names 
	// it's okay to allow for values to be empty

	var asideInputElements = document.querySelectorAll(".aside__textInput");
	for(var i = 1; i < asideInputElements.length; i++){
		if(asideInputElements[i].value === ""){
			alert("All input should have a value");
			return;
		}
	}

	// Look through all key-value pair children in #options
	var children = document.getElementById('options').childNodes;
	var newObject = {};

	for (var i = 0; i < children.length; i++) {
		var key;
		var value;
		if (children[i].className === "aside__pair pair") { 
			// note!! these indices (the 3 and 1) are specific to this implementation. it seems like for children nodes,
			// elements are separated by a 'text' node. so i.e. 
			// for #pair, there is a div and a text area. but the child nodes for #pair are actually text, div, text, textarea. 
			// this is only true for the first div though because every other pair is inserted into the DOM dynamically! see this:
			// https://stackoverflow.com/questions/24589908/childnode-of-li-element-gives-text-ul-ul-text           
			
			
			for(var j = 0; j < children[i].childNodes.length; j++){
				if (children[i].childNodes[j].className === "keyArea"){
					// Get key
					key = children[i].childNodes[j].querySelector('.aside__textInput.key').value;
					// console.log("Key:", key);
				} 
				if(children[i].childNodes[j].className === "valueArea"){
					// Get value
					value = children[i].childNodes[j].querySelector('.aside__textInput.value').value;
					// console.log("Value:", value);
				}
			}
			newObject[key] = value;
		}
	}
	console.log({	newObject	});
	
	// Push new object as a string to JSONarray
	JSONarray.push(JSON.stringify(newObject));
	// Show new object in designated area
	addObjectToDisplay(newObject);
	count++;
	// Clear data
	clearData();
}


function clearData(){
	var children = document.getElementById('options').childNodes;
	
	for(var i = 0; i < children.length; i++){	
		if(children[i].className === "aside__pair pair"){
			for(var j = 0; j < children[i].childNodes.length; j++){
				// if (children[i].childNodes[j].className === "keyArea"){
				// 	// Clear key
				// 	key = children[i].childNodes[j].querySelector('.aside__textInput.key').value;
				// } 
				
				// }
				if(children[i].childNodes[j].className === "valueArea"){
					// Clear value
					children[i].childNodes[j].querySelector('.aside__textInput.value').value = '';
				}
			}
		}
	}
	hideSave();
}

function addObjectToDisplay(object){
	var displayArea = document.getElementById("currentObjects");
	var newObj = document.createElement("div");
	newObj.className = "jsonObjects";
	newObj.id = count + "pair";
	
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

	// Add a container div for edit and delete buttons
	var buttonsContainer = document.createElement('div');
	buttonsContainer.className = "buttonsContainer";
	latestObj.appendChild(buttonsContainer);

	// Add delete button
	var del = document.createElement('p');
	del.textContent = "Delete";
	del.className = "delete";
	del.style.display = "inline-block";
	buttonsContainer.appendChild(del);
	deleteObject(del);
	
	// Add edit button 
	var edit = document.createElement('p');
	edit.textContent = "Edit";
	edit.className = "edit";
	edit.style.display = "inline-block";
	buttonsContainer.appendChild(edit);
	editObject(edit);
	
	var breakLine = document.createElement('hr');
	latestObj.appendChild(breakLine);
}


// this code allows the 'keys' to be clickable, and to display their corresponding values when clicked.
// this is needed in the "current objects in JSON" area
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
	
	// Edit the JSONarray a bit to format it nicely for the json document
	var newArr = "[\n"; //add an opening square bracket and newline
	newArr += JSONarray.join(",\n"); //line break after each object in the array
	newArr += "\n]";
	
	// Make blob from JSONarray
	var blob = new Blob([newArr], {type: "application/json"});
	// Make a url for that blob
	var url = URL.createObjectURL(blob);
	
	var link = document.createElement('a');
	link.href = url; //link the a element to the blob's url
	link.download = fileName + ".json";
	
	// Then simulate a click to the blob url to initiate download
	link.click();
}

// Allow deletion of an object - bind this to a click event on 'delete'
// dynamically adds a delete option
function deleteObject(element){

	element.addEventListener('click', function(e){
		// Get the parent node and tag it for deletion
		var parent = element.parentElement.parentElement;
		parent.id = "deleteTag";
		
		// Look at the text content for the sibling elements and find
		// The match in the JSONarray
		var siblings = element.parentNode.childNodes;
		var keyToFind;
		var valueToFind;
		
		// Subtract 1 to account for the 'delete' element 
		for(var i = 0; i < siblings.length - 1; i++){
			if(siblings[i].className === "theKey"){
				keyToFind = siblings[i].textContent;
			}else if(siblings[i].className.split(" ")[0] === "theValue"){
				valueToFind = siblings[i].textContent;
			}
		}
		
		// Find and delete in JSONarray
		for(var j = 0; j < JSONarray.length; j++){
			var match1 = JSONarray[j].match(keyToFind) !== null;
			var match2 = JSONarray[j].match(valueToFind) !== null;
			if(match1 && match2){
				JSONarray.splice(j, 1);
				break;
			}
		}
		
		// Then delete entry from #currentObjects
		var nodeToDelete = document.getElementById("deleteTag");
		parent.parentNode.removeChild(nodeToDelete);
		count--;
		
		// Now rename pair div ids so that their numbers correspond to their index in JSONarray
		var pairIds = document.querySelectorAll("[id*='pair']");
		for(var i = 0; i < pairIds.length; i++){
			pairIds[i].id = i + 'pair';
		}
	});

}


// Be able to edit an existing object in the set
// dynamically adds an edit option, just like deletteObject
function editObject(element){

	// Display save? button
	var saveButton = document.querySelector(".save");
	
	// This creates the edit option 
	element.addEventListener('click', function(e){
		
		saveButton.style.display = "block";
		
		// These are the nodes that display the key-value pairs after the <hr> 
		var siblings = element.parentNode.childNodes;
		
		// These are the nodes for the input text boxes
		var inputArea = document.getElementById('options').childNodes;
		
		// Tag the save button with the number of the current object being edited
		currentObjEdit = parseInt(element.parentNode.parentNode.id);
		saveButton.id = currentObjEdit + "save";
		
		// Remove any previous "editing # object..."
		if(document.getElementById('whichObject')){
			document.getElementById('whichObject').remove();
		}
		
		// Show user which object in JSONarray they are editing
		var whichObject = document.createElement('p');
		whichObject.id = 'whichObject';
		whichObject.textContent = "now editing: object " + currentObjEdit + " ...";
		var options = document.getElementById('options');
		options.appendChild(whichObject);
		
		// Need a counter here because the siblings array is arranged differently from inputArea array
		var siblingsCounter = 1; 
		
		for(var i = 1; i < inputArea.length; i++){
			
			// Make sure a div.pair is being targeted (sometimes a text node appears)
			var validPair = (inputArea[i].className === "aside__pair pair");
	
			if(i === 1 && validPair){
				// Extra child nodes again...
				inputArea[i].childNodes[3].value = siblings[siblingsCounter].textContent; 
				siblingsCounter += 2;
			}else if(validPair){
				inputArea[i].childNodes[1].value = siblings[siblingsCounter].textContent; 
				siblingsCounter += 2;
			}
		}	
	});
}

// Save function
function saveNewData(id){

	var indexToEdit = parseInt(id);
	// Console.log(indexToEdit);
	// These are the input fields with the edited data
	var children = document.getElementById('options').childNodes; 
	
	// Edit the display with the new info
	var infoDisplay = document.getElementById('currentObjects').childNodes;
	var index = indexToEdit; //offset by 1st text node in the above childNodes
	var infoDisplayCounter = 0;
	
	// Edit the object in JSONarray
	for (var i = 0; i < children.length; i++) {
		var key;
		var value;
		if (children[i].className === "aside__pair pair") {
			for (var j = 0; j < children[i].childNodes.length; j++) {
				if (children[i].childNodes[j].className === "keyArea") {
					// Get key
					key = children[i].childNodes[j].querySelector('.aside__textInput.key').value;
				}
				if(children[i].childNodes[j].className === "valueArea"){
					// Get value
					value = children[i].childNodes[j].querySelector('.aside__textInput.value').value;
				}
			}
			var tempObject = JSON.parse(JSONarray[indexToEdit]);
			tempObject[key] = value;
			JSONarray[indexToEdit] = JSON.stringify(tempObject);
			
			// Edit displayed info
			infoDisplay[index].childNodes[infoDisplayCounter*2].textContent = key;
			infoDisplay[index].childNodes[infoDisplayCounter*2 + 1].textContent = value;
			infoDisplayCounter++;
		}
	}
	
	// Hide the save button after editing 
	hideSave();
}

// Hide save button
function hideSave(){
	var save = document.querySelector('.save');
	save.style.display = 'none';
	
	if(document.getElementById('whichObject')){
		document.getElementById('whichObject').remove();
	}
}