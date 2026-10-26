(function () {
  var REPO = 'kakos11sm-prog/samsara-store';
  var BRANCH = 'main';
  var TOKEN_KEY = 'samsara_gh_token';
  var STORE_PATH = 'data/store.json';
  var CATEGORY_NAMES = {
    boots: 'Ботинки',
    hat: 'Шапка',
    sweater: 'Кофта',
    jacket: 'Куртка',
    gloves: 'Перчатки'
  };

  var state = {
    site: {},
    categories: [],
    products: [],
    draft: null,
    isNew: false,
    sha: null,
    activeImage: 0,
    modal: null
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
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

  function categoryLabel(id) {
    return CATEGORY_NAMES[id] || id;
  }

  function formatPrice(value) {
    return new Intl.NumberFormat('ru-RU').format(Number(value) || 0) + ' ₴';
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function cloneProduct(product) {
    return JSON.parse(JSON.stringify(product || {}));
  }

  function emptyProduct() {
    return {
      id: '',
      category: 'hat',
      name: 'Новый товар',
      price: 0,
      description: 'Добавьте описание',
      manufacturer: '',
      material: '',
      sizes: ['M'],
      symbol: '',
      image: '',
      images: []
    };
  }

  function metaRowHtml(label, field, value) {
    var hasValue = Boolean(value && String(value).trim());
    return (
      '<div class="ve-meta-row">' +
      '<div class="ve-meta-text">' +
      '<span class="ve-meta-label">' +
      label +
      '</span>' +
      '<span class="ve-meta-value">' +
      (hasValue ? escapeHtml(value) : 'Не указано') +
      '</span>' +
      '</div>' +
      '<div class="ve-meta-actions">' +
      (hasValue
        ? '<button type="button" class="ve-icon-btn" data-ve-edit-field="' +
          field +
          '" title="Изменить">✎</button>' +
          '<button type="button" class="ve-icon-btn ve-icon-danger" data-ve-clear-field="' +
          field +
          '" title="Убрать">×</button>'
        : '<button type="button" class="ve-plus" data-ve-edit-field="' +
          field +
          '" title="Добавить">+</button>') +
      '</div>' +
      '</div>'
    );
  }

  function getImages(product) {
    if (product.images && product.images.length) return product.images;
    if (product.image) return [{ src: product.image, label: '' }];
    return [];
  }

  function syncPrimaryImage(product) {
    var images = getImages(product);
    product.images = images;
    product.image = images[0] ? images[0].src : '';
  }

  function rebuildStore() {
    return {
      site: state.site,
      categories: state.categories,
      products: state.products
    };
  }

  function commitDraftToState() {
    if (!state.draft) return;
    syncPrimaryImage(state.draft);
    if (state.isNew) {
      if (!state.draft.id) return;
      var exists = state.products.some(function (item) {
        return item.id === state.draft.id;
      });
      if (!exists) state.products.push(cloneProduct(state.draft));
      else {
        state.products = state.products.map(function (item) {
          return item.id === state.draft.id ? cloneProduct(state.draft) : item;
        });
      }
      state.isNew = false;
    } else {
      state.products = state.products.map(function (item) {
        return item.id === state.draft.id ? cloneProduct(state.draft) : item;
      });
    }
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
          (state.draft && product.id === state.draft.id ? ' class="is-active"' : '') +
          '>' +
          '<strong>' +
          escapeHtml(product.name) +
          '</strong>' +
          '<small>' +
          categoryLabel(product.category) +
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
    if (qs('[name="telegram"]')) qs('[name="telegram"]').value = state.site.telegram || '';
  }

  function updateToolbar() {
    var product = state.draft;
    var idInput = qs('[data-ve-id]');
    var catSelect = qs('[data-ve-category]');
    var preview = qs('[data-preview-product]');
    if (!product) return;
    idInput.value = product.id || '';
    idInput.disabled = !state.isNew && Boolean(product.id);
    catSelect.value = product.category || 'hat';
    if (preview) {
      if (product.id) {
        preview.href = 'product.html?id=' + encodeURIComponent(product.id);
        preview.classList.remove('is-hidden');
      } else {
        preview.classList.add('is-hidden');
      }
    }
  }

  function productVisualHtml(src, symbol) {
    if (src) {
      return (
        '<div class="product-visual has-image">' +
        '<img class="product-photo" src="' +
        escapeHtml(src) +
        '" alt="" onerror="this.remove()">' +
        '<span class="product-visual-fallback" aria-hidden="true">' +
        escapeHtml(symbol || '◎') +
        '</span>' +
        '</div>'
      );
    }
    return (
      '<div class="product-visual"><span class="product-visual-fallback">' +
      escapeHtml(symbol || '◎') +
      '</span></div>'
    );
  }

  function renderVisualEditor() {
    var mount = qs('[data-visual-editor]');
    var product = state.draft;
    if (!mount || !product) {
      if (mount) mount.innerHTML = '<div class="empty-state"><h2>Выберите товар</h2></div>';
      return;
    }

    syncPrimaryImage(product);
    var images = getImages(product);
    if (state.activeImage >= images.length) state.activeImage = 0;
    var current = images[state.activeImage] || { src: '', label: '' };

    var colorsHtml = images
      .map(function (image, index) {
        return (
          '<div class="ve-chip' +
          (index === state.activeImage ? ' is-active' : '') +
          '" data-ve-select-image="' +
          index +
          '">' +
          '<span>' +
          escapeHtml(image.label || 'Фото ' + (index + 1)) +
          '</span>' +
          '<button type="button" class="ve-icon-btn" data-ve-edit-image="' +
          index +
          '" title="Изменить">✎</button>' +
          '<button type="button" class="ve-icon-btn ve-icon-danger" data-ve-delete-image="' +
          index +
          '" title="Удалить">×</button>' +
          '</div>'
        );
      })
      .join('');

    var sizesHtml = (product.sizes || [])
      .map(function (size, index) {
        return (
          '<div class="ve-chip">' +
          '<span>' +
          escapeHtml(size) +
          '</span>' +
          '<button type="button" class="ve-icon-btn" data-ve-edit-size="' +
          index +
          '" title="Изменить">✎</button>' +
          '<button type="button" class="ve-icon-btn ve-icon-danger" data-ve-delete-size="' +
          index +
          '" title="Удалить">×</button>' +
          '</div>'
        );
      })
      .join('');

    mount.innerHTML =
      '<div class="product-gallery ve-gallery">' +
      productVisualHtml(current.src, product.symbol) +
      '<button type="button" class="ve-fab ve-fab-edit" data-ve-edit-image="' +
      state.activeImage +
      '" title="Изменить фото">✎</button>' +
      '<button type="button" class="ve-fab ve-fab-add" data-ve-add-image title="Добавить фото">+</button>' +
      '</div>' +
      '<div class="product-info">' +
      '<div class="ve-field">' +
      '<div class="product-card-cat">' +
      escapeHtml(categoryLabel(product.category)) +
      '</div>' +
      '<button type="button" class="ve-icon-btn" data-ve-edit-field="category" title="Изменить раздел">✎</button>' +
      '</div>' +
      '<div class="ve-field">' +
      '<h1>' +
      escapeHtml(product.name) +
      '</h1>' +
      '<button type="button" class="ve-icon-btn" data-ve-edit-field="name" title="Изменить название">✎</button>' +
      '</div>' +
      '<div class="ve-field">' +
      '<div class="product-price">' +
      formatPrice(product.price) +
      '</div>' +
      '<button type="button" class="ve-icon-btn" data-ve-edit-field="price" title="Изменить цену">✎</button>' +
      '</div>' +
      '<div class="ve-field ve-field-block">' +
      '<p class="product-desc">' +
      escapeHtml(product.description) +
      '</p>' +
      '<button type="button" class="ve-icon-btn" data-ve-edit-field="description" title="Изменить описание">✎</button>' +
      '</div>' +
      '<div class="ve-meta-list">' +
      metaRowHtml('Производитель', 'manufacturer', product.manufacturer) +
      metaRowHtml('Материал', 'material', product.material) +
      '</div>' +
      '<div class="form-group">' +
      '<div class="ve-label-row"><label>Цвет / фото</label>' +
      '<button type="button" class="ve-plus" data-ve-add-image title="Добавить фото">+</button></div>' +
      '<div class="ve-chip-row">' +
      (colorsHtml || '<span class="ve-empty">Пока нет фото — нажмите +</span>') +
      '</div>' +
      '</div>' +
      '<div class="form-group">' +
      '<div class="ve-label-row"><label>Размер</label>' +
      '<button type="button" class="ve-plus" data-ve-add-size title="Добавить размер">+</button></div>' +
      '<div class="ve-chip-row">' +
      (sizesHtml || '<span class="ve-empty">Пока нет размеров — нажмите +</span>') +
      '</div>' +
      '</div>' +
      '<button type="button" class="btn btn-primary" disabled>В корзину</button>' +
      '</div>';

    updateToolbar();
    renderList();
  }

  function openModal(config) {
    state.modal = config;
    var modal = qs('[data-ve-modal]');
    qs('[data-ve-modal-title]').textContent = config.title;
    qs('[data-ve-modal-body]').innerHTML = config.bodyHtml;
    qs('[data-ve-modal-delete]').classList.toggle('is-hidden', !config.onDelete);
    modal.classList.remove('is-hidden');
    var first = qs('[data-ve-modal-body] input, [data-ve-modal-body] textarea, [data-ve-modal-body] select');
    if (first) first.focus();
  }

  function closeModal() {
    state.modal = null;
    qs('[data-ve-modal]').classList.add('is-hidden');
  }

  function applyDraftChange() {
    commitDraftToState();
    renderVisualEditor();
    setStatus(qs('[data-product-status]'), 'Изменения на экране. Нажмите «Сохранить на сайт», чтобы опубликовать.');
  }

  function editTextField(field) {
    var product = state.draft;
    if (!product) return;

    if (field === 'category') {
      openModal({
        title: 'Раздел каталога',
        bodyHtml:
          '<div class="form-group"><select class="form-control" data-ve-input>' +
          Object.keys(CATEGORY_NAMES)
            .map(function (key) {
              return (
                '<option value="' +
                key +
                '"' +
                (product.category === key ? ' selected' : '') +
                '>' +
                CATEGORY_NAMES[key] +
                '</option>'
              );
            })
            .join('') +
          '</select></div>',
        onOk: function () {
          product.category = qs('[data-ve-input]').value;
          applyDraftChange();
        }
      });
      return;
    }

    var labels = {
      name: 'Название',
      price: 'Цена (₴)',
      description: 'Описание',
      manufacturer: 'Производитель',
      material: 'Материал'
    };
    var isArea = field === 'description';
    var canClear = field === 'manufacturer' || field === 'material';
    openModal({
      title: labels[field] || 'Изменить',
      bodyHtml:
        '<div class="form-group">' +
        (isArea
          ? '<textarea class="form-control" rows="5" data-ve-input>' +
            escapeHtml(product[field] || '') +
            '</textarea>'
          : '<input class="form-control" data-ve-input type="' +
            (field === 'price' ? 'number' : 'text') +
            '" value="' +
            escapeHtml(product[field] || '') +
            '" placeholder="' +
            (field === 'manufacturer'
              ? 'Например: Samsara Atelier'
              : field === 'material'
                ? 'Например: натуральная кожа'
                : '') +
            '">') +
        '</div>',
      onOk: function () {
        var value = qs('[data-ve-input]').value.trim();
        if (field === 'price') product.price = Number(value) || 0;
        else if (canClear) product[field] = value;
        else product[field] = value || product[field];
        applyDraftChange();
      },
      onDelete: canClear
        ? function () {
            product[field] = '';
            applyDraftChange();
          }
        : null
    });
  }

  function editImage(index) {
    var images = getImages(state.draft);
    var image = images[index] || { src: '', label: '' };
    openModal({
      title: index == null || !images[index] ? 'Добавить фото' : 'Изменить фото',
      bodyHtml:
        '<div class="form-group"><label>Путь к файлу</label><input class="form-control" data-ve-src value="' +
        escapeHtml(image.src) +
        '" placeholder="media/products/hat-wool.jpg"><p class="field-hint">Файл должен лежать в media/products</p></div>' +
        '<div class="form-group"><label>Название цвета</label><input class="form-control" data-ve-label value="' +
        escapeHtml(image.label || '') +
        '" placeholder="Чёрная"></div>',
      onOk: function () {
        var next = {
          src: qs('[data-ve-src]').value.trim(),
          label: qs('[data-ve-label]').value.trim()
        };
        if (!next.src) return;
        if (index == null || index < 0 || !images[index]) {
          images.push(next);
          state.activeImage = images.length - 1;
        } else {
          images[index] = next;
          state.activeImage = index;
        }
        state.draft.images = images;
        applyDraftChange();
      },
      onDelete:
        images[index] && images.length
          ? function () {
              images.splice(index, 1);
              state.draft.images = images;
              state.activeImage = 0;
              applyDraftChange();
            }
          : null
    });
  }

  function editSize(index) {
    var sizes = (state.draft.sizes || []).slice();
    var current = sizes[index] || '';
    openModal({
      title: index == null || index < 0 ? 'Добавить размер' : 'Изменить размер',
      bodyHtml:
        '<div class="form-group"><input class="form-control" data-ve-input value="' +
        escapeHtml(current) +
        '" placeholder="M или 42"></div>',
      onOk: function () {
        var value = qs('[data-ve-input]').value.trim();
        if (!value) return;
        if (index == null || index < 0 || sizes[index] == null) sizes.push(value);
        else sizes[index] = value;
        state.draft.sizes = sizes;
        applyDraftChange();
      },
      onDelete:
        sizes[index] != null
          ? function () {
              sizes.splice(index, 1);
              state.draft.sizes = sizes;
              applyDraftChange();
            }
          : null
    });
  }

  function bindVisualEditor() {
    var mount = qs('[data-visual-editor]');
    if (!mount || mount.dataset.bound) return;
    mount.dataset.bound = '1';

    mount.addEventListener('click', function (event) {
      var editField = event.target.closest('[data-ve-edit-field]');
      if (editField) {
        editTextField(editField.getAttribute('data-ve-edit-field'));
        return;
      }

      var clearField = event.target.closest('[data-ve-clear-field]');
      if (clearField) {
        var clearName = clearField.getAttribute('data-ve-clear-field');
        if (state.draft) {
          state.draft[clearName] = '';
          applyDraftChange();
        }
        return;
      }

      var selectImage = event.target.closest('[data-ve-select-image]');
      if (selectImage && !event.target.closest('.ve-icon-btn')) {
        state.activeImage = Number(selectImage.getAttribute('data-ve-select-image'));
        renderVisualEditor();
        return;
      }

      var editImageBtn = event.target.closest('[data-ve-edit-image]');
      if (editImageBtn) {
        var imgIndex = editImageBtn.getAttribute('data-ve-edit-image');
        editImage(imgIndex === '' || imgIndex == null ? -1 : Number(imgIndex));
        return;
      }

      if (event.target.closest('[data-ve-add-image]')) {
        editImage(-1);
        return;
      }

      var deleteImage = event.target.closest('[data-ve-delete-image]');
      if (deleteImage) {
        var di = Number(deleteImage.getAttribute('data-ve-delete-image'));
        state.draft.images = getImages(state.draft);
        state.draft.images.splice(di, 1);
        state.activeImage = 0;
        applyDraftChange();
        return;
      }

      var editSizeBtn = event.target.closest('[data-ve-edit-size]');
      if (editSizeBtn) {
        editSize(Number(editSizeBtn.getAttribute('data-ve-edit-size')));
        return;
      }

      if (event.target.closest('[data-ve-add-size]')) {
        editSize(-1);
        return;
      }

      var deleteSize = event.target.closest('[data-ve-delete-size]');
      if (deleteSize) {
        var ds = Number(deleteSize.getAttribute('data-ve-delete-size'));
        state.draft.sizes.splice(ds, 1);
        applyDraftChange();
      }
    });
  }

  function showPanel(name) {
    qs('[data-panel="settings"]').classList.toggle('is-hidden', name !== 'settings');
    qs('[data-panel="product"]').classList.toggle('is-hidden', name !== 'product');
  }

  function fillProduct(product, isNew) {
    state.isNew = Boolean(isNew);
    state.draft = cloneProduct(product || emptyProduct());
    state.activeImage = 0;
    if (!state.draft.sizes) state.draft.sizes = [];
    if (!state.draft.images) state.draft.images = [];
    if (!state.draft.manufacturer) state.draft.manufacturer = '';
    if (!state.draft.material) state.draft.material = '';
    renderVisualEditor();
  }

  function saveStore(message, statusEl) {
    if (!getToken()) {
      setStatus(statusEl, 'Сначала вставьте ключ доступа вверху и нажмите «Запомнить ключ»', true);
      expandAuth(true);
      return Promise.reject(new Error('no token'));
    }

    setStatus(statusEl, 'Сохраняю...');
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
    }).then(function (response) {
      return response.json().then(function (data) {
        if (!response.ok) throw new Error((data && data.message) || 'Не удалось сохранить. Проверьте ключ доступа.');
        state.sha = data.content && data.content.sha;
        setStatus(statusEl, 'Готово. Через 1–2 минуты откройте сайт и обновите страницу.');
      });
    });
  }

  function saveProduct() {
    var status = qs('[data-product-status]');
    if (!state.draft) return;

    if (state.isNew) {
      var idValue = qs('[data-ve-id]').value.trim();
      if (!idValue) {
        setStatus(status, 'Для нового товара укажите код латиницей, например hat-wool', true);
        return;
      }
      state.draft.id = idValue;
    }

    if (!state.draft.id || !state.draft.name) {
      setStatus(status, 'Нужны код товара и название', true);
      return;
    }

    state.draft.category = qs('[data-ve-category]').value;
    syncPrimaryImage(state.draft);
    commitDraftToState();

    saveStore('Update product ' + state.draft.id, status)
      .then(function () {
        fillProduct(state.draft, false);
      })
      .catch(function (error) {
        setStatus(status, error.message || String(error), true);
      });
  }

  function deleteProduct() {
    var status = qs('[data-product-status]');
    if (!state.draft || !state.draft.id) {
      setStatus(status, 'Нет товара', true);
      return;
    }
    if (!confirm('Удалить товар «' + state.draft.name + '»?')) return;

    var id = state.draft.id;
    state.products = state.products.filter(function (item) {
      return item.id !== id;
    });

    saveStore('Delete product ' + id, status)
      .then(function () {
        fillProduct(state.products[0] || emptyProduct(), !state.products.length);
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
      city: qs('[name="city"]').value.trim(),
      telegram: (qs('[name="telegram"]') && qs('[name="telegram"]').value.trim().replace(/^@/, '')) || state.site.telegram || ''
    };

    saveStore('Update site settings', status).catch(function (error) {
      setStatus(status, error.message || String(error), true);
    });
  }

  function loadData() {
    return fetch('https://api.github.com/repos/' + REPO + '/contents/' + STORE_PATH + '?ref=' + BRANCH, {
      headers: getToken() ? githubHeaders() : { Accept: 'application/vnd.github+json' }
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
        fillProduct(product || emptyProduct(), !product);
      });
  }

  function expandAuth(open) {
    var panel = qs('[data-auth-panel]');
    var toggle = qs('[data-auth-toggle]');
    if (!panel || !toggle) return;
    panel.classList.toggle('is-collapsed', !open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function updateAuthStatus() {
    var status = qs('[data-auth-status]');
    var title = qs('[data-auth-title]');
    if (getToken()) {
      qs('#token').placeholder = 'Ключ уже сохранён в этом браузере';
      if (title) title.textContent = 'Ключ доступа сохранён ✓';
      setStatus(status, 'Можно сохранять товары и текст сайта.');
      expandAuth(false);
    } else {
      if (title) title.textContent = '1. Ключ доступа (нужен один раз)';
      setStatus(status, 'Без ключа сохранение не сработает', true);
      expandAuth(true);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateAuthStatus();
    bindVisualEditor();

    qs('[data-auth-toggle]').addEventListener('click', function () {
      var panel = qs('[data-auth-panel]');
      expandAuth(panel.classList.contains('is-collapsed'));
    });

    qs('[data-save-token]').addEventListener('click', function () {
      var value = qs('#token').value.trim();
      if (!value) {
        setStatus(qs('[data-auth-status]'), 'Вставьте ключ в поле выше', true);
        return;
      }
      localStorage.setItem(TOKEN_KEY, value);
      qs('#token').value = '';
      updateAuthStatus();
      loadData().catch(function () {});
    });

    qs('[data-clear-token]').addEventListener('click', function () {
      localStorage.removeItem(TOKEN_KEY);
      updateAuthStatus();
      setStatus(qs('[data-auth-status]'), 'Ключ удалён из браузера', true);
    });

    qs('[data-tab="settings"]').addEventListener('click', function () {
      showPanel('settings');
    });

    qs('[data-new-product]').addEventListener('click', function () {
      showPanel('product');
      fillProduct(emptyProduct(), true);
      qs('[data-ve-id]').disabled = false;
      qs('[data-ve-id]').focus();
    });

    qs('[data-product-list]').addEventListener('click', function (event) {
      var btn = event.target.closest('[data-open-product]');
      if (!btn) return;
      var product = state.products.find(function (item) {
        return item.id === btn.getAttribute('data-open-product');
      });
      if (!product) return;
      showPanel('product');
      fillProduct(product, false);
    });

    qs('[data-ve-category]').addEventListener('change', function () {
      if (!state.draft) return;
      state.draft.category = qs('[data-ve-category]').value;
      applyDraftChange();
    });

    qs('[data-ve-id]').addEventListener('input', function () {
      if (!state.draft || !state.isNew) return;
      state.draft.id = qs('[data-ve-id]').value.trim();
    });

    qs('[data-save-product]').addEventListener('click', saveProduct);
    qs('[data-delete-product]').addEventListener('click', deleteProduct);
    qs('[data-save-settings]').addEventListener('click', saveSettings);

    qs('[data-ve-modal-cancel]').addEventListener('click', closeModal);
    qs('[data-ve-modal-ok]').addEventListener('click', function () {
      if (state.modal && state.modal.onOk) state.modal.onOk();
      closeModal();
    });
    qs('[data-ve-modal-delete]').addEventListener('click', function () {
      if (state.modal && state.modal.onDelete) state.modal.onDelete();
      closeModal();
    });
    qs('[data-ve-modal]').addEventListener('click', function (event) {
      if (event.target === qs('[data-ve-modal]')) closeModal();
    });

    loadData().catch(function (error) {
      setStatus(qs('[data-product-status]'), error.message || String(error), true);
    });
  });
})();
