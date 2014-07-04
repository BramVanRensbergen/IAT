CUES = [];  	//will hold the cues the participant will see, in order
RESPONSES = []; //will hold participant's responses to the association experiment

/*
 * A note on cues and cue order.
 * Cues consist of 4 names, and 18 words --> a total of 22 cues.
 * 2 names are local, 2 names are foreign.
 * 6 words have a very high valence, 6 have a neutral valence, 6 have a negative valence
 * 
 * Position of the names is not random: there will be a name at position 6, 11, 16, and 21
 * Names take turns; either local, foreign, local, foreign; or, foreign, local, foreign, local
 * 
 * The order of the rest of the words is fully randomized.
 * 
 * All cues are hardcoded in this function. 
 * Each cue is accompagnied by their type: valence level i.e. positive/negative/neutral for words, and local/foreign for names.
 */

function initializeAssociations() {		
	//the 'regular' words that will be presented, in the order they will be in the final CUES
	var cueWords = shuffle([
	        ['Vriend', 'positive'],
	        ['Betrouwbaar', 'positive'],
	        ['Heerlijk', 'positive'],
	        ['Liefde', 'positive'],
	        ['Prachtig', 'positive'],
	        ['Eerlijk', 'positive'],
	        ['Drempel', 'neutral'],
	        ['Olie', 'neutral'],
	        ['Kruimel', 'neutral'],
	        ['Kever', 'neutral'],
	        ['Steen', 'neutral'],
	        ['Knoop', 'neutral'],
	        ['Ongelukkig', 'negative'],
	        ['Failliet', 'negative'],
	        ['Vijand', 'negative'],
	        ['Corrupt', 'negative'],
	        ['Crimineel', 'negative'],
	        ['Agressie', 'negative']
	]);

	var localNames = shuffle([
			['Niels', 'local'],
			['Nathalie', 'local'],
	]);

	var foreignNames = shuffle([
			['Mohammed', 'foreign'],
			['Fatima', 'foreign']
	]);		
		
	CUES = cueWords;
	
	localFirst = Math.random() > 0.5; //true: local at 7 and 16, foreign at 11 and 21; false: vice versa
	CUES.splice(5,  0, localFirst ? localNames[0]   : foreignNames[0] );
	CUES.splice(10, 0, localFirst ? foreignNames[0] : localNames[0]   );
	CUES.splice(15, 0, localFirst ? localNames[1]   : foreignNames[1] );
	CUES.splice(20, 0, localFirst ? foreignNames[1] : localNames[1]   );	
	//note: these splice commands insert the element at that index, shifting the rest of the array one element forward
	
	/**
	 * Return the indicated array, with all elements shuffled.
	 */
	function shuffle(array) {
		var counter = array.length, temp, index;

		// While there are elements in the array
		while (counter > 0) {

			index = Math.floor(Math.random() * counter); // Pick a random index
			counter--;

			// Swap the last element with counter
			temp = array[counter];
			array[counter] = array[index];
			array[index] = temp;
		}
		return array;
	}	
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
	var cueCat = '';	//category of the cue, e.g. 'local name' or 'foreign name'
	var trialNb = 0;	//trial number; 1 .. number of cues (i.e., 3 associations to each cue are all the same trial)
	var assoIndex = 1;	//1, 2, or 3, depending on whether the association is the first, second, or third association to the current cue
	
	//for each association, we'll save RT to first keypress and RT to submit
	//measured from when cue is displayed or when previous association was submitted, whichever is later
	var RtStart = -1;					 
	var RtToSubmit = -1;
	var RtToKeypress = -1;
	var firstKeypressRegistered = false;
	
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
		if (!firstKeypressRegistered) {
			firstKeypressRegistered = true;
			RtToKeypress = new Date().getTime() - RtStart;
		}
	});
	
	/**
	 * Write away response, move on to next association or cue.
	 */	
	function processAssociation(association) {
		RtToSubmit = new Date().getTime() - RtStart;
				
		//start by saving the trial
		RESPONSES.push({
			cue: cue,
			cueCat: cueCat,
			trialNb: trialNb,
			association: association,
			assoNb: assoIndex,
			RtToKeypress: RtToKeypress,
			RtToSubmit: RtToSubmit
		});
		
		//allow for RT measurement of next association
		firstKeypressRegistered = false;
		RtStart = new Date().getTime(); 
		
		//show next association, or next cue
		if (assoIndex == 1) { //this was ss's first association
			$("#associations__previous--1").html(association); //display this association while ss thinks of further associations
			$("#associations__response").attr("placeholder", "Geef een tweede associatie");		
			assoIndex++;
		} else if (assoIndex == 2) { 	//this was ss's second association
			$("#associations__previous--2").html(association); //display this association while ss thinks of further associations
			$("#associations__response").attr("placeholder", "Geef een laatste associatie");
			assoIndex++;
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
		
		if (CUES.length > 0) {
			var cueEntry = CUES.shift();
			cue = cueEntry[0];
			cueCat = cueEntry[1];
			trialNb++;
			assoIndex = 1;
			$("#associations__cue").html(capitalizeFirst(cue));		
			RtStart = new Date().getTime(); //reset RT
		} else {
			WriteAssociationData();
			showIATInstructions();
		}		
	}
	
	function capitalizeFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	trialNb = 0;
	showNextCue();	
}

//write the ss's responses in the association task to disk
function WriteAssociationData(){	
	var subject = sub;
	subject = subject.length==0 ? "unknown" : subject;
	subject = "ASSO-" + subject;
	var str = "cue\tcueCat\ttrialNb\tasso\tassoNb\tRT_firstkey\tRT_submit\n";	
	
	for (var i = 0; i < RESPONSES.length; i++) {
		var t = RESPONSES[i];
		str = str + t.cue + "\t" + t.cueCat + "\t" + t.trialNb + "\t" + t.association + "\t" + t.assoNb + "\t" + t.RtToKeypress + "\t" + t.RtToSubmit + "\n";		
	}	

	$.post("core/fileManager.php", { 'op':'writeoutput', 'template':template.name, 
			'subject': subject, 'data': str });	
}
