
'use strict';

var fieldNameRe = /^[a-zA-Z_$][a-zA-Z0-9_]+$/;

var combineStorageMapKey = function (fieldName, key) {
    return "@" + fieldName + "[" + key + "]";
};

var applyMapDescriptor = function (obj, descriptor) {
    descriptor = Object.assign({
        stringify: JSON.stringify,
        parse: JSON.parse
    }, descriptor || {});

    if (typeof descriptor.stringify !== 'function' || typeof descriptor.parse !== 'function') {
        throw new Error("descriptor.stringify and descriptor.parse must be function.");
    }

    Object.defineProperty(obj, "stringify", {
        configurable: false,
        enumerable: false,
        get: function () {
            return descriptor.stringify;
        }
    });

    Object.defineProperty(obj, "parse", {
        configurable: false,
        enumerable: false,
        get: function () {
            return descriptor.parse;
        }
    });
};

var applyFieldDescriptor = function (obj, fieldName, descriptor) {
    descriptor = Object.assign({
        stringify: JSON.stringify,
        parse: JSON.parse
    }, descriptor || {});

    if (typeof descriptor.stringify !== 'function' || typeof descriptor.parse !== 'function') {
        throw new Error("descriptor.stringify and descriptor.parse must be function.");
    }

    Object.defineProperty(obj, "__stringify__" + fieldName, {
        configurable: false,
        enumerable: false,
        get: function () {
            return descriptor.stringify;
        }
    });

    Object.defineProperty(obj, "__parse__" + fieldName, {
        configurable: false,
        enumerable: false,
        get: function () {
            return descriptor.parse;
        }
    });
};

var GoldSunStorage = function () {
};

var StorageMap = function (contractStorage, fieldName, descriptor) {
    if (!contractStorage instanceof GoldSunStorage) {
        throw new Error("StorageMap only accept instance of ContractStorage");
    }

    if (typeof fieldName !== "string" || fieldNameRe.exec(fieldName) == null) {
        throw new Error("StorageMap fieldName must match regex /^[a-zA-Z_$].*$/");
    }

    Object.defineProperty(this, "contractStorage", {
        configurable: false,
        enumerable: false,
        get: function () {
            return contractStorage;
        }
    });
    Object.defineProperty(this, "fieldName", {
        configurable: false,
        enumerable: false,
        get: function () {
            return fieldName;
        }
    });

    applyMapDescriptor(this, descriptor);
};


StorageMap.prototype = {
    del: function (key) {
        return this.contractStorage.del(combineStorageMapKey(this.fieldName, key));
    },
    get: function (key) {
        var val = this.contractStorage.rawGet(combineStorageMapKey(this.fieldName, key));
        if (val != null) {
            val = this.parse(val);
        }
        return val;
    },
    set: function (key, value) {
        var val = this.stringify(value);
        return this.contractStorage.rawSet(combineStorageMapKey(this.fieldName, key), val);
    }
};
StorageMap.prototype.put = StorageMap.prototype.set;
StorageMap.prototype.delete = StorageMap.prototype.del;


GoldSunStorage.prototype = {
    rawGet: function (key) {
        return localStorage.getItem(key);
    },
    rawSet: function (key, value) {
        localStorage.setItem(key, value);
    },
    del: function (key) {
        localStorage.removeItem(key);
    },
    get: function (key) {
        var val = this.rawGet(key);
        if (val != null) {
            val = JSON.parse(val);
        }
        return val;
    },
    set: function (key, value) {
        return this.rawSet(key, JSON.stringify(value));
    },
    defineProperty: function (obj, fieldName, descriptor) {
        if (!obj || !fieldName) {
            throw new Error("defineProperty requires at least two parameters.");
        }
        var $this = this;
        Object.defineProperty(obj, fieldName, {
            configurable: false,
            enumerable: true,
            get: function () {
                var val = $this.rawGet(fieldName);
                if (val != null) {
                    val = obj["__parse__" + fieldName](val);
                }
                return val;
            },
            set: function (val) {
                val = obj["__stringify__" + fieldName](val);
                return $this.rawSet(fieldName, val);
            }
        });
        applyFieldDescriptor(obj, fieldName, descriptor);
        return this;
    },
    defineProperties: function (obj, props) {
        if (!obj || !props) {
            throw new Error("defineProperties requires two parameters.");
        }

        for (const fieldName in props) {
            this.defineProperty(obj, fieldName, props[fieldName]);
        }
        return this;
    },
    defineMapProperty: function (obj, fieldName, descriptor) {
        if (!obj || !fieldName) {
            throw new Error("defineMapProperty requires two parameters.");
        }

        var mapObj = new StorageMap(this, fieldName, descriptor);
        Object.defineProperty(obj, fieldName, {
            configurable: false,
            enumerable: true,
            get: function () {
                return mapObj;
            }
        });
        return this;
    },
    defineMapProperties: function (obj, props) {
        if (!obj || !props) {
            throw new Error("defineMapProperties requires two parameters.");
        }

        for (const fieldName in props) {
            this.defineMapProperty(obj, fieldName, props[fieldName]);
        }
        return this;
    },

    // 字符串转string，必须用这个方法
    StringToNumber: function(org_string) {
        return parseInt(org_string);
    }
};

GoldSunStorage.prototype.put = GoldSunStorage.prototype.set;
GoldSunStorage.prototype.delete = GoldSunStorage.prototype.del;

window.GoldSunStorage = GoldSunStorage;
