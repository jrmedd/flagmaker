if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  }