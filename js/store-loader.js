(function () {
  var store = window.SamsaraStore;
  var readyEvent = 'samsara:store-ready';

  function done() {
    document.dispatchEvent(new Event(readyEvent));
  }

  function load() {
    if (!store || typeof store.applyData !== 'function') {
      done();
      return;
    }

    fetch('data/store.json', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('store.json not found');
        return response.json();
      })
      .then(function (data) {
        store.applyData(data);
      })
      .catch(function () {
        // локально без сервера — остаётся store-defaults.js
      })
      .then(done);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
