var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

let unreadNotifications = 0;
let unreadMessages = 0;
let user = {
    Practice: '',
    Person: ''
};

//TODO: REVIEW ALL CODE AND CLEANUP

// Load the notification sound
var notifAudio = new Audio(chrome.runtime.getURL('../sound/MA_Readsounds_MobileApp_9.wav'));

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, cookie => {
        if(callback) {
            callback(cookie.value);
        }
    });
}

getCookies("https://app.healthmemmo.com/", "HealthMemmoExtension", id => {
    user.Practice = id;
});

getCookies("https://app.healthmemmo.com/", "HealthMemmoExtensions", id => {
    user.Person = id;
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

            // If cookie (is logged in)
            if (user.Person && user.Practice) {
                $.ajax({
                    type: "GET",
                    url:"https://app.healthmemmo.com/api/Extension",
                    data: {"Practice":user.Practice,"Person":user.Person}
                    }).done(function (data) {
                        console.log(data);
                        
                        // TODO: Should do something where if the notifications or messages goes down we update the extension number to reflect this
                        if (data.messages.length >= 1 || data.notifications.length >= 1) {
                            
                            if (data.notifications.length > unreadNotifications || data.messages.length > unreadMessages) {
                                // Update unreadNotifications and unreadMessages to new value
                                unreadNotifications = data.notifications.length;
                                unreadMessages = data.messages.length

                                notifAudio.play();

                                // *? Should this be the unread messages count OR unread notifications count OR both of them combined?

                                let notifNumber = unreadNotifications + unreadMessages;
                                chrome.browserAction.setBadgeText({text: notifNumber.toString()});
                                
                                chrome.runtime.sendMessage({ window: "focus", notif_messages: data }, null, response => {
                                    if (!response) {
                                        console.log("We got no response, opening the window...");
                                        chrome.windows.create({
                                            url: chrome.runtime.getURL("../html/popup.html"),
                                            type: "popup",
                                            focused: true,
                                            height: 400,
                                            width: 300,
                                            top: 1000,
                                            left: 3000
                                        });
                                    }
                                });
                            }
                        } else if (data.messages.length < unreadMessages || data.notifications.length < unreadNotifications) {
                            // Reduce the number of notifications shown
                            unreadNotifications = data.notifications.length;
                            unreadMessages = data.messages.length;

                            let notifNumber = unreadNotifications + unreadMessages;
                            chrome.browserAction.setBadgeText({text: notifNumber.toString()});

                            // Need to send the new data but not alert
                        }
                });
            } else {
                console.log("You are not logged in sir!");
            }
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
    // If no cookie, open the login page rather than the extension
    if (user.Person && user.Practice) {
        chrome.runtime.sendMessage({ window: "focus" }, null, response => {
            if (!response) {
                chrome.windows.create({
                    url: chrome.runtime.getURL("../html/popup.html"),
                    type: "popup",
                    focused: true,
                    height: 400,
                    width: 300,
                    top: 1000,
                    left: 3000
                });
            }
        });
    } else {
        window.open('https://app.healthmemmo.com/login', 'child_window').focus();
    }
});