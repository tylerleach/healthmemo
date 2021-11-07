let unreadNotifications = 0;

chrome.runtime.onMessage.addListener(function onMessage(request, sender, response) {
    if (request.window === 'focus') {
        chrome.windows.getCurrent(function(t) {
            chrome.windows.update(t.id, {'focused': true});
        });
        response(JSON.stringify({message: 'OK'}));
    } else {
        console.log('I want to cry');
    }
});

function updateNotificationNumber() {
    const element = document.getElementById("notif_badge");
    element.innerHTML = unreadNotifications;
    var x = document.title;
    console.log("title: " + document.title);
    document.title = '(' + unreadNotifications + ') ' + x;
}

// Can probably reduce to one function with boolean passed to tell whether or not to turn it off or on
function showBadge() {
    const badge = document.getElementById("notif_badge");
    badge.style.display = "inline-block";
}

function hideBadge() {
    const badge = document.getElementById("notif_badge");
    badge.style.display = "none";
}

/* TODO: Make api call to see if any new messages or notifications, if new focus window */
window.setInterval(function() {
    $.ajax({
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
                showBadge();
                updateNotificationNumber();
                chrome.windows.getCurrent(function(t) {
                    chrome.windows.update(t.id, {'focused': true});
                });
            }
        } else {
            console.log("nay");
        }
    }); 
}, 10000);