let myMemberId;

/**
 * Add a member to the bottom of the member list
 */
function addMemberToList(displayName) {
    const existingMember = $('#members .member[data-id="' + displayName + '"]');
    if (existingMember.length > 0) {
        existingMember.remove();
    }

    const sanitizedName = sanitize(displayName);

    $('#members').append('' +
        '<div class="member" data-id="' + sanitizedName + '">\n' +
        '  <span class="status idle">\n' +
        '    <i class="fa fa-desktop"></i>\n' +
        '    <i class="fa fa-play"></i>\n' +
        '    <i class="fa fa-pause"></i>\n' +
        '    <i class="fa fa-check"></i>\n' +
        '    <i class="fa fa-spinner fa-pulse fa-fw"></i>\n' +
        '    <i class="fa fa-question"></i>\n' +
        '    <i class="fa fa-film"></i>\n' +
        '    <i class="fa fa-fast-forward"></i>\n' +
        '  </span>\n' +
        '  <span class="displayname">' + sanitizedName + '</span>\n' +
        '</div>');
}

function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        "`": '&grave;',
    };
    const reg = /[&<>"`'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
}

/**
 * Clears the entire member list and rebuilds it according
 * to the given party.
 */
function initMemberList(members) {
    if (!members || members.length === 0) {
        console.error('Tried to update member list on an undefined party');
        return;
    }

    $('#members').html(''); // Empty member list

    for (const member of members) {
        if (member.isMe) myMemberId = member.displayName; // Set our member ID (which is displayName currently)
        addMemberToList(member.displayName);
    }
}

/**
 * Removes a member from the member list
 * @param displayName of the member to remove
 */
function removeMemberFromList(displayName) {
    $('#members .member[data-id="'+displayName+'"]').remove();
}

/**
 * Update the icon in front of the member
 * @param memberId currently the displayName
 * @param status one of the States enum
 * @see States
 */
function updateMemberStatus(memberId, status) {
    const memberStatus = $('#members .member[data-id="'+memberId+'"] .status');
    if (memberStatus.length === 0) return;

    $(memberStatus).attr('class', 'status ' + status);
}

// Request the state from the main window
postWindowMessage({type: 'sidebar-request-init'}, parent);