# 0.7.0 - 01-06-2020
- Finally, the chat feature is here! ([#19](https://github.com/videoparty/prime-chrome/issues/19))
- Sidebar slides in more quickly
- Fixed sidebar wasn't showing in fullscreen ([#29](https://github.com/videoparty/prime-chrome/issues/29))
- Merged the new state listener with the existing notifications handler
- Added link to contact the developer in popup

# 0.6.2 - 25-05-2020
- Fixed incorred redirect URL for amazon.com websites ([#27](https://github.com/videoparty/prime-chrome/issues/27))

# 0.6.1 - 23-05-2020
- Another attempt on detecting a trailer and broadcasting it to the party
- Generic fix for the time difference between web players by maintaining a local offset

# 0.6.0 - 22-05-2020
- Introducing the sidebar, showing webplayer information for each party member
- Recent UI updates changed some 'play' buttons. Now supporting any `a` link that contains video information
- Bugfix: When a new member joined during a video, the party wouldn't pause to wait for the member to sync up
- Notifying members if they lost connecton or the server is updating
- Stability improvements with the new webplayer
    - After starting a video, wait for other party members before playing
    - Fixed detection of going to the next episode

# 0.5.4 - 16-05-2020
- A new webplayer was released on 14-05, having obfuscated class names. Now supporting the old and new webplayer ([#24](https://github.com/videoparty/prime-chrome/issues/24))
- Fixed sync difference of +10 or -10 seconds ([#23](https://github.com/videoparty/prime-chrome/issues/23))
- No notification when someone tries to resume while we are watching a trailer

# 0.5.3 - 10-05-2020
- Fix unable to join party through URL after first extension (re)load
- Clear the party information after closing the current tab
- Show current version in the extension popup

# 0.5.2 - 09-05-2020
- Bind events to the player after it becomes visible - preventing a black screen after starting the next episode ([#10](https://github.com/videoparty/prime-chrome/issues/10))

# 0.5.1 - 07-05-2020
- Supporting amazon.com/.co.uk/.de/.co.jp

# 0.5.0 - 05-05-2020
- Starting the next episode in sync
- Closing a video is now synced
- Improved stability on synced actions
- Blocking all remote actions when watching a trailer

# 0.4.1 - 02-05-2020
- Fixed bug which stops the extension from connecting to the syncserver

# 0.4.0 - 02-05-2020
- In case of server reboot, send videoId to restore party state
- Join a party with a displayname
- The trailer and movie won't start at the same time
- Reduced amount of notifications (when pausing and surfing on the site)

# 0.3.0 - 30-04-2020
- Workaround for when the Google Chrome browser blocks autoplay ([#11](https://github.com/videoparty/prime-chrome/issues/11))
- Actions are shown as notifications ([#9](https://github.com/videoparty/prime-chrome/issues/9))
- Added member count in navbar ([#2](https://github.com/videoparty/prime-chrome/issues/2))
- Performance improvements on client side
- Fixed icon displaying

# 0.2.1 - 27-04-2020
- Added [README](README.md) and [LICENSE](LICENSE)
- Attempt on fixing black screen with only audio([#10](https://github.com/videoparty/prime-chrome/issues/10))
- Wait when someone is watching a trailer ([#4](https://github.com/videoparty/prime-chrome/issues/4))
- Don't create a party immediately when visiting primevideo.com ([#1](https://github.com/videoparty/prime-chrome/issues/1))
- Various refactors and improvements

# 0.1.1 - 23-04-2020
- Fixed broken image link in popup

# 0.1.0 - 22-04-2020
- Initial release
