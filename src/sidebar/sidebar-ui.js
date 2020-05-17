let myDisplayName;

/**
 * Add a member to the bottom of the member list
 */
function addMemberToList(displayName) {
    const existingMember = $('#members .member[data-id="' + displayName + '"]');
    if (existingMember.length > 0) {
        existingMember.remove();
    }

    $('#members').append('' +
        '<div class="member" data-id="' + displayName + '">\n' +
        '  <span class="status idle">\n' +
        '    <i class="fa fa-desktop"></i>\n' +
        '    <i class="fa fa-play"></i>\n' +
        '    <i class="fa fa-pause"></i>\n' +
        '    <i class="fa fa-spinner fa-pulse fa-fw"></i>\n' +
        '    <i class="fa fa-question"></i>\n' +
        '    <i class="fa fa-film"></i>\n' +
        '    <i class="fa fa-fast-forward"></i>\n' +
        '  </span>\n' +
        '  <span class="displayname">' + displayName + '</span>\n' +
        '</div>');
}

/**
 * Clears the entire member list and rebuilds it according
 * to the given party.
 */
function initMemberList(party) {
    if (!party) {
        console.error('Tried to update member list on an undefined party');
        return;
    }

    $('#members').html(''); // Empty member list

    for (const member of party.members) {
        if (member.isMe) myDisplayName = member.displayName; // Set our member ID (which is displayName currently)
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
 * @param setAllToLoading wether to set all members to 'loading'
 * @see States
 */
function updateMemberStatus(memberId, status, setAllToLoading = true) {
    const memberStatus = $('#members .member[data-id="'+memberId+'"] .status');
    if (memberStatus.length === 0) return;

    if (setAllToLoading) {
        $('#members .member .status').attr('class', 'status loading');
    }

    $(memberStatus).attr('class', 'status ' + status);
}

// Load member list
postWindowMessage({type: 'sb-get-current-party'}, parent);