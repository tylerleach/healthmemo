var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

let unreadNotifications = 0;
let user = {
    Practice: '',
    Person: ''
};

// TODO: Should only do something if the cookie exists (i.e. is logged in)

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
    });
}

// TODO: Improve this to set them both at once, instead of seperate
getCookies("https://app.healthmemmo.com/", "HealthMemmoExtension", function(id) {
    user.Person = id;
});

getCookies("https://app.healthmemmo.com/", "HealthMemmoExtensions", function(id) {
    user.Practice = id;
});

chrome.runtime.onInstalled.addListener(() => {
    console.log("Doctor extension installed...");

    // create alarm after extension is installed / upgraded
    scheduleRequest();
});

// alarm will continue running when chrome is restarted
chrome.runtime.onStartup.addListener(() => {
    console.log("onStartup....");
    chrome.alarms.get("refresh", (alarm) => {
        if (alarm) {
            console.log("Refresh alarm exists. Yay.");
        } else {
            scheduleRequest();
        }
    })
});

// alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.alarms.get("refresh", (alarm) => {
        if (alarm) {
            console.log("Refresh alarm exists. Yay.");


            $.ajax({
                type: "GET",
                url:"https://app.healthmemmo.com/api/Extension",
                data: {"Practice":"9c92cfce-8c17-4837-8c5e-3a46806e32dd","Person":"e8072d1a-f90d-4fe9-928a-e42f74f64886"}
                }).done(function (data) {
                /*process response*/
                    console.log(data);
            });

            /*$.ajax({
                type: "GET",
                url:"https://healthmemmo-app.apps.plantanapp.com/DesktopModules/DnnSharp/DnnApiEndpoint/Api.ashx?method=Test_Extension",
                data: {"personId":"39"}
            }).done(function (data) {
        
                // If there is any unread notifications
                if (data >= 1) {
                    // If number of unread notifications is greater than previously, bring the extension into focus 
                    // (this is so the extension won't be focues constantly every 10 seconds for the same notification)
                    if (data > unreadNotifications) {
                        unreadNotifications = data;
                        chrome.browserAction.setBadgeText({text: unreadNotifications});
                        console.log('This is a test');
                        chrome.runtime.sendMessage({ window: "focus", notif_num: unreadNotifications }, null, function (response) {
                            if (!response) {
                                console.log("Creating window...");
                                chrome.windows.create({
                                    url: chrome.runtime.getURL("../html/popup.html"),
                                    type: "popup",
                                    focused: true,
                                    height: 100,
                                    width: 200,
                                });
                                console.log("After window created...");
                            } else {
                                chrome.runtime.sendMessage({ window: "notif" });
                            }
                        });
                    }
                } else {
                    console.log("nay");
                }
            });*/
        } else {
            // if it is not there, start a new request and reschedule refresh alarm
            console.log("Refresh alarm doesn't exist, starting a new one");
            scheduleRequest();
        }
    });
});

// schedule a new fetch every 10 seconds
function scheduleRequest() {
    chrome.alarms.create("refresh", { periodInMinutes: 0.2 });
}

chrome.browserAction.onClicked.addListener(() => {
    chrome.runtime.sendMessage({ window: "focus" }, null, function (response) {
        if (!response) {
            chrome.windows.create({
                url: chrome.runtime.getURL("../html/popup.html"),
                type: "popup",
                focused: true,
                height: 100,
                width: 200,
            });
        }
    });
});