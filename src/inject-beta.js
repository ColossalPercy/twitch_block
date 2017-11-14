/*jshint esversion: 6 */

function betaSite() {

    var config = {
        attributes: false,
        childList: true,
        characterData: false,
        subtree: true
    };

    const htmlStruc = `
    <div class="relative">
        <div class="relative">
            <div>
                <button class="tw-button-icon" id="block-settings-button" title="Edit Block List">
                    <span class="tw-button-icon__icon">
                        <figure class="svg-figure">
                            <svg class="svg svg--inherit" height="16" viewbox="0 0 16 16" width="16">
                                <path d="M8,1C4.13,1,1,4.13,1,8s3.13,7,7,7s7-3.13,7-7S11.87,1,8,1z M3,8c0-2.76,2.24-5,5-5 c1.02,0,1.97,0.31,2.76,0.83l-6.93,6.93C3.31,9.97,3,9.02,3,8z M8,13c-1.02,0-1.97-0.31-2.76-0.83l6.93-6.93 C12.69,6.03,13,6.98,13,8C13,10.76,10.76,13,8,13z"></path>
                            </svg>
                        </figure>
                    </span>
                </button>
            </div>
            <div class="tw-balloon tw-balloon--up" id="block-settings" style="margin-bottom:11px">
                <div class="scrollable-area" data-simplebar="init">
                    <div>
                        <div class="chat-settings c-background c-text  pd-2">
                            <div class="c-background c-text full-width inline-flex flex-column">
                                <p class="c-text-alt-2 upcase">Blocked Users</p>
                            </div>
                            <div class="border-t mg-b-1 mg-t-1" id="block-user-list"></div>
                            <div class="border-t mg-b-1 mg-t-1 pd-t-1">
                                <p>Click username above to unblock!</p>
                            </div>
                            <div class="border-t">
                                <div class="mg-b-1 mg-t-1">
                                    <button class="tw-button" id="block-add-user">
                                        <span class="tw-button__icon">Block New User</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;

    var blockList;

    if (localStorage.getItem('twitchBlockList')) {
        blockList = localStorage.getItem('twitchBlockList').split(',');
        blockList.forEach(function(value) {
            if (value === '') {
                blockList.splice(value, 1);
                localStorage.setItem('twitchBlockList', blockList);
            }
        });
        for (i = 0; i < blockList.length; i++) {
            blockList[i] = blockList[i].toLowerCase();
        }
    } else {
        blockList = [];
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
                if ($('#block-settings-button').length === 0) {
                    buttonsLoaded.observe($("body")[0], config);
                }
                var from = $(addedNode).find('.chat-author__display-name')[0];
                if (typeof from == 'object') {
                    var twitchID = from.innerHTML.toLowerCase();
                    isBlocked(twitchID, $(addedNode));
                }
            });
        });
    });

    //Mutation observer for chat loading
    var chatLoaded = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var chatSelector = $(".chat-list");
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
        $('.chat-buttons-container > .flex-row').append(htmlStruc);
        document.getElementById('block-settings-button').addEventListener('click', blockSettingsShow);

        blockList.forEach(function(id) {
            var user = `
            <div class="mg-t-1" >
                <button id="blocked-user-${id}">${id}</button>
            </div>
            `;
            $('#block-user-list').append(user);
            document.getElementById('blocked-user-' + id).addEventListener('click', removeUser);
        });
        document.getElementById('block-add-user').addEventListener('click', addUser);
    }

    function blockSettingsShow() {
        $('#block-settings').toggleClass('block');
    }

    function addUser() {
        var newUser = prompt("Add a new user to the block list:").toLowerCase();
        if (newUser !== null) {
            blockList.push(newUser);
            $('#block-user-list').append('<div class="mg-t-1"><button id="blocked-user-' + newUser + '">' + newUser + '</button></div>');
            document.getElementById('blocked-user-' + newUser).addEventListener('click', removeUser);
            localStorage.setItem('twitchBlockList', blockList);
            console.log('Added ' + newUser + ' to the block list.');
        }
    }

    function removeUser(event) {
        var removeID = event.target.innerHTML;
        var approved = confirm("Are you sure you wish to unblock " + removeID + "?");

        if (approved === true) {
            console.log('Unblocked ' + removeID + '!');
            blockList.splice(blockList.indexOf(removeID), 1);
            event.target.removeEventListener('click', removeUser);
            localStorage.setItem('twitchBlockList', blockList);
            $(event.target).parent().remove();
        }
    }
}
