/**
 * localStorage的封装库
 */

'use strict';

var cache = {};
module.exports = cache;

// expireTime是多少时间后过期，以秒为单位，不传这个参数时默认为7天
cache.set = function(key, value, expireTime) {
    if (typeof key === 'undefined') {
        throw new Error('Key is undefined');
    };
    if (typeof value === 'undefined') {
        throw new Error('Value is undefined');
    };
    if (typeof expireTime === 'undefined') {
        expireTime = 7 * 24 * 60 * 60;
    }
    expireTime = Number(expireTime);

    // 检测是否能存 localStorage
    if (!cache.isLsEnabled) {
        return;
    }

    var str = JSON.stringify({
        expireAt: +new Date() + expireTime * 1000,
        content: value
    });

    localStorage.setItem(key, str);
};
cache.get = function(key) {
    if (typeof key === 'undefined') {
        throw new Error('Key is undefined');
    };
    // 检测是否能存 localStorage
    if (!cache.isLsEnabled) {
        return;
    }

    var str = localStorage.getItem(key);
    if (str === null || str.length === 0) {
        return;
    }

    var obj;
    try {
        obj = JSON.parse(str).content;
        return obj;
    } catch (e) {
        return;
    }
};

// 删除成功返回true
cache.clean = function(key) {
    if (typeof key === 'undefined') {
        throw new Error('Key is undefined');
    };
    // 检测是否能存 localStorage
    if (!cache.isLsEnabled) {
        return false;
    }

    // 如果没有这个item
    if (localStorage.getItem(key) === null) {
        return false;
    } else {
        localStorage.removeItem(key);

        return true;
    }
};

// 清楚所有过期的localStorage，没有注明过期时间的也会被清除
cache.cleanExpired = function() {
    // 检测是否能存 localStorage
    if (!cache.isLsEnabled) {
        return false;
    }

    for (var i in localStorage) {
        var str = localStorage.getItem(i);

        var obj = {};
        try {
             obj = JSON.parse(str);
        } catch (e) {
            localStorage.removeItem(i);

            continue;
        }

        // 没有过期时间，干掉
        if (!obj.expireAt) {
            localStorage.removeItem(i);
        }

        // 过期了
        var expireAt = +obj.expireAt;
        var now = +new Date();
        if (now > expireAt) {
            localStorage.removeItem(i);
        }
    }
};

// 检测是否能存localStorage
cache.isLsEnabled = (function() {
    var mod = 'test';
    try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return true;
    } catch (e) {
        return false;
    }
})();
