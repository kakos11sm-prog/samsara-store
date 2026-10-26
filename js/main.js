(function () {
  var store = window.SamsaraStore;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getProductImages(product) {
    if (product.images && product.images.length) {
      return product.images.map(function (item) {
        if (typeof item === 'string') {
          return { src: item, label: '' };
        }
        return { src: item.src, label: item.label || '' };
      });
    }
    if (product.image) {
      return [{ src: product.image, label: '' }];
    }
    return [];
  }

  function productVisual(product, className, imageSrc) {
    var cat = store.getCategory(product.category);
    var grad = cat ? cat.gradient : '';
    var src = imageSrc || product.image || (getProductImages(product)[0] || {}).src;
    var image = src
      ? '<img class="product-photo" src="' +
        src +
        '" alt="' +
        product.name +
        '" loading="lazy" onerror="this.remove()">'
      : '';
    return (
      '<div class="product-visual ' +
      (className || '') +
      '" style="--tile-grad:' +
      grad +
      '; background-image: radial-gradient(circle at 30% 20%, rgba(196,163,90,0.18), transparent 50%), ' +
      grad +
      '">' +
      image +
      '<span class="product-visual-fallback" aria-hidden="true">' +
      (product.symbol || '◎') +
      '</span>' +
      '</div>'
    );
  }

  function buildCategorySlides(products) {
    var slides = [];
    products.forEach(function (product) {
      var images = getProductImages(product);
      if (!images.length) {
        slides.push({
          product: product,
          src: '',
          label: '',
          title: product.name
        });
        return;
      }
      images.forEach(function (image) {
        slides.push({
          product: product,
          src: image.src,
          label: image.label,
          title: image.label ? product.name + ' · ' + image.label : product.name
        });
      });
    });
    return slides;
  }

  function updateCartCount(bump) {
    var count = store.cart.getCount();
    qsa('[data-cart-count]').forEach(function (el) {
      el.textContent = String(count);
      el.classList.toggle('is-hidden', count === 0);
      if (bump) {
        el.classList.remove('is-bump');
        void el.offsetWidth;
        el.classList.add('is-bump');
        setTimeout(function () {
          el.classList.remove('is-bump');
        }, 320);
      }
    });
  }

  function initNav() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-nav]');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });

    var path = location.pathname.split('/').pop() || 'index.html';
    qsa('[data-nav] a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('is-active');
      }
    });
  }

  function initEditorEntryPoints() {
    if (qs('.edit-fab')) return;
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (page === 'editor.html' || page.indexOf('admin') === 0) return;
    var fab = document.createElement('a');
    fab.className = 'edit-fab';
    fab.href = 'editor.html';
    fab.textContent = 'Редактор';
    fab.title = 'Редактировать магазин';
    document.body.appendChild(fab);
  }

  function initSupportWidget() {
    if (qs('.support-dock')) return;
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (page === 'editor.html' || page.indexOf('admin') === 0) return;

    var site = store.site || {};
    var telegram = String(site.telegram || '').replace(/^@/, '').trim();
    var telegramUrl = telegram ? 'https://t.me/' + encodeURIComponent(telegram) : 'https://t.me/';
    var email = site.email || 'hello@samsara.store';

    var dock = document.createElement('div');
    dock.className = 'support-dock';
    dock.innerHTML =
      '<div class="support-widgets">' +
      '<div class="support-chat is-hidden" data-support-chat>' +
      '<h3>Напишите нам</h3>' +
      '<p>Оставьте сообщение — откроем Telegram или почту для отправки.</p>' +
      '<textarea class="form-control" data-support-text placeholder="Здравствуйте! У меня вопрос по товару..."></textarea>' +
      '<div class="support-chat-actions">' +
      '<button type="button" class="btn btn-primary" data-support-send>Отправить</button>' +
      '<button type="button" class="btn btn-ghost" data-support-close-chat>Закрыть</button>' +
      '</div>' +
      '</div>' +
      '<div class="support-widget">' +
      '<span class="support-label">Telegram</span>' +
      '<a class="support-btn support-btn-telegram" href="' +
      telegramUrl +
      '" target="_blank" rel="noopener" aria-label="Telegram" data-support-telegram>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.8 4.4c.3-.9-.5-1.6-1.3-1.3L2.9 9.5c-.9.3-.9 1.6.1 1.9l4.5 1.4 1.7 5.3c.3.9 1.5 1.1 2.1.4l2.5-2.7 4.6 3.4c.8.6 1.9.2 2.2-.8l3.2-13.9zM9.4 13.1l-.3 3.1 1.5-2.1 7.2-6.5-8.4 5.5z"/></svg>' +
      '</a>' +
      '</div>' +
      '<div class="support-widget">' +
      '<span class="support-label">Написать</span>' +
      '<button type="button" class="support-btn support-btn-chat" aria-label="Написать сообщение" data-support-open-chat>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3v-3H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2 4v2h12V8H6zm0 4v2h8v-2H6z"/></svg>' +
      '</button>' +
      '</div>' +
      '</div>' +
      '<button type="button" class="support-toggle" aria-label="Техподдержка" data-support-toggle>' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a8 8 0 0 0-8 8v2H3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1v1a3 3 0 0 0 3 3h1a1 1 0 0 0 0-2H7a1 1 0 0 1-1-1v-1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H6v-2a6 6 0 1 1 12 0v2h-3a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3v1a1 1 0 0 1-1 1h-1a1 1 0 0 0 0 2h1a3 3 0 0 0 3-3v-1h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-1v-2a8 8 0 0 0-8-8z"/></svg>' +
      '</button>';

    document.body.appendChild(dock);

    var chat = qs('[data-support-chat]', dock);
    var telegramBtn = qs('[data-support-telegram]', dock);

    qs('[data-support-toggle]', dock).addEventListener('click', function () {
      dock.classList.toggle('is-open');
      if (!dock.classList.contains('is-open')) chat.classList.add('is-hidden');
    });

    qs('[data-support-open-chat]', dock).addEventListener('click', function () {
      chat.classList.toggle('is-hidden');
      if (!chat.classList.contains('is-hidden')) {
        var area = qs('[data-support-text]', dock);
        if (area) area.focus();
      }
    });

    qs('[data-support-close-chat]', dock).addEventListener('click', function () {
      chat.classList.add('is-hidden');
    });

    qs('[data-support-send]', dock).addEventListener('click', function () {
      var text = (qs('[data-support-text]', dock).value || '').trim();
      if (!text) {
        qs('[data-support-text]', dock).focus();
        return;
      }
      if (telegram) {
        window.open(
          'https://t.me/' + encodeURIComponent(telegram) + '?text=' + encodeURIComponent(text),
          '_blank',
          'noopener'
        );
      } else {
        window.location.href =
          'mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent('Вопрос в Сансара') + '&body=' + encodeURIComponent(text);
      }
    });

    if (!telegram) {
      telegramBtn.addEventListener('click', function (event) {
        event.preventDefault();
        chat.classList.remove('is-hidden');
        dock.classList.add('is-open');
        qs('[data-support-text]', dock).placeholder = 'Укажите Telegram в настройках сайта или напишите сюда — отправим на email';
        qs('[data-support-text]', dock).focus();
      });
    }
  }

  function renderCategoryGrid(target) {
    if (!target) return;
    target.innerHTML = store.categories
      .map(function (cat) {
        var products = store.getProductsByCategory(cat.id);
        var slides = buildCategorySlides(products);
        var slidesHtml =
          slides.length > 0
            ? slides
                .map(function (slide, index) {
                  return (
                    '<div class="category-tile-slide' +
                    (index === 0 ? ' is-active' : '') +
                    '" data-tile-slide="' +
                    index +
                    '">' +
                    (slide.src
                      ? '<img src="' +
                        slide.src +
                        '" alt="' +
                        slide.title +
                        '" loading="lazy" onerror="this.parentElement.classList.add(\'is-empty\'); this.remove()">'
                      : '') +
                    '</div>'
                  );
                })
                .join('')
            : '';

        return (
          '<a class="category-tile" href="category.html?cat=' +
          encodeURIComponent(cat.id) +
          '" style="--tile-grad:' +
          cat.gradient +
          '; background-image: linear-gradient(180deg, transparent 20%, rgba(10,12,8,0.85) 100%), ' +
          cat.gradient +
          '" data-category-tile="' +
          cat.id +
          '">' +
          '<div class="category-tile-media" aria-hidden="true">' +
          slidesHtml +
          '</div>' +
          '<div class="category-tile-copy">' +
          '<h3>' +
          cat.name +
          '</h3>' +
          '<span>' +
          products.length +
          ' моделей</span>' +
          '</div>' +
          '</a>'
        );
      })
      .join('');

    initCategoryTileSlideshows(target);
  }

  function initCategoryTileSlideshows(root) {
    qsa('[data-category-tile]', root).forEach(function (tile, tileIndex) {
      var slides = qsa('[data-tile-slide]', tile);
      if (slides.length < 2) return;

      var current = 0;
      setInterval(function () {
        current = (current + 1) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
      }, 3200 + tileIndex * 400);
    });
  }

  function renderProductCard(product) {
    var cat = store.getCategory(product.category);
    return (
      '<article class="product-card">' +
      '<a href="product.html?id=' +
      encodeURIComponent(product.id) +
      '">' +
      '<div class="product-card-media">' +
      productVisual(product) +
      '</div>' +
      '<div class="product-card-body">' +
      '<div class="product-card-cat">' +
      (cat ? cat.name : '') +
      '</div>' +
      '<h3 class="product-card-title">' +
      product.name +
      '</h3>' +
      '<div class="product-card-price">' +
      store.formatPrice(product.price) +
      '</div>' +
      '</div>' +
      '</a>' +
      '<a class="inline-edit-link" href="editor.html?id=' +
      encodeURIComponent(product.id) +
      '">Изменить</a>' +
      '</article>'
    );
  }

  function renderProductGrid(target, products) {
    if (!target) return;
    if (!products.length) {
      target.innerHTML =
        '<div class="empty-state"><h2>Пока пусто</h2><p>В этой категории ещё нет товаров.</p></div>';
      return;
    }
    target.innerHTML = products.map(renderProductCard).join('');
  }

  function bindCategoryVideo(videoEl, category) {
    if (!videoEl || !category) return;

    var sources = [category.video, 'media/' + category.id + '.webm'].filter(Boolean);
    var index = 0;

    function tryNext() {
      if (index >= sources.length) {
        videoEl.classList.add('is-missing');
        return;
      }
      videoEl.src = sources[index];
      index += 1;
      videoEl.load();
      var playPromise = videoEl.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    videoEl.addEventListener('error', tryNext);
    tryNext();
  }

  function initCategorySlideshow(mount, products) {
    if (!mount) return;

    var slidesData = buildCategorySlides(products);

    if (!slidesData.length) {
      mount.classList.add('is-hidden');
      return;
    }

    mount.classList.remove('is-hidden');
    mount.innerHTML =
      '<div class="category-slideshow-track" data-slideshow-track>' +
      slidesData
        .map(function (slide, index) {
          return (
            '<a class="category-slide' +
            (index === 0 ? ' is-active' : '') +
            '" href="product.html?id=' +
            encodeURIComponent(slide.product.id) +
            '" data-slide-index="' +
            index +
            '">' +
            productVisual(slide.product, '', slide.src) +
            '<div class="category-slide-caption">' +
            '<span class="category-slide-name">' +
            slide.title +
            '</span>' +
            '<span class="category-slide-price">' +
            store.formatPrice(slide.product.price) +
            '</span>' +
            '</div>' +
            '</a>'
          );
        })
        .join('') +
      '</div>' +
      (slidesData.length > 1
        ? '<div class="category-slideshow-dots" data-slideshow-dots>' +
          slidesData
            .map(function (slide, index) {
              return (
                '<button type="button" class="category-slideshow-dot' +
                (index === 0 ? ' is-active' : '') +
                '" aria-label="' +
                slide.title +
                '" data-slide-to="' +
                index +
                '"></button>'
              );
            })
            .join('') +
          '</div>'
        : '');

    if (slidesData.length < 2) return;

    var current = 0;
    var slides = qsa('[data-slide-index]', mount);
    var dots = qsa('[data-slide-to]', mount);
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = setInterval(next, 3500);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')));
        start();
      });
    });

    mount.addEventListener('mouseenter', stop);
    mount.addEventListener('mouseleave', start);
    start();
  }

  function initCategoryPage() {
    var root = qs('[data-page="category"]');
    if (!root) return;

    var catId = getParam('cat');
    var category = store.getCategory(catId);
    var heroBg = qs('.category-hero-bg', root);
    var products = category ? store.getProductsByCategory(catId) : [];

    if (!category) {
      qs('[data-category-title]', root).textContent = 'Категория не найдена';
      qs('[data-category-text]', root).textContent = 'Выберите раздел в каталоге.';
      renderProductGrid(qs('[data-product-grid]', root), []);
      return;
    }

    qs('[data-category-title]', root).textContent = category.name;
    qs('[data-category-text]', root).textContent = category.blurb;
    document.title = category.name + ' — Сансара';

    if (heroBg) {
      heroBg.style.backgroundImage = category.gradient;
    }

    bindCategoryVideo(qs('[data-category-video]', root), category);
    initCategorySlideshow(qs('[data-category-slideshow]', root), products);
    renderProductGrid(qs('[data-product-grid]', root), products);
  }

  function initProductPage() {
    var root = qs('[data-page="product"]');
    if (!root) return;

    var product = store.getProduct(getParam('id'));
    var mount = qs('[data-product-detail]', root);

    if (!product) {
      mount.innerHTML =
        '<div class="empty-state"><h2>Товар не найден</h2><p>Вернитесь в каталог и выберите другую модель.</p><a class="btn btn-primary" href="catalog.html">В каталог</a></div>';
      return;
    }

    var category = store.getCategory(product.category);
    var images = getProductImages(product);
    var selectedColor = (images[0] && images[0].label) || '';
    document.title = product.name + ' — Сансара';

    var sizesHtml = product.sizes
      .map(function (size, index) {
        return (
          '<label class="size-option">' +
          '<input type="radio" name="size" value="' +
          size +
          '"' +
          (index === 0 ? ' checked' : '') +
          '>' +
          '<span>' +
          size +
          '</span>' +
          '</label>'
        );
      })
      .join('');

    var colorsHtml =
      images.length > 1
        ? '<div class="form-group">' +
          '<label>Цвет</label>' +
          '<div class="size-options" data-color-options>' +
          images
            .map(function (image, index) {
              return (
                '<label class="size-option">' +
                '<input type="radio" name="color" value="' +
                (image.label || String(index)) +
                '" data-image-src="' +
                image.src +
                '"' +
                (index === 0 ? ' checked' : '') +
                '>' +
                '<span>' +
                (image.label || 'Вариант ' + (index + 1)) +
                '</span>' +
                '</label>'
              );
            })
            .join('') +
          '</div>' +
          '</div>'
        : '';

    mount.innerHTML =
      '<div class="product-gallery" data-product-gallery>' +
      productVisual(product, '', images[0] && images[0].src) +
      '</div>' +
      '<div class="product-info">' +
      '<div class="product-card-cat">' +
      (category ? category.name : '') +
      '</div>' +
      '<h1>' +
      product.name +
      '</h1>' +
      '<div class="product-price">' +
      store.formatPrice(product.price) +
      '</div>' +
      '<p class="product-desc">' +
      escapeHtml(product.description) +
      '</p>' +
      (product.manufacturer || product.material
        ? '<div class="product-meta">' +
          (product.manufacturer
            ? '<div class="product-meta-row"><span>Производитель</span><strong>' +
              escapeHtml(product.manufacturer) +
              '</strong></div>'
            : '') +
          (product.material
            ? '<div class="product-meta-row"><span>Материал</span><strong>' +
              escapeHtml(product.material) +
              '</strong></div>'
            : '') +
          '</div>'
        : '') +
      '<form data-add-form>' +
      colorsHtml +
      '<div class="form-group">' +
      '<label>Размер</label>' +
      '<div class="size-options">' +
      sizesHtml +
      '</div>' +
      '</div>' +
      '<button type="submit" class="btn btn-primary">В корзину</button>' +
      '<div class="add-feedback" data-add-feedback>Добавлено в корзину</div>' +
      '</form>' +
      '<a class="inline-edit-link" href="editor.html?id=' +
      encodeURIComponent(product.id) +
      '">Изменить этот товар</a>' +
      '</div>';

    var gallery = qs('[data-product-gallery]', mount);
    qsa('input[name="color"]', mount).forEach(function (input) {
      input.addEventListener('change', function () {
        selectedColor = input.value;
        gallery.innerHTML = productVisual(product, '', input.getAttribute('data-image-src'));
      });
    });

    qs('[data-add-form]', mount).addEventListener('submit', function (event) {
      event.preventDefault();
      var sizeInput = qs('input[name="size"]:checked', mount);
      if (!sizeInput) return;
      var colorInput = qs('input[name="color"]:checked', mount);
      var cartSize = colorInput
        ? sizeInput.value + ' / ' + colorInput.value
        : sizeInput.value;
      store.cart.add(product.id, cartSize, 1);
      updateCartCount(true);
      var feedback = qs('[data-add-feedback]', mount);
      feedback.classList.add('is-visible');
      setTimeout(function () {
        feedback.classList.remove('is-visible');
      }, 1600);
    });
  }

  function initCartPage() {
    var root = qs('[data-page="cart"]');
    if (!root) return;

    var list = qs('[data-cart-list]', root);
    var summary = qs('[data-cart-summary]', root);
    var empty = qs('[data-cart-empty]', root);

    function render() {
      var items = store.cart.getItems();
      updateCartCount(false);

      if (!items.length) {
        list.classList.add('is-hidden');
        summary.classList.add('is-hidden');
        empty.classList.remove('is-hidden');
        return;
      }

      empty.classList.add('is-hidden');
      list.classList.remove('is-hidden');
      summary.classList.remove('is-hidden');

      list.innerHTML = items
        .map(function (item) {
          var product = store.getProduct(item.productId);
          if (!product) return '';
          var lineTotal = product.price * item.qty;
          return (
            '<article class="cart-item" data-product-id="' +
            item.productId +
            '" data-size="' +
            item.size +
            '">' +
            '<div class="cart-item-media">' +
            productVisual(product) +
            '</div>' +
            '<div class="cart-item-info">' +
            '<h3><a href="product.html?id=' +
            encodeURIComponent(product.id) +
            '">' +
            product.name +
            '</a></h3>' +
            '<div class="cart-item-meta">Размер: ' +
            item.size +
            '</div>' +
            '<div class="qty-control">' +
            '<button type="button" data-qty-delta="-1" aria-label="Меньше">−</button>' +
            '<span>' +
            item.qty +
            '</span>' +
            '<button type="button" data-qty-delta="1" aria-label="Больше">+</button>' +
            '</div>' +
            '</div>' +
            '<div class="cart-item-side">' +
            '<div class="cart-item-price">' +
            store.formatPrice(lineTotal) +
            '</div>' +
            '<button type="button" class="btn btn-danger" data-remove>Удалить</button>' +
            '</div>' +
            '</article>'
          );
        })
        .join('');

      qs('[data-cart-total]', summary).textContent = store.formatPrice(store.cart.getTotal());
      qs('[data-cart-items-count]', summary).textContent = String(store.cart.getCount());
    }

    list.addEventListener('click', function (event) {
      var itemEl = event.target.closest('.cart-item');
      if (!itemEl) return;
      var productId = itemEl.getAttribute('data-product-id');
      var size = itemEl.getAttribute('data-size');
      var deltaBtn = event.target.closest('[data-qty-delta]');
      var removeBtn = event.target.closest('[data-remove]');

      if (deltaBtn) {
        var current = store.cart.getItems().find(function (entry) {
          return entry.productId === productId && entry.size === size;
        });
        if (!current) return;
        store.cart.setQty(productId, size, current.qty + Number(deltaBtn.getAttribute('data-qty-delta')));
        render();
      }

      if (removeBtn) {
        store.cart.remove(productId, size);
        render();
      }
    });

    render();
  }

  function initCheckoutPage() {
    var root = qs('[data-page="checkout"]');
    if (!root) return;

    var formWrap = qs('[data-checkout-form-wrap]', root);
    var side = qs('[data-checkout-side]', root);
    var success = qs('[data-checkout-success]', root);
    var empty = qs('[data-checkout-empty]', root);
    var form = qs('[data-checkout-form]', root);
    var lines = qs('[data-checkout-lines]', root);

    function renderSide() {
      var items = store.cart.getItems();

      if (!items.length) {
        formWrap.classList.add('is-hidden');
        side.classList.add('is-hidden');
        success.classList.add('is-hidden');
        empty.classList.remove('is-hidden');
        return false;
      }

      empty.classList.add('is-hidden');
      formWrap.classList.remove('is-hidden');
      side.classList.remove('is-hidden');

      lines.innerHTML = items
        .map(function (item) {
          var product = store.getProduct(item.productId);
          if (!product) return '';
          return (
            '<div class="checkout-line">' +
            '<span>' +
            product.name +
            ' · ' +
            item.size +
            ' × ' +
            item.qty +
            '</span>' +
            '<strong>' +
            store.formatPrice(product.price * item.qty) +
            '</strong>' +
            '</div>'
          );
        })
        .join('');

      qs('[data-checkout-total]', side).textContent = store.formatPrice(store.cart.getTotal());
      return true;
    }

    if (!renderSide()) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = qs('[name="name"]', form).value.trim();
      var phone = qs('[name="phone"]', form).value.trim();
      var city = qs('[name="city"]', form).value.trim();

      if (!name || !phone || !city) return;

      store.cart.clear();
      updateCartCount(false);

      formWrap.classList.add('is-hidden');
      side.classList.add('is-hidden');
      empty.classList.add('is-hidden');
      success.classList.remove('is-hidden');

      qs('[data-order-name]', success).textContent = name;
      qs('[data-order-city]', success).textContent = city;
    });
  }

  function initCatalogPage() {
    renderCategoryGrid(qs('[data-category-grid]'));
  }

  function initHomePage() {
    var site = store.site || {};
    if (site.tagline && qs('.hero-title')) qs('.hero-title').textContent = site.tagline;
    if (site.heroText && qs('.hero-text')) qs('.hero-text').textContent = site.heroText;
    if (site.brand && qs('.hero-brand')) qs('.hero-brand').textContent = site.brand;

    renderCategoryGrid(qs('[data-home-categories]'));
    var featured = qs('[data-featured-grid]');
    if (featured) {
      renderProductGrid(featured, store.products.slice(0, 3));
    }
  }

  document.addEventListener('samsara:cart-change', function () {
    updateCartCount(false);
  });

  function boot() {
    initNav();
    initEditorEntryPoints();
    initSupportWidget();
    updateCartCount(false);
    initHomePage();
    initCatalogPage();
    initCategoryPage();
    initProductPage();
    initCartPage();
    initCheckoutPage();
  }

  document.addEventListener('samsara:store-ready', boot);
})();
