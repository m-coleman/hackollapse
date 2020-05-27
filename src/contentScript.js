var logoutBtn;
var persistSetting;
if (document.readyState === 'complete')
	initHackollapse();
else
	window.onload = initHackollapse;

function initHackollapse() {
	logoutBtn = document.getElementById('logout');

	chrome.storage.local.get(['persistSetting', 'toggleHideChild'], function(data) {
		persistSetting = (data && data['persistSetting']) ? data['persistSetting'] : 'manualPersist';
		var toggleHideChild = (data && typeof data['toggleHideChild'] === "boolean") ? data['toggleHideChild'] : true;

		var hideChildStyle = 'margin: 0 4px 0 5px; font-size: x-small; display: inline-block;';
		var collapseStyle = 'margin-left: 5px; font-size: x-small; display: inline-block;';
		var comments = getComments();
		for (var i = 0; i < comments.length; i += 1) {
			var comment = comments[i];
			var commentId = comment.getAttribute('id');
			var replyDiv = getFirstChildByClass(comment, 'reply');

			if (toggleHideChild) {
				var numChildren = parseInt(getFirstChildByClass(comment, 'togg').getAttribute('n')) - 1;
				var hideChildCommentsDOM =
					`<a href='javascript:void(0)' class='hackollapseChildren' action='hide'
						n='${numChildren}' comment-id='${commentId}' style='${hideChildStyle}'>
						hide child comments (${numChildren})
					</a>`;

				// only add hideChildCommentsDOM to elements with children
				if (numChildren > 0)
					replyDiv.firstElementChild.insertAdjacentHTML('beforeend', hideChildCommentsDOM);
			}

			if (persistSetting !== 'off') {
				var hackollapseThreadDOM =
					`<a href='javascript:void(0)' class='hackollapseThread' comment-id='${commentId}' style='${collapseStyle}'>
						collapse
					</a>`;

				// add a thread collapse if this is a child comment
				if (getIndent(comment) > 0)
					replyDiv.firstElementChild.insertAdjacentHTML('beforeend', hackollapseThreadDOM);
			}
		}

		addClickHandlers('hackollapseChildren', hackollapseChildren);
		addClickHandlers('hackollapseThread', hackollapseThread);

		// implement neverPersist by changing the id of the logout button. HN checks the presence of that button
		// to tell if a user is logged in and they should persist the collapse. I know, it's awful.
		if (persistSetting === 'neverPersist')
			setLogoutButtonId('logoutHackollapse');
	});
}

function hackollapseChildren(e) {
	var a = e.target;
	var action = a.getAttribute('action');
	var comment = document.getElementById(a.getAttribute('comment-id'));
	var targetWidth = getIndent(comment);
	var comments = getComments();
	var foundComment = false;
	for (var i = 0; i < comments.length; i += 1) {
		var c = comments[i];
		if (c === comment) {
			foundComment = true;
			continue;
		}

		if (!foundComment)
			continue;

		// check the indent of this comment to see if it's still a child.
		// It is no longer a child comment if the indent is less than
		// the comment being expanded/collapsed
		var indent = getIndent(c);
		if (indent <= targetWidth)
			break;

		var display = (action === 'hide') ? 'none' : '';
		c.style.display = display;
	}

	var numChildren = parseInt(a.getAttribute('n'));
	var nextAction = (action === 'hide') ? 'show' : 'hide';
	a.innerText = `${nextAction} child comments (${numChildren})`;
	a.setAttribute('action', nextAction);
}

function hackollapseThread(e) {
	var comment = document.getElementById(e.target.getAttribute('comment-id'));
	var comments = getComments();
	var commentIndex = -1;
	for (var i = 0; i < comments.length; i += 1) {
		if (comment === comments[i]) {
			commentIndex = i;
			break;
		}
	}

	for (i = commentIndex - 1; i >= 0; i -= 1) {
		var c = comments[i];
		if (getIndent(c) === 0) {
			// scroll to the top level comment, and click the [-] icon
			c.scrollIntoView();
			var toggLink = getFirstChildByClass(c, 'togg');
			// temporarily change the logout button id
			if (persistSetting === 'manualPersist')
				setLogoutButtonId('logoutHackollapse');

			toggLink.click();
			// change it back so manual clicks persist
			if (persistSetting === 'manualPersist')
				setLogoutButtonId('logout');

			break;
		}
	}
}

function setLogoutButtonId(id) {
	if (logoutBtn)
		logoutBtn.setAttribute('id', id);
}

function addClickHandlers(clazz, handler) {
	var links = getClass(clazz);
	for (var i = 0; i < links.length; i += 1)
		links[i].addEventListener('click', handler);
}

function getComments() {
	return document.getElementsByClassName('comtr');
}

function getIndent(comment) {
	return comment.getElementsByClassName('ind')[0].firstElementChild.width;
}

function getClass(clazz) {
	return document.getElementsByClassName(clazz);
}

function getFirstChildByClass(elem, clazz) {
	return elem.getElementsByClassName(clazz)[0];
}
