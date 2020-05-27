window.onload = function() {

	var refreshRow = document.getElementById('refreshRow');
	var origPersistSetting;
	var origToggleHideChild;
	var refreshButton = document.getElementById('refreshButton');
	refreshButton.addEventListener('click', function() {
		chrome.tabs.reload();
		window.close();
	});

	chrome.storage.local.get(['persistSetting', 'toggleHideChild'], function(data) {
		var persistSettingSelect = document.getElementById('persistSetting');
		var persistSetting = (data && data['persistSetting']) ? data['persistSetting'] : 'manualPersist';
		persistSettingSelect.value = persistSetting;
		origPersistSetting = persistSetting;
		dirtyPersist = false;
		setPersistAnnotation(persistSetting);

		persistSettingSelect.onchange = function(e) {
			var newValue = e.target.value;
			dirtyPersist = newValue !== origPersistSetting;
			setPersistAnnotation(newValue);
			chrome.storage.local.set({'persistSetting': newValue}, function() {
				refreshRow.style.display = (dirtyPersist || dirtyToggleChild) ? '' : 'none';
			});
		};

		var toggleHideChildInput = document.getElementById('toggleHideChild');
		var toggleHideChild = (data && typeof data['toggleHideChild'] === "boolean") ? data['toggleHideChild'] : true;
		toggleHideChildInput.checked = toggleHideChild;
		origToggleHideChild = toggleHideChild;
		dirtyToggleChild = false;

		toggleHideChildInput.onchange = function(e) {
			var newValue = e.target.checked;
			dirtyToggleChild = newValue !== origToggleHideChild;
			chrome.storage.local.set({'toggleHideChild': newValue}, function() {
				refreshRow.style.display = (dirtyPersist || dirtyToggleChild) ? '' : 'none';
			});
		};
	});

	var persistAnnotations = {
		"manualPersist": "HN will remember that you collapsed a comment when clicking the [-] icon, but not when clicking <u>collapse</u>",
		"neverPersist": "HN will never remember that you collapsed a comment when clicking [-] or <u>collapse</u>",
		"alwaysPersist": "HN will always remember that you collapsed a comment when clicking [-] and <u>collapse</u>",
		"off": "<u>collapse</u> is not shown and custom persistence logic is turned off"
	};

	function setPersistAnnotation(setting) {
		document.getElementById('persistAnnotation').innerHTML = persistAnnotations[setting];
	}

};
