var jsonData = [{"video": "demo_0.mp4", "task": "Place the orange on the red plate"}, {"video": "demo_1.mp4", "task": "Place the apple on the red bowl"}, {"video": "demo_2.mp4", "task": "Place the hammer on the wood block"}, {"video": "demo_3.mp4", "task": "Place the banana on the red plate"}, {"video": "demo_4.mp4", "task": "Place the masterchef can on the red plate"}, {"video": "demo_5.mp4", "task": "Place the toy airplane on the colored wood block"}, {"video": "demo_6.mp4", "task": "Place the banana on the red plate"}, {"video": "demo_7.mp4", "task": "Place the orange in the red bowl"}, {"video": "demo_8.mp4", "task": "Place the cheezit box on the red plate"}, {"video": "demo_9.mp4", "task": "Place the orange on the red plate"}, {"video": "demo_10.mp4", "task": "Place the tomato soup can on the red plate"}];
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
    getNumberOfPages();
    var numberOfPages = getNumberOfPages();

    console.log('Total training examples ' + count);
}

function getVideoPath(img) {
    return "data/replays/video/" + img;
}


function drawList() {
    var visited = 0;
    for (var r = 0; r < pageList.length; r++) {
        var videoPath = getVideoPath(pageList[r]["video"]);
        var video = document.getElementById("video"+ (r + 1));
        video.getElementsByTagName("source")[0].src =  videoPath;
        video.load();
        document.getElementById("text"+ (r + 1)).innerHTML =  "<b>Task</b>: " + pageList[r]["task"];
        document.getElementById("video"+ (r + 1)).style.display = "";
        document.getElementById("text"+ (r + 1)).style.display =  "";
        visited += 1;
        console.log("Task: " + pageList[r]["task"]);
    }
    console.log("done: " + visited + " total: " + numberPerPage);
    if (visited < numberPerPage) {
        for (var r = visited; r < numberPerPage; r++) {
            console.log("hiding");
            document.getElementById("video"+ (r + 1)).style.display = "none";
            document.getElementById("text"+ (r + 1)).style.display =  "none";
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