/**
 * localStorage的封装库
 * see https://github.com/hooraygith/ls-cache
 */

'use strict';

var cache = {};
module.exports = cache;

cache.version = '@1.0.0';

// 传key进来时要有用户id，防止用户数据混淆
// expireTime是多少时间后过期，以毫秒为单位，不传这个参数时默认为7天
cache.set = function(key, value, expireTime) {
    if (typeof key === 'undefined') {
        throw new Error('Key is undefined');
    };
    if (typeof value === 'undefined') {
        throw new Error('Value is undefined');
    };
    if (typeof expireTime === 'undefined') {
        expireTime = 7 * 24 * 60 * 60 * 1000;
    }
    expireTime = Number(expireTime);
    key = key + cache.version;

    // 检测是否能存 localStorage
    if (cache.lsDisabled) {
        return;
    }

    var str = JSON.stringify({
        expireAt: +new Date() + expireTime,
        content: value
    });

    localStorage.setItem(key, str);
};
cache.get = function(key) {
    if (typeof key === 'undefined') {
        throw new Error('Key is undefined');
    };
    // 检测是否能存 localStorage
    if (cache.lsDisabled) {
        return;
    }

    key = key + cache.version;

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

// 删除成功返回true，没法操作ls时也返回true
cache.clean = function(key) {
    if (typeof key === 'undefined') {
        throw new Error('Key is undefined');
    };
    // 检测是否能存 localStorage
    if (cache.lsDisabled) {
        return true;
    }

    key = key + cache.version;

    // 如果没有这个item
    if (localStorage.getItem(key) === null) {
        return false;
    } else {
        localStorage.removeItem(key);

        return true;
    }
};

// 清楚所有过期的localStorage，没有注明过期时间的不会被清除
cache.cleanExpired = function() {
    // 检测是否能存 localStorage
    if (cache.lsDisabled) {
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

        // 过期了
        var expireAt = +obj.expireAt;
        var now = +new Date();
        if (now > expireAt) {
            localStorage.removeItem(i);
        }
    }
};
// 自动执行
cache.cleanExpired();

// 检测是否能存localStorage
// 不能写，就判断为不能操作ls
cache.lsDisabled = (function() {
    var mod = 'test';
    try {
        localStorage.setItem(mod, mod);
        localStorage.removeItem(mod);
        return false;
    } catch (e) {
        return true;
    }
})();
