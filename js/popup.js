let unreadNotifications = 0;
let unreadMessages = 0;
let user = {
    Practice: '',
    Person: ''
};
let title = document.title;

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, cookie => {
        if(callback) {
            callback(cookie.value);
        }
    });
}

function initialUpdate() {
    getCookies("https://app.healthmemmo.com/", "HealthMemmoExtension", id => {
        user.Practice = id;
    });

    getCookies("https://app.healthmemmo.com/", "HealthMemmoExtensions", id => {
        user.Person = id;
    });
    $.ajax({
        type: "GET",
        url:"https://app.healthmemmo.com/api/Extension",
        data: {"Practice":user.Practice,"Person":user.Person}
        }).done(function (data) {
            if (data.notifications.length > unreadNotifications || data.messages.length > unreadMessages) {
                unreadMessages = data.notifications.length;
                unreadNotifications = data.messages.length;

                showMessageBadge();
                updateMessageNumber();
                showNotifBadge();
                updateNotificationNumber();
            }
    });
}

initialUpdate();

chrome.runtime.onMessage.addListener(function onMessage(request, sender, response) {
    if (request.window === 'focus') {
        // Focus the extension window if not in focus
        chrome.windows.getCurrent(function(t) {
            chrome.windows.update(t.id, {'focused': true});
        });
        response(JSON.stringify({message: 'OK'}));

        if (request.notif_messages.messages.length > unreadMessages && request.notif_messages.notifications.length > unreadNotifications) {
            unreadMessages = request.notif_messages.messages.length;
            unreadNotifications = request.notif_messages.notifications.length;
            showMessageBadge();
            updateMessageNumber();
            showNotifBadge();
            updateNotificationNumber();
        } else if (request.notif_messages.messages.length > unreadMessages) {
            unreadMessages = request.notif_messages.messages.length;
            showMessageBadge();
            updateMessageNumber();
        } else if (request.notif_messages.notifications.length > unreadNotifications) {
            unreadNotifications = request.notif_messages.notifications.length;
            showNotifBadge();
            updateNotificationNumber();
        }
    }
});


// *? Could update this to be passed a number?
function updateNotificationNumber() {
    const element = document.getElementById("notif_badge");
    element.innerHTML = unreadNotifications;

    // ! This part is wrong, need to improve 
    document.title = '(' + unreadNotifications + ') ' + title;
}

// *? Update message and notifcation should be merged into one with if/else statements
function updateMessageNumber() {
    const element = document.getElementById("message_badge");
    element.innerHTML = unreadMessages;
}

// TODO: Reduce to one function with boolean passed to tell whether or not to turn it off or on
function showNotifBadge() {
    const badge = document.getElementById("notif_badge");
    badge.style.display = "inline-block";
}

function hideNotifBadge() {
    const badge = document.getElementById("notif_badge");
    badge.style.display = "none";
}

// * Don't like this duplicate code, need to make better
function showMessageBadge() {
    const badge = document.getElementById("message_badge");
    badge.style.display = "inline-block";
}

function hideMessageBadge() {
    const badge = document.getElementById("message_badge");
    badge.style.display = "none";
}