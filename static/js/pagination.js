var jsonData = [];
var numberPerPage = 8;
var numberOfPages = 0;
var currentPage = 1;
var pageList = new Array();


function loadJSON(callback, path) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true);
    //xobj.setRequestHeader('Access-Control-Allow-Origin', '*');

    xobj.onreadystatechange = function() {
        console.log(xobj)
        if (xobj.readyState == 4 && (xobj.status === 200 || xobj.status === 0)) {
            // .open will NOT return a value but simply returns undefined in async mode so use a callback
            callback(xobj.responseText);
        }
    }
    xobj.send(null);

}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};


function getHits() {
    var authToken = getParameterByName("authToken");
    var mode = getParameterByName("mode");

    if (authToken === undefined || authToken === null) {
        return;
    }

    if (mode == null) {
        mode = "debug";
    }
    
    var url = window.location.href;
    var splitteUrl = url.split("/");
    var hostUrl = splitteUrl[0] + "//" + splitteUrl[2];

    // Build request
    var requestUrl = hostUrl + "/api/v0/get_hits_assignment_submitted_count";
    let request = new XMLHttpRequest();
    request.open("POST", requestUrl)
    request.send(JSON.stringify({
        "authToken": authToken,
        "mode": mode
    }));
    request.onload = () => {
        console.log(request.status);
        if (request.status == 200) {
            var response = JSON.parse(request.response);
            var hitMeta = response["hit_meta"];
            loadDataset(hitMeta);
            console.log("success!");
        } else if (request.status == 203) {
            console.log("HIT Unapproved!");
        } else if (request.status == 208) {
            console.log("HIT Rejected!");
        } else if (request.status == 205) {
            console.log("HIT Approve failed!");
        }
    }
}

function approveHit(id, isApproved) {
    console.log("Approve HIT: " + JSON.stringify(pageList[id]));
    var hitId = pageList[id]["hit_id"]
    var authToken = getParameterByName("authToken");
    var mode = getParameterByName("mode");

    if (authToken === undefined || authToken === null) {
        document.getElementById("message" + (id + 1)).innerHTML = "Invalid auth token!";
        return;
    }

    if (mode == null) {
        mode = "debug";
    }
    
    var url = window.location.href;
    var splitteUrl = url.split("/");
    var hostUrl = splitteUrl[0] + "//" + splitteUrl[2];

    // Build request
    var requestUrl = hostUrl + "/api/v0/approve_hit_by_hit_id";
    let request = new XMLHttpRequest();
    request.open("POST", requestUrl)
    request.send(JSON.stringify({
        "authToken": authToken,
        "hitId": hitId,
        "mode": mode,
        "isApproved": isApproved
    }));
    request.onload = () => {
        if (request.status == 200) {
            console.log("success!");
            var response = JSON.parse(request.response);
            var numAssignmentsApproved = response["assignments"]
            if (isApproved) {
                document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:green;font-weight:400;\"> " + numAssignmentsApproved + " assignments approved!</span>";
            } else {
                document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:red;font-weight:400;\">No update!</span>";
            }
        } else if (request.status == 203) {
            document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:blue;font-weight:400;\">Already approved!</span>";
        } else if (request.status == 401) {
            document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:red;font-weight:400;\">Unauthorized approve request!</span>";
        } else {
            console.log("approve failed!");
            document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:red;font-weight:400;\">Approve failed!!</span>";
        }
    }
}


function getNumberOfPages() {
    return Math.ceil(jsonData.length / numberPerPage);
}

function loadDataset(records) {
    jsonData = records;
    var count = Object.keys(records).length;
    getNumberOfPages();
    numberOfPages = getNumberOfPages();
    console.log('Total training examples ' + count);
    loadList();
}

function getVideoPath(img) {
    return "data/replays/video/" + img;
}


function drawList() {
    var visited = 0;
    for (var r = 0; r < pageList.length; r++) {
        document.getElementById("hitid"+ (r + 1)).innerHTML =  "<b>HIT id</b>: " + pageList[r]["hit_id"];
        document.getElementById("text"+ (r + 1)).innerHTML =  "<b>Task</b>: " + pageList[r]["task_id"];
        document.getElementById("episode"+ (r + 1)).innerHTML =  "<b>Episode</b>: " + pageList[r]["episode_id"];
        document.getElementById("approved"+ (r + 1)).innerHTML =  "<b>Approved assignments</b>: " + pageList[r]["approved_assignments"].length;
        document.getElementById("submitted"+ (r + 1)).innerHTML =  "<b>Submitted assignments</b>: " + pageList[r]["submitted_assignments"].length;
        document.getElementById("total"+ (r + 1)).innerHTML =  "<b>Total assignments</b>: " + pageList[r]["num_assignments"];
        document.getElementById("message"+ (r + 1)).innerHTML =  "";

        document.getElementById("hitid"+ (r + 1)).style.display = "";
        document.getElementById("text"+ (r + 1)).style.display =  "";
        document.getElementById("episode"+ (r + 1)).style.display = "";
        document.getElementById("approved"+ (r + 1)).style.display =  "";
        document.getElementById("submitted"+ (r + 1)).style.display = "";
        document.getElementById("total"+ (r + 1)).style.display =  "";
        document.getElementById("message"+ (r + 1)).style.display =  "";
        console.log("approve" + (r+1));
        document.getElementById("approve"+ (r + 1)).style.display =  "";
        visited += 1;
        console.log("Task: " + pageList[r]["task"]);
    }
    console.log("done: " + visited + " total: " + numberPerPage);
    if (visited < numberPerPage) {
        for (var r = visited; r < numberPerPage; r++) {
            console.log("hiding");
            document.getElementById("hitid"+ (r + 1)).style.display = "none";
            document.getElementById("text"+ (r + 1)).style.display =  "none";
            document.getElementById("episode"+ (r + 1)).style.display = "none";
            document.getElementById("approved"+ (r + 1)).style.display =  "none";
            document.getElementById("submitted"+ (r + 1)).style.display = "none";
            document.getElementById("total"+ (r + 1)).style.display =  "none";
            document.getElementById("message"+ (r + 1)).style.display =  "none";
            document.getElementById("approve"+ (r + 1)).style.display =  "none";
        }
    }
}

function check() {
    document.getElementById("next").disabled = currentPage == numberOfPages ? true : false;
    document.getElementById("previous").disabled = currentPage == 1 ? true : false;
}

function loadList() {
    var begin = ((currentPage - 1) * numberPerPage);
    var end = begin + numberPerPage;

    pageList = jsonData.slice(begin, end);
    drawList();
    check();
}

function nextPage() {
    currentPage += 1;
    loadList();
}

function previousPage() {
    currentPage -= 1;
    loadList();
}

function firstPage() {
    currentPage = 1;
    loadList();
}

function lastPage() {
    currentPage = numberOfPages;
    loadList();
}


function load() {
    getHits();
}

window.onload = load;