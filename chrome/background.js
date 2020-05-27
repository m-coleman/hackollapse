var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
// firefox uses show_matches in the manifest, which is not supported on chrome
if (!isFirefox) {
	chrome.tabs.onSelectionChanged.addListener(function(tabId) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			activatePopupIfNecessary(tabs[0].url, tabId);
		});
	});

	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		activatePopupIfNecessary(tab.url, tabId);
	});

	function activatePopupIfNecessary(url, tabId) {
		var shouldShowSettingsPopup = url.indexOf('https://news.ycombinator.com') > -1;
		if (shouldShowSettingsPopup)
			chrome.pageAction.show(tabId);
	}

}