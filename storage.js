/* =========================================
   BT — storage.js
   Funções utilitárias para localStorage
   ========================================= */

const BT = {
  prefix: 'bt_v1_',

  get(key, fallback = null) {
    try {
      const val = localStorage.getItem(this.prefix + key);
      return val !== null ? JSON.parse(val) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }
};
