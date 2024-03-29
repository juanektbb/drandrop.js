/**************************************
Copyright (c) 2019, Juan D. Diaz
https://github.com/juanektbb/Dragandrop

Open Source Code - Enjoy it ;)
version: 1.0.0
**************************************/

/***************************************************
        MAIN FUNCTIONALITY FOR DRAG AND DROP
***************************************************/
var oldTarget = "";
var preventBug = true;

//***** FUNCTIONALITY: SET THIS ELEMENT IS GOING TO BE DRAGGED *****//
function dragStart(ev){
    ev.dataTransfer.setData("thisDataChild", ev.target.getAttribute('data-child-box'));
    oldTarget = ev.target.parentNode;
    animateEaseIn(ev.target);
}

//***** FUNCTIONALITY: PARENT RECEIVES ITEM TO BE DROPPED *****//
function drop(ev){
    ev.preventDefault();

    this.clearResponse();
    var allowDropHeader = true;

    //GET THE ELEMENT DROPPED
    var dataChildBox = ev.dataTransfer.getData("thisDataChild");
    var draggedItem = oldTarget.querySelector("[data-child-box='" + dataChildBox +"'");

    //AMAZING LOGIC -> Dropping on a draggable will execute twice, this function changes boolean to prevent it
    if(ev.target.hasAttribute('draggable')){
        if(preventBug){
            preventBug = false;
            return false;
        }
    }

    //Set the container as its main target
    var whoIsTarget = whoIsThisTarget(ev.target);

    //IF THE TARGET TO DROP IS ANOTHER CHILD, THE DROP WILL HAPPEN TWICE, MAKING SECOND DROP ITEM TO BE NULL.
    if(draggedItem != null){

        //IF THIS DRAGGED ITEM IS A HEADER AND THE TARGET HAS A HEADER ALREADY
        if(draggedItem.hasAttribute("data-child-header") && whoIsTarget.parentNode.getAttribute('id') != 'side-container'){
            for(var i = 0; i < whoIsTarget.children.length; i++){
                if(whoIsTarget.children[i].hasAttribute("data-child-header")){
                    allowDropHeader = false;
                    break;
                }
            }
        }

        //PLACE THE DRAGGED ITEM INTO THE CONTAINER
        if(allowDropHeader){
            whoIsTarget.appendChild(draggedItem);

        //IF THE ITEM CAN NOT BE DROPPED
        }else{

            //Show error message if the actual header is different from what it is intended to drop. This discards error message for dropping same item in same box
            if(whoIsTarget.children[0].getAttribute("data-child-header") != draggedItem.getAttribute("data-child-header")){
                this.createResponse(errorThree);
            }

            this.hoverOff(whoIsTarget);
        }

    }

    preventBug = true;
}

//***** FUNCTIONALITY & STYLES: CHANGE COLOUR WHEN PASSING OVER *****//
function overDrop(ev){
    ev.preventDefault();

    //Set the container as its main target
    var whoIsTarget = whoIsThisTarget(ev.target);
    this.hoverOn(whoIsTarget);    
}

//***** STYLES: CHANGE COLOUR WHEN PASSING AWAY *****//
function leaveDrop(ev){
   ev.preventDefault();

    //Set the container as its main target
    var whoIsTarget = whoIsThisTarget(ev.target);
    this.hoverOff(whoIsTarget);
}

//***** STYLES: CHANGE COLOUR BACK WHEN DROPPING *****//
function dragEnd(ev){
    let thisElement = ev.target;
    let thisElementParent = thisElement.parentNode;

    animateEaseOut(ev.target);

    //Make parent default values
    this.hoverOff(thisElementParent);
    this.sortByAlphabet(thisElementParent);

    //If this is the side container, improve highlight
    if(theSideContainer != thisElementParent){
        this.highlightTarget(thisElementParent);
    }else{
        this.highlightTarget(thisElementParent.parentNode.parentNode);
    }

    this.highlightTarget(thisElement);
}


/*********************************************
        SORT ELEMENTS BY ITS INNERTEXT
*********************************************/
function sortByAlphabet(parent){

    let rawArray = [];
    let headersArray = [];
    let newParent = parent.cloneNode(true);
    let childrenLength = parent.children.length;
    
    //Empty the parent copy
    newParent.innerHTML = "";

    //Go through each children of the parent
    for(var i = 0; i < childrenLength; i++){

        //Append this child to the raw array for reference
        rawArray.push({
            dataChildBox: parent.children[i].getAttribute("data-child-box")
        });

    }

    //Sort the raw array by reference
    rawArray.sort((a, b) => a.dataChildBox.localeCompare(b.dataChildBox));

    //Go through the raw array
    for(var j = 0; j < rawArray.length; j++){

        var thisChild = parent.querySelector("[data-child-box='" + rawArray[j].dataChildBox + "']");

        //If this child is a header
        if(thisChild.hasAttribute("data-child-header")){

            //Find if this parent heading is repeated -> Improves side container
            var repeatedParent = parent.querySelectorAll("[data-child-box='" + rawArray[j].dataChildBox + "']");
            if(repeatedParent.length >= 2){

                //Append each of these repeated parents
                for(var k = 0; k < repeatedParent.length; k++){
                    headersArray.push(repeatedParent[k]);
                }

                //Manipulates the index as repeated items are complete
                j = j + k - 1;
                
            //If not repeated items, push to array as normal
            }else{
                headersArray.push(thisChild);
            }

            continue;
        }

        //Append to new parent 
        newParent.appendChild(thisChild);
    }

    //Empty the old parent
    parent.innerHTML = '';

    //Append each sorted child to parent
    while(newParent.firstChild){
        parent.appendChild(newParent.firstChild);
    }

    //Put the headers into the container in reverse order
    if(headersArray.length != 0){
        for(var i = headersArray.length - 1; i >= 0; i--){
            parent.insertBefore(headersArray[i], parent.firstChild);
        }
    }

}


/***********************************************
    FILL EACH CHILD BOX AND SORT BY ALPHABET
***********************************************/
function sortFill(parentID){
    let getAllParents = document.getElementsByClassName(parentID);

    //Go through all existing parents in the DOM with that class name
    for(var k = 0; k < getAllParents.length; k++){

        //All children of this particular parent
        let getAllChildren = getAllParents[k].children;

        //Populate the innerText with attribute data-child-box
        for(var i = 0; i < getAllChildren.length; i++){
            for(var j = 0; j < getAllChildren[i].children.length; j++){
                getAllChildren[i].children[j].innerText = getAllChildren[i].children[j].getAttribute("data-child-box");
            }
        }

        //Sort when is loaded
        for(var i = 0; i < getAllChildren.length; i++){
            sortByAlphabet(getAllChildren[i]);
        }

    }
}

sortFill("patches-container");
sortFill("side-container");


/**********************************************
        SUPPORT DRAG AND DROP FUNCTIONS
**********************************************/
function whoIsThisTarget(target){
    return (target.hasAttribute('draggable')) ? target.parentNode : target;
}