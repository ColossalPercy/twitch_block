var config = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
};

var blockButton = [
    '<a class="button button--icon-only float-left" id="blockEdit" title="Edit Block List">',
        '<figure class="icon">',
            '<svg class="svg-edit-block" height="16" viewBox="0 0 16 16" width="16">',
                '<path d="M8,1C4.13,1,1,4.13,1,8s3.13,7,7,7s7-3.13,7-7S11.87,1,8,1z M3,8c0-2.76,2.24-5,5-5 c1.02,0,1.97,0.31,2.76,0.83l-6.93,6.93C3.31,9.97,3,9.02,3,8z M8,13c-1.02,0-1.97-0.31-2.76-0.83l6.93-6.93 C12.69,6.03,13,6.98,13,8C13,10.76,10.76,13,8,13z"/>',
            '</svg>',
        '</figure>',
    '</a>'
].join('');

var htmlTemplate1 = [
    '<div id="blockedUsersSettings" class="js-chat-settings-menu chat-settings chat-menu hidden dropmenu ember-view">',
        '<div class="list-header first">Blocked Users</div>',
            '<div id="blocked-users-container" class="chat-menu-content">'
].join('');

var htmlTemplate2 = [
            '</div>',
        '</div>',
        '<div class="list-header" style="padding:0"></div>',
            '<div class="chat-menu-content">',
                "<p>Click above name to unblock.</p>",
            '</div>',
        '</div>',
        '<div class="list-header" style="padding:0;margin-top:0"></div>',
            '<div class="chat-menu-content">',
                '<button id="addUserButton" class="button float-left" style="margin-bottom:5px">Block New User</button>',
            '</div>',
        '</div>',
    '</div>'
].join('');

if (localStorage.getItem('twitchBlockList')) {
    var blockList = localStorage.getItem('twitchBlockList').split(',');
    blockList.forEach(function(value){
        if (value === '') {
            blockList.splice(value, 1);
            localStorage.setItem('twitchBlockList', blockList);
        }
    });
} else {
    var blockList = [];
    localStorage.setItem('twitchBlockList', blockList);
}


var loaded;

//MutationObserver for buttons loaded
var buttonsLoaded = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        var chatSelector = $('.chat-buttons-container');
        if (chatSelector.length > 0) {
            buttonsLoaded.disconnect();
            loaded = true;
        }
    });
    if (loaded) {
        addButton();
    }
});
buttonsLoaded.observe($("body")[0], config);

//Mutation observer for each chat message
var chatObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(addedNode) {
            var from = $(addedNode).find('.from')[0];
            if (typeof from == 'object') {
                var twitchID = from.innerHTML;
                isBlocked(twitchID, $(addedNode));
                if ($('#blockEdit').length === 0) {
                    buttonsLoaded.observe($("body")[0], config);
                }
            }
        });
    });
});

//Mutation observer for chat loading
var chatLoaded = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        var chatSelector = $(".chat-lines");
        if (chatSelector.length > 0) {
            var target = chatSelector[0];
            chatObserver.observe(target, config);
        }
    });
});
chatLoaded.observe($("body")[0], config);




function isBlocked(twitchID, node) {
    if (blockList.indexOf(twitchID) !== -1) {
        node.remove();
    }
}

function addButton() {
    $('.chat-buttons-container').append(blockButton);
    document.getElementById('blockEdit').addEventListener('click', blockListEdit);

    $('.chat-buttons-container').after(htmlTemplate1);
    blockList.forEach(function(id) {
        $('#blocked-users-container').append(
            '<p><button id="blocked-user-' + id + '" title="Click to unblock user">' + id + '</button></p>'
        );
        document.getElementById('blocked-user-' + id).addEventListener('click', removeUser);
    });
    $('#blocked-users-container').after(htmlTemplate2);
    document.getElementById('addUserButton').addEventListener('click', addBlockedUser);
}

function blockListEdit() {
    $('#blockedUsersSettings').toggleClass('hidden');
}

function addBlockedUser() {
    var newUser = prompt("Add a new user to the block list (case sensitive):");
    if (newUser !== null) {
        blockList.push(newUser);
        $('#blocked-users-container').append('<p><button id="blocked-user-' + newUser + '">' + newUser + '</button></p>');
        document.getElementById('blocked-user-' + newUser).addEventListener('click', removeUser);
        localStorage.setItem('twitchBlockList', blockList);
        console.log('Added ' + newUser + ' to the block list.');
    }
}

function removeUser(event) {
    var removeID = event.target.id;
    removeID = removeID.substr(13);
    var approved = confirm("Are you sure you wish to unblock " + removeID + "?");

    if (approved === true) {
        console.log('Unblocked ' + removeID + '!');
        blockList.splice(blockList.indexOf(removeID), 1);
        event.target.removeEventListener('click', removeUser);
        localStorage.setItem('twitchBlockList', blockList);
        $(event.target).parent().remove();
    }
}
