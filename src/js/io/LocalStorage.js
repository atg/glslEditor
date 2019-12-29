const LS_PREFIX = 'glslEditor-';
class LocalStorage {
    set(key, value) {
        window.localStorage.setItem(LS_PREFIX + key, value);
    }
    get(key) {
        return window.localStorage.getItem(LS_PREFIX + key);
    }
    delete(key) {
        window.localStorage.removeItem(LS_PREFIX + key);
    }
    deleteAll() {
        const ls = window.localStorage;
        for (const key in window.localStorage) {
            if (ls.hasOwnProperty(key) && key.startsWith(LS_PREFIX)) {
                window.localStorage.removeItem(LS_PREFIX + key);
            }
        }
    }
}
LocalStorage.shared = new LocalStorage();

export default LocalStorage;
