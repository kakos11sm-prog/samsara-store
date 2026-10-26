window.SamsaraStore = window.SamsaraStore || {};

SamsaraStore.site = SamsaraStore.site || {};
SamsaraStore.categories = SamsaraStore.categories || [];
SamsaraStore.products = SamsaraStore.products || [];

SamsaraStore.normalizePath = function (path) {
  if (!path || typeof path !== 'string') return path;
  return path.replace(/^\//, '');
};

SamsaraStore.applyData = function (data) {
  if (!data || typeof data !== 'object') return;
  if (data.site) this.site = data.site;
  if (Array.isArray(data.categories)) {
    this.categories = data.categories.map(function (category) {
      var copy = Object.assign({}, category);
      copy.video = SamsaraStore.normalizePath(copy.video);
      return copy;
    });
  }
  if (Array.isArray(data.products)) {
    this.products = data.products.map(function (product) {
      var copy = Object.assign({}, product);
      copy.sizes = Array.isArray(copy.sizes)
        ? copy.sizes.map(function (size) {
            return typeof size === 'string' ? size : size && size.size ? size.size : String(size);
          })
        : [];
      copy.images = Array.isArray(copy.images)
        ? copy.images.map(function (item) {
            if (typeof item === 'string') {
              return { src: SamsaraStore.normalizePath(item), label: '' };
            }
            return {
              src: SamsaraStore.normalizePath(item.src),
              label: item.label || ''
            };
          })
        : [];
      copy.image = SamsaraStore.normalizePath(copy.image);
      if (!copy.image && copy.images[0]) copy.image = copy.images[0].src;
      return copy;
    });
  }
};

SamsaraStore.getCategory = function (id) {
  return this.categories.find(function (c) {
    return c.id === id;
  });
};

SamsaraStore.getProduct = function (id) {
  return this.products.find(function (p) {
    return p.id === id;
  });
};

SamsaraStore.getProductsByCategory = function (categoryId) {
  return this.products.filter(function (p) {
    return p.category === categoryId;
  });
};

SamsaraStore.formatPrice = function (value) {
  return new Intl.NumberFormat('ru-RU').format(Number(value) || 0) + ' ₴';
};
