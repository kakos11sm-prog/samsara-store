(function () {
  var REPO = 'kakos11sm-prog/samsara-store';
  var BRANCH = 'main';
  var TOKEN_KEY = 'samsara_gh_token';
  var STORE_PATH = 'data/store.json';
  var state = {
    site: {},
    categories: [],
    products: [],
    currentId: null,
    sha: null
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function setStatus(el, text, isError) {
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? '#c47a6a' : '';
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function toBase64(text) {
    return btoa(unescape(encodeURIComponent(text)));
  }

  function githubHeaders() {
    return {
      Authorization: 'Bearer ' + getToken(),
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  function pretty(obj) {
    return JSON.stringify(obj, null, 2) + '\n';
  }

  function parseImages(text) {
    return String(text || '')
      .split('\n')
      .map(function (line) {
        return line.trim();
      })
      .filter(Boolean)
      .map(function (line) {
        var parts = line.split('|');
        return {
          src: (parts[0] || '').trim(),
          label: (parts[1] || '').trim()
        };
      });
  }

  function imagesToText(images) {
    return (images || [])
      .map(function (item) {
        return item.src + (item.label ? ' | ' + item.label : '');
      })
      .join('\n');
  }

  function rebuildStore() {
    return {
      site: state.site,
      categories: state.categories,
      products: state.products
    };
  }

  function renderList() {
    var list = qs('[data-product-list]');
    list.innerHTML = state.products
      .slice()
      .sort(function (a, b) {
        return String(a.name).localeCompare(String(b.name), 'ru');
      })
      .map(function (product) {
        return (
          '<button type="button" data-open-product="' +
          product.id +
          '"' +
          (product.id === state.currentId ? ' class="is-active"' : '') +
          '>' +
          '<strong>' +
          product.name +
          '</strong>' +
          '<small>' +
          product.category +
          ' · ' +
          product.price +
          ' ₴</small>' +
          '</button>'
        );
      })
      .join('');
  }

  function fillSettings() {
    qs('[name="brand"]').value = state.site.brand || '';
    qs('[name="tagline"]').value = state.site.tagline || '';
    qs('[name="heroText"]').value = state.site.heroText || '';
    qs('[name="email"]').value = state.site.email || '';
    qs('[name="phone"]').value = state.site.phone || '';
    qs('[name="city"]').value = state.site.city || '';
  }

  function fillProduct(product) {
    state.currentId = product ? product.id : null;
    qs('[data-product-heading]').textContent = product ? product.name : 'Новый товар';
    qs('[name="id"]').value = product ? product.id : '';
    qs('[name="id"]').disabled = Boolean(product);
    qs('[name="category"]').value = product ? product.category : 'hat';
    qs('[name="name"]').value = product ? product.name : '';
    qs('[name="price"]').value = product ? product.price : '';
    qs('[name="description"]').value = product ? product.description : '';
    qs('[name="sizes"]').value = product && product.sizes ? product.sizes.join(', ') : '';
    qs('[name="image"]').value = product ? product.image || '' : '';
    qs('[name="images"]').value = product ? imagesToText(product.images) : '';
    renderList();
  }

  function showPanel(name) {
    qs('[data-panel="settings"]').classList.toggle('is-hidden', name !== 'settings');
    qs('[data-panel="product"]').classList.toggle('is-hidden', name !== 'product');
  }

  function readProductForm() {
    var id = qs('[name="id"]').value.trim();
    var images = parseImages(qs('[name="images"]').value);
    var image = qs('[name="image"]').value.trim() || (images[0] && images[0].src) || '';
    var current = state.products.find(function (item) {
      return item.id === id;
    });
    return {
      id: id,
      category: qs('[name="category"]').value,
      name: qs('[name="name"]').value.trim(),
      price: Number(qs('[name="price"]').value) || 0,
      description: qs('[name="description"]').value.trim(),
      sizes: qs('[name="sizes"]')
        .value.split(',')
        .map(function (part) {
          return part.trim();
        })
        .filter(Boolean),
      symbol: (current && current.symbol) || '',
      image: image,
      images: images
    };
  }

  function saveStore(message, statusEl) {
    if (!getToken()) {
      setStatus(statusEl, 'Сначала сохраните GitHub token выше', true);
      return Promise.reject(new Error('no token'));
    }

    setStatus(statusEl, 'Сохраняю в GitHub...');
    var body = {
      message: message,
      content: toBase64(pretty(rebuildStore())),
      branch: BRANCH
    };
    if (state.sha) body.sha = state.sha;

    return fetch('https://api.github.com/repos/' + REPO + '/contents/' + STORE_PATH, {
      method: 'PUT',
      headers: githubHeaders(),
      body: JSON.stringify(body)
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error((data && data.message) || 'Ошибка сохранения');
          state.sha = data.content && data.content.sha;
          setStatus(statusEl, 'Сохранено. Сайт обновится на Netlify через 1–2 минуты.');
        });
      });
  }

  function saveProduct() {
    var status = qs('[data-product-status]');
    var product = readProductForm();
    if (!product.id || !product.name) {
      setStatus(status, 'Укажите ID и название', true);
      return;
    }

    var index = state.products.findIndex(function (item) {
      return item.id === product.id;
    });
    if (index >= 0) state.products[index] = product;
    else state.products.push(product);

    saveStore('Update product ' + product.id, status)
      .then(function () {
        fillProduct(product);
      })
      .catch(function (error) {
        setStatus(status, error.message || String(error), true);
      });
  }

  function deleteProduct() {
    var status = qs('[data-product-status]');
    var id = qs('[name="id"]').value.trim();
    if (!id) {
      setStatus(status, 'Нет товара', true);
      return;
    }
    if (!confirm('Удалить товар ' + id + '?')) return;

    state.products = state.products.filter(function (item) {
      return item.id !== id;
    });

    saveStore('Delete product ' + id, status)
      .then(function () {
        fillProduct(state.products[0] || null);
      })
      .catch(function (error) {
        setStatus(status, error.message || String(error), true);
      });
  }

  function saveSettings() {
    var status = qs('[data-settings-status]');
    state.site = {
      brand: qs('[name="brand"]').value.trim(),
      tagline: qs('[name="tagline"]').value.trim(),
      heroText: qs('[name="heroText"]').value.trim(),
      email: qs('[name="email"]').value.trim(),
      phone: qs('[name="phone"]').value.trim(),
      city: qs('[name="city"]').value.trim()
    };

    saveStore('Update site settings', status).catch(function (error) {
      setStatus(status, error.message || String(error), true);
    });
  }

  function loadData() {
    return fetch('https://api.github.com/repos/' + REPO + '/contents/' + STORE_PATH + '?ref=' + BRANCH, {
      headers: getToken()
        ? githubHeaders()
        : { Accept: 'application/vnd.github+json' }
    })
      .then(function (response) {
        if (response.ok) return response.json();
        return null;
      })
      .then(function (file) {
        if (file && file.content) {
          state.sha = file.sha;
          return JSON.parse(decodeURIComponent(escape(atob(file.content.replace(/\n/g, '')))));
        }
        return fetch('data/store.json', { cache: 'no-store' }).then(function (response) {
          if (!response.ok) throw new Error('Не удалось загрузить данные');
          return response.json();
        });
      })
      .then(function (data) {
        state.site = data.site || {};
        state.categories = data.categories || [];
        state.products = data.products || [];
        fillSettings();
        var wanted = new URLSearchParams(location.search).get('id');
        var product =
          state.products.find(function (item) {
            return item.id === wanted;
          }) || state.products[0];
        showPanel('product');
        fillProduct(product || null);
      });
  }

  function updateAuthStatus() {
    var status = qs('[data-auth-status]');
    if (getToken()) {
      qs('#token').placeholder = 'Token уже сохранён в браузере';
      setStatus(status, 'Token найден. Можно сохранять.');
    } else {
      setStatus(status, 'Token ещё не сохранён', true);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateAuthStatus();

    qs('[data-save-token]').addEventListener('click', function () {
      var value = qs('#token').value.trim();
      if (!value) {
        setStatus(qs('[data-auth-status]'), 'Вставьте token', true);
        return;
      }
      localStorage.setItem(TOKEN_KEY, value);
      qs('#token').value = '';
      updateAuthStatus();
      loadData().catch(function () {});
    });

    qs('[data-tab="settings"]').addEventListener('click', function () {
      showPanel('settings');
    });

    qs('[data-new-product]').addEventListener('click', function () {
      showPanel('product');
      fillProduct(null);
      qs('[name="id"]').disabled = false;
    });

    qs('[data-product-list]').addEventListener('click', function (event) {
      var btn = event.target.closest('[data-open-product]');
      if (!btn) return;
      var product = state.products.find(function (item) {
        return item.id === btn.getAttribute('data-open-product');
      });
      if (!product) return;
      showPanel('product');
      fillProduct(product);
    });

    qs('[data-save-product]').addEventListener('click', saveProduct);
    qs('[data-delete-product]').addEventListener('click', deleteProduct);
    qs('[data-save-settings]').addEventListener('click', saveSettings);

    loadData().catch(function (error) {
      setStatus(qs('[data-product-status]'), error.message || String(error), true);
    });
  });
})();
