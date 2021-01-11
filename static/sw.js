'use strict';

/* eslint-enable max-len */

self.addEventListener('install', function(event) {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating.');
});

self.addEventListener('push', function(event) {
  const pushData = event.data.json();
  let data, title, body, icon, image, id;
  try {
    data = pushData;
    title = data.title;
    body = data.body;
    image = `${location.origin}/image/${data.data}.png`;
    icon = `${location.origin}/image/${data.data}.png`;
    id = data.data
  } catch(e) {
    title = "Untitled";
    body = pushData;
    image: null
    id: null
  }
  const options = {
    body: body,
    image: image,
    icon: icon,
    data: id,
    actions: [{ action: "approve", title: "Approve" }],
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", function (event) {
  if (event.action == "approve") {
    console.log(event);
    fetch(`${location.origin}/set-flags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ approved: true, flags: [event.notification.data] }),
    }).then(res => {event.notification.close(); return res.json();}).then(data=>console.log(data));
  }
}, false);