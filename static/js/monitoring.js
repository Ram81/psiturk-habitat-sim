var jsonData = [{"episodeId": "A17VH9XUILV3E8:30LSNF239V6C0BIIDJV9IE2VHY82IS", "video": "demo_0.mp4", "task": "Place the toy airplane on the colored wood block"}, {"episodeId": "A1CEBF7WRZ74YK:3P1L2B7AD20SXJFTLKQJH7XQZ6ULOP", "video": "demo_1.mp4", "task": "Place the orange on the red plate"}, {"episodeId": "A17VH9XUILV3E8:3EKVH9QMEZFVS02WL5UYRHMIPT02DQ", "video": "demo_2.mp4", "task": "Place the apple on the red plate"}, {"episodeId": "A1CEBF7WRZ74YK:3JW0YLFXRURGDM0UGKOV7CRS0FXWW5", "video": "demo_3.mp4", "task": "Place the red mug on the red plate"}, {"episodeId": "A1CEBF7WRZ74YK:3K2755HG5TEFTUE89095B0G7YW1FDH", "video": "demo_4.mp4", "task": "Place the cheezit box on the red plate"}, {"episodeId": "A17VH9XUILV3E8:36PW28KO407PP9B0UFYX3HN11SNEAU", "video": "demo_5.mp4", "task": "Place the cheezit box on the red plate"}, {"episodeId": "A17VH9XUILV3E8:31LM9EDVOM34K8RHHKETM3KT57KJN6", "video": "demo_6.mp4", "task": "Place the soccer ball on the colored wood block"}];
var numberPerPage = 4;
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

function getNumberOfPages() {
    return Math.ceil(jsonData.length / numberPerPage);
}

function loadDataset(records) {
    var count = Object.keys(records).length;
    numberOfPages = getNumberOfPages();

    console.log('Total training examples ' + count);
    console.log('Number of pages: ' + numberOfPages);
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  };

function getVideoPath(img) {
    return "data/hit_data/video/" + img;
}

function drawList() {
    var visited = 0;
    for (var r = 0; r < pageList.length; r++) {
        var videoPath = getVideoPath(pageList[r]["video"]);
        var video = document.getElementById("video"+ (r + 1));
        video.getElementsByTagName("source")[0].src =  videoPath;
        video.load();
        document.getElementById("text"+ (r + 1)).innerHTML =  "<b>Task</b>: " + pageList[r]["task"];
        document.getElementById("uuid"+ (r + 1)).innerHTML =  "<b>Assignment Id</b>: " + pageList[r]["episodeId"];
        document.getElementById("message"+ (r + 1)).innerHTML = "";
        document.getElementById("video"+ (r + 1)).style.display = "";
        document.getElementById("text"+ (r + 1)).style.display =  "";
        document.getElementById("uuid"+ (r + 1)).style.display =  "";
        document.getElementById("approve"+ (r + 1)).style.display =  "";
        document.getElementById("reject"+ (r + 1)).style.display =  "";
        document.getElementById("message"+ (r + 1)).style.display =  "";

        // Check if HIT is already approved
        isAlreadyApproved(r);
        visited += 1;
    }
    if (visited < numberPerPage) {
        for (var r = visited; r < numberPerPage; r++) {
            document.getElementById("video"+ (r + 1)).style.display = "none";
            document.getElementById("text"+ (r + 1)).style.display =  "none";
            document.getElementById("uuid"+ (r + 1)).style.display =  "none";
            document.getElementById("approve"+ (r + 1)).style.display =  "none";
            document.getElementById("reject"+ (r + 1)).style.display =  "none";
            document.getElementById("message"+ (r + 1)).style.display =  "none";
        }
    }
}

function approveHit(id, isApproved) {
    console.log("Approve HIT: " + JSON.stringify(pageList[id]));
    var uniqueId = pageList[id]["episodeId"]
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
    var requestUrl = hostUrl + "/api/v0/approve_hit";
    let request = new XMLHttpRequest();
    request.open("POST", requestUrl)
    request.send(JSON.stringify({
        "authToken": authToken,
        "uniqueId": uniqueId,
        "mode": mode,
        "isApproved": isApproved
    }));
    request.onload = () => {
        if (request.status == 200) {
            console.log("success!");
            if (isApproved) {
                document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:green;font-weight:400;\">Approved!</span>";
            } else {
                document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:red;font-weight:400;\">Rejected!</span>";
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

function isAlreadyApproved(id) {
    console.log("Check isApproved: " + JSON.stringify(pageList[id]));
    var uniqueId = pageList[id]["episodeId"]
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
    var requestUrl = hostUrl + "/api/v0/is_approved";
    let request = new XMLHttpRequest();
    request.open("POST", requestUrl)
    request.send(JSON.stringify({
        "authToken": authToken,
        "uniqueId": uniqueId,
        "mode": mode
    }));
    request.onload = () => {
        if (request.status == 200) {
            console.log("success!");
            document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:green;font-weight:400;\">Approved!</span>";
        } else if (request.status == 203) {
            console.log("HIT Unapproved!");
            document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:Orange;font-weight:400;\">Not Approved!</span>";
        } else if (request.status == 208) {
            console.log("HIT Rejected!");
            document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:red;font-weight:400;\">Rejected!</span>";
        } else if (request.status == 205) {
            console.log("HIT Approve failed!");
            document.getElementById("message" + (id + 1)).innerHTML = "<b>Status:</b> <span style=\"color:blue;font-weight:400;\">Multiple exists!</span>";
        } else {
            document.getElementById("message" + (id + 1)).innerHTML = "HIT status GET failed!!";
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
    loadDataset(jsonData);
    loadList();
}

window.onload = load;