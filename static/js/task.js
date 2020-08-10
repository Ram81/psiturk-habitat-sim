/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
window.psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

//var mycondition = condition;  // these two variables are passed by the psiturk server process
//var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in this code code yet but may become useful

var steps = [
  "instructions/instruct-1.html",
  "viewer"
];

// All pages to be loaded
var pages = [
  "instructions/instruct-1.html",
  "viewer.html",
  "postquestionnaire.html"
];

psiTurk.preloadPages(pages);


/********************
* HTML manipulation
*
* All HTML files in the templates directory are requested
* from the server when the PsiTurk object is created above. We
* need code to get those pages from the PsiTurk object and
* insert them into the document.
*
********************/

/*********************
* HABITAT TEST       *
*********************/
var HabitatExperiment = function() {

  var startTime = new Date().getTime();

  var response_handler = function(e) {
    const keyCode = e.keyCode;

	const rt = new Date().getTime() - startTime;
    psiTurk.recordTrialData({
      'phase':"TEST",
      'keyCode':keyCode,
      'rt':rt
    });
  };


  psiTurk.recordTrialData({'type':"platformInfo",'navigator':window.navigator});

  // Load the viewer.html snippet into the body of the page
  psiTurk.showPage('viewer.html');
  psiTurk.recordTrialData({'type':"loadViewer",'phase':'TEST'});

  // Register the response handler that is defined above to handle any
  // key down events.
  //$("body").focus().keydown(response_handler);

  const SimInitialized = function() {
    return !!(window.demo &&
              window.demo.task &&
              window.demo.task.initialized);
  };

  // Start the test
  _self = this;
  _self.iStep = 0;
  const DoStep = function() {
    const showViewer = function() {
      $("#instructions").hide();
      $("#container").show();
      if(SimInitialized()) {
        window.demo.task.bindKeys();
      }
    };
    const showInstructions = function() {
      $("#instructions").show();
      $("#container").hide();
      if(SimInitialized()) {
        window.demo.task.unbindKeys();
      }
    };
    let step = steps[_self.iStep];
    if(step instanceof Array) {
      if(SimInitialized()) {
        step = step[0];
      }
      else {
        console.log("WARNING: Couldn't determine assistanceCondition. Using 0");
        step = step[0];
      }
    }
    console.log("iStep:", _self.iStep, "step:", step);
    window.step = step;
    psiTurk.recordTrialData({'type':"DoStep",'phase':'TEST','iStep':_self.iStep,'step':step});
    if(step === "flythrough") {
      showViewer();
      const waitForFlythrough = function() {
        if(SimInitialized()) {
          window.demo.doFlythrough();
        } else {
          console.log("Sim not initialized yet. Waiting");
          window.setTimeout(waitForFlythrough, 1000);
        }
      };
      waitForFlythrough();
    } else if(step === "viewer") {
      // Initialize experiment episode
      showViewer();
      //window.demo.doTask();
    } else {
      $("#instructions").html(psiTurk.getPage(step))
      showInstructions();
      const waitForStartEnable = function() {
        if(SimInitialized()) {
          document.getElementById("next").disabled = false;
        } else {
          document.getElementById("next").disabled = true;
          console.log("Sim not initialized yet. Start disabled");
          window.setTimeout(waitForStartEnable, 1000);
        }
      };
      waitForStartEnable();
	}
	$("#next").click(window.finishTrial);
    $("#prev").click(function() {
      if(_self.iStep - 1 >= 0) {
        --_self.iStep;
        DoStep();
      }
    });
  }

  window.finishTrial = function(doReset = false) {
      psiTurk.recordTrialData({'type':"finishStep",'phase':'TEST'});
      ++_self.iStep;

      if(_self.iStep < steps.length) {
        if(doReset && SimInitialized()) {
          window.demo.task.reset();
        }

        DoStep();
      } else {
        if(SimInitialized())
          window.demo.task.unbindKeys();
        //$("body").unbind("keydown"); // Unbind keys
        window.currentview = new Questionnaire();
      }
  };
  DoStep();
};


/****************
* Questionnaire *
****************/

var Questionnaire = function() {

  var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

  const check_responses = function() {
    let responsesFilled = true;
    $('textarea').each( function(i, val) {
      if(this.value === "")
        responsesFilled = false;
    });
    $('select').each( function(i, val) {
      if(this.value === "")
        responsesFilled = false;
    });
    let radioNames = new Set();
    let checkedRadioNames = new Set();
    $('input').each( function(i, val) {
      const name = (this.id && this.id !== "")?this.id:this.name;
      if(val.type === "radio") {
        radioNames.add(name);
        // Only record checked radio buttons
        if(!val.checked)
          return;
        else {
          checkedRadioNames.add(name);
        }
      }
      if(this.value === "")
        responsesFilled = false;

      psiTurk.recordUnstructuredData(name, this.value);
    });
    return responsesFilled && checkedRadioNames.size === radioNames.size;

  };
  const record_responses = function() {

    psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

    $('textarea').each( function(i, val) {
      psiTurk.recordUnstructuredData(this.id, this.value);
    });
    $('select').each( function(i, val) {
      psiTurk.recordUnstructuredData(this.id, this.value);
    });
    $('input').each( function(i, val) {
      // Only record checked radio buttons
      if(val.type === "radio" && !val.checked)
        return;
      if(this.id && this.id !== "")
        psiTurk.recordUnstructuredData(this.id, this.value);
      else
        psiTurk.recordUnstructuredData(this.name, this.value);
    });
  };

  prompt_resubmit = function() {
    document.body.innerHTML = error_message;
    $("#resubmit").click(resubmit);
  };

  resubmit = function() {
    document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
    reprompt = setTimeout(prompt_resubmit, 10000);

    psiTurk.saveData({
      success: function() {
          clearInterval(reprompt);
          psiTurk.completeHIT(); // when finished saving compute bonus, the quit
      },
      error: prompt_resubmit
    });
  };

  // Load the questionnaire snippet
  psiTurk.showPage('postquestionnaire.html');
  psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});

  $("#next").click(function () {
    if(check_responses()) {
      record_responses();
      psiTurk.saveData({
            success: function(){
                psiTurk.completeHIT(); // when finished saving compute bonus, the quit
            },
            error: prompt_resubmit});
    }
    else {
      const msg = "Please answer all the questions!";
      const status = document.getElementById("questionnairestatus");
      if(status) {
        status.style = "color:red";
        status.innerHTML = msg;
      }
      else
        console.warn(msg);
    }
  });


};

// Task object to keep track of the current phase
window.currentView = undefined;

/*******************
 * Run Task
 ******************/
$(window).load( function(){
   window.currentView = new HabitatExperiment(); ;

    /*psiTurk.doInstructions(
      instructionPages, // a list of pages you want to display in sequence
      function() { window.currentView = new HabitatExperiment(); } // what you want to do when you are done with instructions
    );*/
});
