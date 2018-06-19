import '../img/icon-128.png'
import '../img/icon-128-disabled.png'
import '../img/icon-48.png'
import '../img/icon-48-disabled.png'
import '../img/icon-32.png'
import '../img/icon-32-disabled.png'
import '../img/icon-16.png'
import '../img/icon-16-disabled.png'

'use strict';

chrome.pageAction.onClicked.addListener(function(activeTab) {
    chrome.tabs.executeScript(null, {file: "content.js"});
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === "updateIcon") {
        if (msg.value) {
            chrome.pageAction.setIcon({path: "/icon-32.png"});
        } else {
            chrome.pageAction.setIcon({path: "/icon-32-disabled.png"});
        }
    }
});


chrome.runtime.onInstalled.addListener(function() {
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([
            {
                // That fires when a page's URL contains a 'thumbnails.php?album=' ...
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: { urlContains: 'thumbnails.php?album=' },
                    })
                ],
                actions: [
                    new chrome.declarativeContent.ShowPageAction()
                ]
            }
        ]);
    });



});
