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

var taskTitleMap = {
  "flythrough": "Environment flythrough",
  "training": "Training task",
  "viewer": "Final task",
  "instructions/instruct-general.html": "Object Rearrangement Experiment",
  "instructions/instruct-flythrough.html": "Environment flythrough",
  "instructions/instruct-training.html": "Training task",
  "instructions/instruct-task.html": "Final task"
};

var steps = [
  "instructions/instruct-general.html",
  "instructions/instruct-flythrough.html",
  "flythrough",
  "instructions/instruct-training.html",
  "training",
  "instructions/instruct-task.html",
  "viewer"
];

var stepActionMap = {
  "instructions/instruct-general.html": "navigation/start.html",
  "instructions/instruct-flythrough.html": "navigation/skip.html",
  "instructions/instruct-training.html": "navigation/skip.html",
  "instructions/instruct-task.html": "navigation/middle.html",
  "training": "navigation/next.html",
  "viewer": "navigation/end.html"
};

// All pages to be loaded
var pages = [
  "instructions/instruct-general.html",
  "instructions/instruct-flythrough.html",
  "instructions/instruct-training.html",
  "instructions/instruct-task.html",
  "navigation/start.html",
  "navigation/end.html",
  "navigation/middle.html",
  "navigation/skip.html",
  "navigation/next.html",
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

  psiTurk.recordTrialData({'type':"platformInfo",'navigator':window.navigator});

  // Load the viewer.html snippet into the body of the page
  psiTurk.showPage('viewer.html');
  psiTurk.recordTrialData({'type':"loadViewer",'phase':'TEST'});

  const SimInitialized = function() {
    return !!(window.demo &&
              window.demo.task &&
              window.demo.task.initialized);
  };


  const getParameterByName = function(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  const getSkipFlythroughTrainingFlag = function() {
    var url = window.location.href;
    var splitteUrl = url.split("/");
    var hostUrl = splitteUrl[0] + "//" + splitteUrl[2];

    // Build request
    var requestUrl = hostUrl + "/api/v0/worker_flythrough_training_skip";
    let request = new XMLHttpRequest();
    request.open("POST", requestUrl)
    request.send(JSON.stringify({
        "workerId": getParameterByName("workerId")
    }));
    request.onload = () => {
        if (request.status == 200) {
            _self.skipTrainingResponse = JSON.parse(request.response);
            return request.response;
        } else {
          return {};
        }
    }
  };

  getSkipFlythroughTrainingFlag();

  // Start the test
  _self = this;
  _self.iStep = 0;
  _self.flythroughComplete = false;
  _self.trainingComplete = false;

  const runStep = function() {
    const showViewer = function(isFlythrough) {
      $("#instructions").hide();
      $("#task-instruction").show();
      $("#container").show();
      $("#text-assistance-1").show();
      if (isFlythrough) {
        $('#actions-nav').hide();
      } else {
        $('#actions-nav').show();
      }
      if(SimInitialized()) {
        window.demo.task.bindKeys();
      }
    };

    const showInstructions = function() {
      $("#instructions").show();
      //$("#task-instruction").hide();
      $("#container").hide();
      $("#text-assistance-1").hide();
      $('#actions-nav').show();
      if(SimInitialized()) {
        window.demo.task.unbindKeys();
      }
    };

    const setTaskTitle = function(task) {
      $("#task-title").html("<h1>" + taskTitleMap[task] + "</h1>");
    }


    let step = steps[_self.iStep];
    console.log("iStep:", _self.iStep, "step:", step);
    window.step = step;
    psiTurk.recordTrialData({'type':"runStep",'phase':'TEST','iStep':_self.iStep,'step':step});

    setTaskTitle(step);
    if(step === "flythrough") {
      _self.flythroughComplete = true;
      showViewer(true);
      const waitForFlythrough = function() {
        if(SimInitialized()) {
          window.demo.runFlythrough();
        } else {
          console.log("Sim not initialized yet. Waiting");
          window.setTimeout(waitForFlythrough, 1000);
        }
      };
      waitForFlythrough();
    } else if (step === "training") {
      _self.trainingComplete = true;
      showViewer(false);
      $("#actions-nav").html(psiTurk.getPage(stepActionMap[step]))
      window.demo.runTrainingTask();
    } else if(step === "viewer") {
      // Initialize experiment episode
      showViewer(false);
      $("#actions-nav").html(psiTurk.getPage(stepActionMap[step]));
      window.demo.runInit();
    } else {
      $("#instructions").html(psiTurk.getPage(step))
      $("#actions-nav").html(psiTurk.getPage(stepActionMap[step]))
      $("#task-instruction").html("");
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

    $("#next").unbind('click').bind('click', function(e) {
      e.preventDefault();
      if (steps[_self.iStep] == "viewer") {
        if (window.demo.task.validateTask()) {
          window.finishTrial();
        } else {
          document.getElementById("hit-complete-message").innerHTML = "<h4>Please complete the task to submit HIT</h4>";
        }
      } else {
        window.finishTrial();
      }
    });

    $("#skip").unbind('click').bind('click', function(e) {
      e.preventDefault();
      ++_self.iStep;
      window.finishTrial();
    });

    $("#prev").unbind('click').bind('click', function(e) {
      e.preventDefault();
      if(_self.iStep - 1 >= 0) {
        --_self.iStep;
        runStep();
      }
    });
  }

  window.finishTrial = function(doReset = true) {
      psiTurk.recordTrialData({'type':"finishStep", 'phase':'TEST'});
      ++_self.iStep;

      if (_self.skipTrainingResponse["flythrough_complete"] == true) {
        if (steps[_self.iStep] == "instructions/instruct-flythrough.html") {
          window.finishTrial();
        }
        if (steps[_self.iStep] == "flythrough") {
          window.finishTrial();
        }
      }

      if (_self.skipTrainingResponse["training_task_complete"] == true) {
        if (steps[_self.iStep] == "instructions/instruct-training.html") {
          window.finishTrial();
        }
        if (steps[_self.iStep] == "training") {
          window.finishTrial();
        }
      }

      if(_self.iStep < steps.length) {
        if(doReset && SimInitialized()) {
          window.demo.task.reset();
        }

        runStep();
      } else {
        if(SimInitialized())
          window.demo.task.unbindKeys();

        window.currentview = new Questionnaire(_self.flythroughComplete, _self.trainingComplete);
      }
  };
  runStep();
};


/****************
* Questionnaire *
****************/

var Questionnaire = function(flythroughComplete, trainingComplete) {

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
    return responsesFilled;

  };
  const record_responses = function() {

    psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

    $('textarea').each( function(i, val) {
      psiTurk.recordUnstructuredData(this.id, this.value);
    });
  };

  prompt_resubmit = function() {
    document.body.innerHTML = error_message;
    $("#resubmit").click(resubmit);
  };

  resubmit = function() {
    document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
    reprompt = setTimeout(prompt_resubmit, 10000);

    record_hit_data();
    psiTurk.saveData({
      success: function() {
          clearInterval(reprompt);
          psiTurk.completeHIT(); // when finished saving compute bonus, the quit
      },
      error: prompt_resubmit
    });
  };

  getParameterByName = function(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

  record_hit_data = function() {
    var url = window.location.href;
    var splitteUrl = url.split("/");
    var hostUrl = splitteUrl[0] + "//" + splitteUrl[2];

    // Build request
    var requestUrl = hostUrl + "/api/v0/worker_hit_complete";
    let request = new XMLHttpRequest();
    request.open("POST", requestUrl)
    request.send(JSON.stringify({
        "hitId": getParameterByName("hitId"),
        "assignmentId": getParameterByName("assignmentId"),
        "workerId": getParameterByName("workerId"),
        "flythroughComplete": flythroughComplete,
        "trainingTaskComplete": trainingComplete,
        "taskComplete": true
    }));
    request.onload = () => {
        if (request.status == 200) {
            console.log("success!");
        }
    }
  };

  // Load the questionnaire snippet
  psiTurk.showPage('postquestionnaire.html');
  psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});

  $("#next").click(function () {
    record_responses();
    record_hit_data();
    psiTurk.saveData({
          success: function(){
              psiTurk.completeHIT(); // when finished saving compute bonus, the quit
          },
          error: prompt_resubmit});
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
