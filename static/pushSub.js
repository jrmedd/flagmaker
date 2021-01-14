'use strict';

let sw;
const manageSubUrl = `${location.origin}/manage-subs`;
const notificationButton = document.getElementById("notify");

let userIsSubbed = false;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function updateSubscriptionOnServer(subscription, apiEndpoint, method) {
  return fetch(apiEndpoint, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription_json: JSON.stringify(subscription)
    })
  }).then(res=>{
    if (method == "POST") {
      notificationButton.textContent = "Stop notifications";
      userIsSubbed = true;
    }
    else if (method == "DELETE") {
      notificationButton.textContent = "Get notifications";
      userIsSubbed = false;
    }
  });

}

function subscribeUser(swRegistration, applicationServerPublicKey, apiEndpoint) {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
   swRegistration.pushManager
      .subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      })
      .then(function (subscription) {
        console.log("User is subscribed.");
        return updateSubscriptionOnServer(subscription, apiEndpoint, 'POST');
      });
}


function registerServiceWorker(serviceWorkerUrl) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
    navigator.serviceWorker.register(serviceWorkerUrl)
    .then(function(swReg) {
      sw = swReg;
      console.log('Service Worker is registered', swReg);
      sw.pushManager.getSubscription().then(subbed=>{
        if (subbed) {
          notificationButton.textContent = "Stop notifications";
          userIsSubbed = true;
        }
        else {
           notificationButton.textContent = "Get notifications";
           userIsSubbed = false;
        }
      })
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.warn('Push messaging is not supported');
  } 
}


document.addEventListener("DOMContentLoaded", ()=>registerServiceWorker("sw.js"));
notificationButton.addEventListener("click", (event) => {
  if (userIsSubbed) {
    sw.pushManager.getSubscription().then(subscription=>{
      subscription.unsubscribe();
      updateSubscriptionOnServer(subscription, manageSubUrl, 'DELETE');
  })
  }
  else {
    subscribeUser(sw, pushPublicKey,  manageSubUrl);
  }
});
