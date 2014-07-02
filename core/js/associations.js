/**
 * Return the indicated array, with all elements shuffled.
 */
function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function initializeAssociations() {	
	//Cues that will be presented in the association task. 
	//Second value is the cue's category, which will be written to the output file next to the associations.
	
	//Niels, Nathalie, Emma, Vincent, Bart, Thomas, Peter, An, Katrien, Nathalie
	//Mohammed, Loubna, Malika, Rachida, Rachid, Abdel, Ahmed, Samir, Fatima, Ayisha
	cue_list = [['Niels', 'vlaams'],
                ['Emma', 'vlaams'],
                ['Mohammed', 'vreemd'],
                ['Rachida', 'vreemd']];
	cue_list = shuffle(cue_list); //shuffle the cues
	association_responses = new Array(); //will hold participant's responses to the association experiment
}


/**
 * Display instructions to the task. If user clicks ok, move on to the task.
 */
function showAssoInstructions() {
	showLoadingImage();
	$.get("core/instruct_association_task.html", function(data) {
		$("#container").html(data);	//add association instructions to the screen
        
        jQuery('#instruct-asso-btn').bind('click',function(e) {
        	showAssociationTask();        	//ss clicked continue -> move on to the association task
    	});
	});
}

/**
 * Show the association task.
 */
function showAssociationTask() {	
	showLoadingImage();
	$.get("core/associations.html", function(data) {
		$('#container').html(data); //add association layout to the screen
		startAssociationTask();		//start the task!
		$("#associations__response").focus();	//focus response box
    	$("#associations__response").select();
	});
}

/**
 * Begin the association task. Runs until all cues have been given three associations by user.
 */
function startAssociationTask() {
	var cue = '';		//the cue the ss is giving associations to
	var cue_cat = '';	//category of the cue, e.g. 'local name' or 'foreign name'
	var trial_nb = 0;	//trial number; 1 .. number of cues (i.e., 3 associations to each cue are all the same trial)
	var asso_index = 1;	//1, 2, or 3, depending on whether the association is the first, second, or third association to the current cue
	
	//for each association, we'll save RT to first keypress and RT to submit
	//measured from when cue is displayed or when previous association was submitted, whichever is later
	var RT_start = -1;					 
	var RT_to_submit = -1;
	var RT_to_keypress = -1;
	var first_keypress_registered = false;
	
	jQuery('#associations__submit').bind('click',function(e) {	//triggered by 'enter' or clicking 'ok'
		if(e) e.preventDefault();								//make sure we stay on this page
		var association = $('#associations__response').val(); 		
		if (association.length <= 1) { 							//ss did not fill in anything of use
			$("#associations__error").html("Gelieve een associatie in te vullen!");	//show error message
		} else {
			$("#associations__error").html("&nbsp;"); 			//clear (any) error
			$("#associations__response").val('');				//clear response box
			processAssociation(association); 					//write away response, move on
		}		
	});
	
	$("#associations__response").keypress(function() {
		if (!first_keypress_registered) {
			first_keypress_registered = true;
			RT_to_keypress = new Date().getTime() - RT_start;
		}
	});
	
	/**
	 * Write away response, move on to next association or cue.
	 */	
	function processAssociation(association) {
		RT_to_submit = new Date().getTime() - RT_start;
				
		//start by saving the trial
		association_responses.push({
			cue: cue,
			cue_cat: cue_cat,
			trial_nb: trial_nb,
			association: association,
			asso_nb: asso_index,
			RT_to_keypress: RT_to_keypress,
			RT_to_submit: RT_to_submit
		});
		
		//allow for RT measurement of next association
		first_keypress_registered = false;
		RT_start = new Date().getTime(); 
		
		//show next association, or next cue
		if (asso_index == 1) { //this was ss's first association
			$("#associations__previous--1").html(association); //display this association while ss thinks of further associations
			$("#associations__response").attr("placeholder", "Geef een tweede associatie");		
			asso_index++;
		} else if (asso_index == 2) { 	//this was ss's second association
			$("#associations__previous--2").html(association); //display this association while ss thinks of further associations
			$("#associations__response").attr("placeholder", "Geef een laatste associatie");
			asso_index++;
		} else {
			$("#associations__response").attr("placeholder", "Geef een eerste associatie");
			showNextCue(); //pp gave three associations -> move to next cue
		}				
	}
	
	/**
	 * Display the next cue
	 */
	function showNextCue() {
		$(".associations__previous").html("...");		
		
		if (cue_list.length > 0) {
			var cue_entry = cue_list.shift();
			cue = cue_entry[0];
			cue_cat = cue_entry[1];
			trial_nb++;
			asso_index = 1;
			$("#associations__cue").html(capitalizeFirst(cue));		
			RT_start = new Date().getTime(); //reset RT
		} else {
			WriteAssociationData();
			showIATInstructions();
		}		
	}
	
	function capitalizeFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	trial_nb = 0;
	showNextCue();	
}

//write the ss's responses in the association task to disk
function WriteAssociationData(){	
	var subject = sub;
	subject = subject.length==0 ? "unknown" : subject;
	subject = "ASSO-" + subject;
	var str = "cue\tcue_cat\ttrial_nb\tasso\tasso_nb\tRT_firstkey\tRT_submit\n";	
	
	for (var i = 0; i < association_responses.length; i++) {
		var t = association_responses[i];
		str = str + t.cue + "\t" + t.cue_cat + "\t" + t.trial_nb + "\t" + t.association + "\t" + t.asso_nb + "\t" + t.RT_to_keypress + "\t" + t.RT_to_submit + "\n";		
	}	

	$.post("core/fileManager.php", { 'op':'writeoutput', 'template':template.name, 
			'subject': subject, 'data': str });	
}
