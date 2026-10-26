window.SamsaraStore = window.SamsaraStore || {};

(function (store) {
  var STORAGE_KEY = 'samsara-cart-v1';

  function read() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function write(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('samsara:cart-change'));
  }

  store.cart = {
    getItems: function () {
      return read();
    },

    getCount: function () {
      return read().reduce(function (sum, item) {
        return sum + item.qty;
      }, 0);
    },

    getTotal: function () {
      return read().reduce(function (sum, item) {
        var product = store.getProduct(item.productId);
        if (!product) return sum;
        return sum + product.price * item.qty;
      }, 0);
    },

    add: function (productId, size, qty) {
      qty = qty || 1;
      var items = read();
      var existing = items.find(function (item) {
        return item.productId === productId && item.size === size;
      });

      if (existing) {
        existing.qty += qty;
      } else {
        items.push({ productId: productId, size: size, qty: qty });
      }

      write(items);
      return items;
    },

    setQty: function (productId, size, qty) {
      var items = read();
      var item = items.find(function (entry) {
        return entry.productId === productId && entry.size === size;
      });

      if (!item) return items;

      if (qty <= 0) {
        return this.remove(productId, size);
      }

      item.qty = qty;
      write(items);
      return items;
    },

    remove: function (productId, size) {
      var items = read().filter(function (item) {
        return !(item.productId === productId && item.size === size);
      });
      write(items);
      return items;
    },

    clear: function () {
      write([]);
    }
  };
})(window.SamsaraStore);
