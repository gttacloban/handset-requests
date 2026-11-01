Globe Handset Requests — Mobile Installation
============================================

App URL:
https://gttacloban.github.io/handset-requests/

Mobile installation page (available after deployment):
https://gttacloban.github.io/handset-requests/install.html

HOW TO PUBLISH
1. Open the handset-requests repository on GitHub.
2. Upload these files to the repository root (alongside index.html):
   index.html, install.html, manifest.webmanifest, sw.js,
   icon-192.png, icon-512.png, icon-maskable.png, apple-touch-icon.png.
3. Replace the old index.html with the packaged version if you have not already uploaded it.
4. Wait for GitHub Pages to publish the files; then open install.html on a phone.

HOW TO INSTALL
Android: use Install app / Add to Home screen from Chrome.
iPhone: open in Safari, tap Share, Add to Home Screen, then Add.

Notes: Installation cannot happen without the user's approval.
Internet access and Google sign-in are required to use the tracker.
The service worker does not cache customer records.
No changes to Code.gs are required for translating the installation page.
