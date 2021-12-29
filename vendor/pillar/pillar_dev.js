/***
 * Copyright Manoel Neco 2021, Todos os direitos reservados
 *
 * @autor: Manoel Neco
 * @create: 2012
 * @release: 2021
 * @version: version 11.0.1
 */
PiEnv = {
    global: window,
    location: window.location
};/**
 * Define uma classe no namespace global
 * 
 * @param {string} ns_string 
 * @param {class} builder 
 * @returns {class}
 */
PiCreate = PiDefine = PiExport = PiNamespace = function (ns_string, builder) {
    var parts = ns_string.split('.'),
        s = PiEnv.global,
        i;

    for (i = 0; i < parts.length; i++) {

        if (typeof s[parts[i]] === "undefined") {
            s[parts[i]] = i + 1 == parts.length ? builder : {};
        }

        s = s[parts[i]];
    }

    if (builder.prototype) {
        builder.prototype.getClassName = function () {
            return ns_string;
        }
    }

    return builder;
};/**
 * @class
 * @name PiObject
 */
PiObject = {};


/**
 * Adiciona e chama todas as propriedades com nome de função dos argumentos no primeiro parametro
 * 
 * @returns {object}
 */
PiObject.extendAndCall = function () {
    let dst = arguments[0];

    for (let i = arguments.length - 1; i > 0; i--) {
        let obj = arguments[i];

        for (let p in obj) {
            if (typeof dst[p] == 'function') {
                dst[p](obj[p]);
            } else {
                dst[p] = obj[p];
            }
        }
    }

    return dst;
}

/**
 * Extrai o contexto onde propriedade existe
 * 
 * @param {object} obj - objeto
 * @param {string} property - path da propriedade
 * @returns {object}
 */
PiObject.extractPropertyContext = function (obj, property) {
    let p = property.split('.');

    if (p.length > 1) {
        for (let i = 0; i < p.length - 1; i++) {
            let m = p[i];
            if (obj[m] == undefined) obj[m] = {};
            obj = obj[m];
        }
    }

    return obj;
}

/**
 * Chama uma função de callback sempre que a propriedade do objeto for alterada
 * 
 * @param {object} obj - Objeto base
 * @param {string} property - Nome da propriedade a ser monitorada
 * @param {function} callback - Callback executado sempre a a propriedade é alterada
 * @param {boolean} [deep = true] deep - Define se as propriedades acima tambem serão observadas
 */
PiObject.on = function (obj, property, callback, deep = true) {
    let currentValue = PiObject.extractValue(obj, property);
    let path = property.split('.');

    if (obj.__onSetList == undefined) {
        obj.__onSetList = [];
        obj.__onSetFn = [];
    }

    if (obj.__onSetFn[property] == undefined) {
        obj.__onSetFn[property] = [];
    }

    const exist = obj.__onSetList.find(p => p == property) !== undefined;
    if (!exist) {
        const _obj = PiObject.extractPropertyContext(obj, property);
        const _property = PiString.last(property, '.');

        if (!(_property == 'length' && PiType.isArray(_obj))) {
            Object.defineProperty(_obj, _property, {
                set: function (value) {
                    currentValue = value;

                    const arrFn = obj.__onSetFn[property];
                    for (let i = 0; i < arrFn.length; i++) {
                        arrFn[i].cb(value, property);
                    }

                    return value;
                },

                get: function () {
                    return currentValue;
                }
            });

            obj.__onSetList.push(property);
        }
    }

    const id = PiRandom.uuid('xxx-xxx');
    let ids = [id];
    obj.__onSetFn[property].push({
        id: id,
        cb: callback
    });

    if (deep && path.length > 1) {
        path.pop();
        const _ids = PiObject.on(obj, path.join('.'), callback);
        ids = ids.concat(_ids);
    }

    return ids;
}

PiObject.off = function (obj, ids) {
    if (obj.__onSetFn == undefined) {
        return;
    }

    for (const property in obj.__onSetFn) {
        const arr = obj.__onSetFn[property];
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (ids.find(e => e == item.id)) {
                i--;
                arr.splice(i, 1);
            }
        }
    }


}

/**
 * Extrai o valor de uma propriedade
 * 
 * @param {object} obj - objeto
 * @param {string} property - path da propriedade
 * @returns {object}
 */
PiObject.extractValue = function (obj, property) {
    const p = property.split('.');

    if (p.length > 1) {
        for (let i = 0; i < p.length; i++) {
            obj = obj[p[i]]
            if (obj == undefined) break;
        }

        return obj;
    } else {
        return obj[property];
    }
}

/**
 * Atribui um valor a uma propriedade
 * 
 * @param {object} obj - objeto
 * @param {string} property - path da propridade
 * @param {object} value - valor a ser inserido na propriedade
 */
PiObject.setProperty = function (obj, property, value) {
    const p = property.split('.');

    if (p.length > 1) {
        const lastProperty = p[p.length - 1];
        for (let i = 0; i < p.length - 1; i++) {
            obj = obj[p[i]]
            if (obj == undefined) break;
        }

        obj[lastProperty] = value;
    } else {
        obj[property] = value;
    }
}

/**
 * Adiciona todas as propriedades e metodos de todos os parametros no primeiro
 * 
 * @method Pi.Object.extend
 * @param {arguments} arg
 * @return {object}
 */
PiObject.extend = function () {
    for (let i = 1; i < arguments.length; i++) {
        let obj = arguments[i];
        for (let v in obj) {
            arguments[0][v] = obj[v];
        }
    }

    return arguments[0];
}/**
 * @class
 */
PiType = {};

/**
 * Returna se o parametro é exatamente 'undefined'
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isUndefined = function (obj) {
    if (obj === null) return false;
    else if (obj == undefined) return true;
    else return false;
};

/**
 * Retorna o nome do construtor do objeto
 * 
 * @param {object} obj 
 * @returns {string}
 */
PiType.typeof = function (obj) {
    let v = null;

    if (obj != undefined && obj != null && !PiType.isNumber(obj)) {
        try {
            v = obj.constructor.name;
            if (v == '') v = 'Object';
        } catch (ex) {

        }
    } else if (PiType.isNumber(obj)) {
        return 'Number';
    } else if (obj === undefined) {
        return 'Undefined'
    } else if (obj === null) {
        return 'Null';
    }

    return v;
};

/**
 * Retorna true se o parametro é um número ou false caso contrário
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isNumber = function (obj) {
    if (typeof obj == 'number' && isFinite(obj) && !isNaN(obj)) return true;
    else return false;
};

/**
 * Returna true se o parametro é null ou undefined
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isNullOrUndefined = function (obj) {
    if (obj == null || obj == undefined) return true;
    else return false;
};

/**
 * Returna true se o parametro é uma função
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isFunction = function (obj) {
    if (typeof obj == 'function') return true;
    else return false;
};

/**
 * Returna true se o parametro é um array
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isArray = function (obj) {
    if (PiType.typeof(obj) == 'Array') return true;

    if (PiType.typeof(obj) == 'String') {
        if (/^\[.*\]$/gi.test(obj)) {
            return true;
        }
    }

    return false;
};

/**
 * Retorna true se o parametro é um Object
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isObject = function (obj) {
    if (PiType.typeof(obj) == 'Object') return true;
    if (typeof obj == 'object') return true;

    if (PiType.typeof(obj) == 'String') {
        if (/^\{.*\}$/gi.test(obj)) {
            return true;
        }
    }

    return false;
};

/**
 * Returna true se o parametro é uma string
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isString = function (obj) {
    if (typeof obj == 'string') return true;
    else return false;
};

/**
 * Returna true se o parametro é um Boolean
 * 
 * @param {object} obj 
 * @returns {boolean}
 */
PiType.isBoolean = function (obj) {
    if (typeof obj == 'boolean') return true;
    else return false;
};/**
 * @class 
 */
PiString = {};

/**
 * Converte todas as palavras da string para capital. As palavras podem estar seperadas por espaço ou _ ou -
 * 
 * @param {string} str - string 
 * @return {string}
 */
 PiString.capital = function (str) {
    if (!PiType.isString(str)) return '';

    str = str.toLowerCase();

    let p = /(^[\s_\.-]*\w|[\s\._-]\w)+/gi,
        m = str.match(p);

    for (let v in m) {
        str = str.replace(m[v], m[v].toUpperCase());
    }

    return str;
};

/**
 * Retorna última palavra separada por caracter
 * 
 * @param {string} str - String
 * @param {string} separator - Separador de palavras
 * @returns {string}
 */
PiString.last = function (str, separator = ' ') {
    const tokens = str.split(separator);
    
    if (tokens.length == 0) {
        return str;
    }

    return tokens[tokens.length - 1];
}

/**
 * Retorna a primeira palavra separada por caracter
 * 
 * @param {string} str - String
 * @param {string} separator - Separador de palavras
 * @returns {string}
 */
PiString.first = function (str, separator = ' ') {
    const tokens = str.split(separator);

    if (tokens.length == 0) {
        return str;
    }

    return tokens[0];
}

/**
 * Retorna uma string formatada segundo os marcadores de texto
 * 
 * @param {strin} format - String com marcadores de texto
 * @param  {...any} args - Lista de valoers para os marcadores de texto
 * @returns {string}
 */
PiString.format = function (format, ...args) {
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

/**
 * Faz o recorte no texto baseado nos caracteres informados nos parametros beginWord e endWord
 * 
 * @param {string} text - Texto
 * @param {string} beginWord - Palavra que inicia o clipping
 * @param {string} endWord - Palavra que finaliza o clipping
 * @returns {string}
 */
PiString.clips = function (text, beginWord, endWord) {
    let arr = [];
    let i = -1;

    while (true) {
        i = text.indexOf(beginWord, i + 1);
        if (i == -1) break;
        i += beginWord.length;

        let f = text.indexOf(endWord, i + 1);
        if (f == -1) break;

        arr.push(text.substr(i, f - i));
        i = f + 1;
    }

    return arr;
};/**
 * @class
 */
class PiClass {
    #parameters = null;

    constructor(...args) {
        this.instances(...args);

        if (PiType.isObject(args[0])) {
            PiObject.extendAndCall(this, args[0]);
        }

        this.#parameters = args[0] == undefined ? {} : args[0];

        this.init(...args);
    }

    instances() {

    }

    /**
     * Retorna o parametro fornecido na criação do objeto
     * 
     * @returns {object}
     */
    get parameters() {
        return this.#parameters;
    }

    /**
     * Injeta as propriedades do objeto
     * 
     * @param {json} json - Objeto a ser injetado no objeto atual
     * @returns {this}
     */
    inject(json) {
        for (var property in json) {
            this[property] = json[property];
        }

        return this;
    }

    init() {

    }

    jsonWillConvert() {

    }

    /**
     * Converte o objeto em um json
     * 
     * @returns {object}
     */
    toJson() {
        this.jsonWillConvert();
        let json = JSON.parse(JSON.stringify(this));
        this.jsonDidConvert(json);

        return json;
    }

    jsonDidConvert(json) {

    }

    cloneWillLoad() {

    }

    /**
     * Clona o objeto atual
     * 
     * @returns {this}
     */
    clone() {
        this.cloneWillLoad();
        let json = this.toJson();
        let clone = new this.constructor(json);
        this.cloneDidLoad(clone);

        return clone;
    }

    cloneDidLoad() {

    }

    /**
     * Cria uma nova instancia da classe
     * 
     * @param  {...any} args 
     * @returns {this}
     */
    static create(...args) {
        return new this(...args);
    }
    
    create(...args) {
        return new this.constructor(...args);
    }
};/**
 * @class
 */
(function () {
    class PiConfig extends PiClass {
        /**
         * Define uma configuração
         * 
         * @param {string} key - Parametro da configuração
         * @param {object} value - Valor da configuração
         * @returns {PiConfig}
         */
        set(key, value) {
            PiObject.setProperty(this, key, value);
            
            return this;
            // this[key] = value;
        }
        
        /**
         * Retorna uma configuração
         * 
         * @param {string} key - Path da configuração
         * @returns {object||string}
         */
        get(key) {
            return PiObject.extractValue(this, key);
            // let p = (config || '').split('.'),
            //     settings = this;

            // for (let i in p) {
            //     settings = settings[p[i]];
            //     if (settings == undefined) return null;
            // }

            // return settings;
        };

        /**
         * Carrega um conjunto de configurações
         * 
         * @param {object} settings - Objeto contendo configurações
         * @returns {PiConfig}
         */
        load(settings) {
            PiObject.extend(this, settings);

            if (settings.yum) {
                if (settings.yum.cache) {
                    yum.download.cache = settings.yum.cache;
                }

                if (settings.yum.version != undefined) {
                    yum.setVersion(settings.yum.version);
                }
            }

            return this;
        }

        /**
         * Mescla a configuração atual com a nova configuração informada por parametro
         * 
         * @param {object} settings - Configuração
         * @param {object} value - Valor da configuração
         * @returns {object}
         */
        extend(settings, value = false) {
            if (value == false) return PiObject.extend(this, settings);
            else return PiObject.extend(this, { settings: value });
        }

    };

    PiExport('PiConfig', new PiConfig({
        app: {
            parse: {
                enable: true,
                selector: 'body'
            }
        },
        history: {
            popstate: false,
            prefixHashtag: true
        },
        services: []
    }));
})();/**
 * @class
 */
class PiFile {

    /**
     * Retorna a extensão do nome do arquivo
     * 
     * @param {string} file - Nome do arquivo
     * @returns {string}
     */
    static extension(file) {
        file = file || '';

        let i = file.lastIndexOf('.'),
            j = file.indexOf('?', i);

        if (i > 0) {
            if (j > i) {
                return file.substring(i + 1, j);
            } else {
                return file.substring(i + 1);
            }
        } else {
            return '';
        }
    }

    /**
     * Retorna somente o nome do arquivo sem extensão
     * 
     * @param {string} file - Nome do arquivo
     * @returns {string}
     */
    static filename(file) {
        file = file || '';
        let i = file.lastIndexOf('.'),
            s = file.lastIndexOf('?'),
            f = file.lastIndexOf('/');

        if (i > 0) {

            if (s > f) {
                return file.substring(s + 1, i);
            } else {
                return file.substring(f + 1, i);
            }


        } else if (f > 0) {

            if (s > 0) {
                return file.substring(s + 1);
            } else {
                return file.substring(f + 1);
            }

        } else {
            return file;
        }
    }

};/**
 * @class
 */
class PiRandom {
    static #seed = 0;
    /**
     * Gera um número aleatório
     * 
     * @returns {number}
     */
    static generator() {
        return PiRandom.range(0, Number.MAX_VALUE);
    }

    /**
     * Gera um número aleatório entre {min} e {max}
     * 
     * @param {number} _min - Valor mínimo
     * @param {number} _max - Valor máximo
     * @returns {number}
     */
    static range(_min, _max) {
        _min = _min || 0;
        _max = _max || Number.MAX_VALUE;

        let random = Math.floor(Math.random() * (1 + _max - _min)) + _min;

        if (random > _max) return _max;
        else return random;
    }

    static uuid(format) {
        let d = new Date().getTime();
        let uuid = (format || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx').replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });

        return uuid + (PiRandom.#seed++);
    }

}/**
 * @class
 */
class PiCallback {
    #list = [];

    /**
     * Remove todos os listeners
     * 
     * @returns {PiCallback}
     */
    clear() {
        this.#list = [];

        return this;
    }

    /**
     * Adiciona um callback
     * 
     * @param {string} name - Nome do callback
     * @param {function} fn - Função de callback
     * @param {object} ctx - Contexto onde o callback será chamado
     * @returns {PiCallback}
     */
    add(name, fn, ctx) {
        if (this.#list[name] == null) {
            this.#list[name] = [];
        }

        this.#list[name].push({ name: name, fn: fn, ctx: ctx });

        return this;
    }

    /**
     * Remove um callback por nome
     * 
     * @param {string} name - Nome do callback
     * @returns {PiCallback}
     */
    remove(name) {
        if (!this.exist(name)) return this;

        this.#list[name] = [];

        return this;
    }

    /**
     * Verifica se existe um callback adicionado
     * 
     * @param {string} name - Nome do callback
     * @returns {boolean}
     */
    exist(name) {
        return this.#list[name] != null;
    }

    /**
     * Returna uma lista com todos os callbacks adicionado pelo nome
     * 
     * @param {string} name - Nome do callback
     * @returns {array}
     */
    get(name) {
        if (!this.exist(name)) return [];
        return this.#list[name];
    }

    /**
     * Alias para get(name)
     * 
     * @param {string} name - Nome do callback
     * @returns {array}
     */
    findAll(name) {
        return this.get(name);
    }

    /**
     * Dispara os callback adicionados pelo nome
     * 
     * @param {string} name - Nome
     * @param  {...any} args - Lista de parametros passado para o callback
     * @returns {object}
     */
    trigger(name, ...args) {
        let arr = this.findAll(name);
        let r = undefined;

        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];

            r = item.fn.apply(item.ctx, args);
        }

        return r;
    }
};/**
 * @class
 */
class PiRequest extends PiClass {
    #sending = false;
    #xhr = null;

    /**
     * Aborta o request caso a solicitação tenha sido enviada
     * 
     * @returns {PiRequest}
     */
    abort() {
        if (this.#xhr) {
            this.#xhr.abort();
            this.#xhr = null;
            this.#sending = false;
        }

        return this;
    }

    /**
     * Retorna se a request esta sendo enviada
     * 
     * @returns {boolean}
     */
    isSending() {
        return this.#sending;
    }

    /**
     * Envia uma request do tipo GET
     * 
     * @param {string} url - Url da request
     * @param {object} obj - Query string como objeto
     * @returns {Promise}
     */
    async get(url, obj) {
        return new Promise((resolve, reject) => {
            let qs = '';

            if (obj != undefined) qs = '?' + this.#convertObjectToFormData(obj);

            this.#requestGet(url + qs, (response) => {
                resolve(response);
            }, (...args) => {
                reject(...args);
            });
        });
    }

    /**
     * Envia uma solicitação do tipo GET e faz o parse JSON da resposta
     * 
     * @param {string} url - Url da request
     * @param {object} obj - Query string como objeto
     * @returns {Promise}
     */
    async getJson(url, obj) {
        return new Promise((resolve, reject) => {
            let qs = '';

            if (obj != undefined) qs = '?' + this.#convertObjectToFormData(obj);

            this.#requestGet(url + qs, (response) => {
                let json = JSON.parse(response);
                if (this.#existProtocol(json)) {
                    if (json.status == 'ok') resolve(json.data, json.paging);
                    else reject(json.message);
                } else {
                    resolve(json);
                }
            }, (...args) => {
                reject(...args);
            });
        });
    }

    /**
     * Envia uma solicitação do tipo POST.
     * 
     * @param {string} url - Url da requeset
     * @param {object} obj - Objeto a ser enviado no formato value=key
     * @returns {Promise}
     */
    async post(url, obj) {
        return new Promise((resolve, reject) => {
            let formData = this.#convertObjectToFormData(obj);

            this.#requestPost(url, encodeURI(formData),
                (xhr) => {
                    xhr.headers.append('Content-Type', 'application/x-www-form-urlencoded');

                    return xhr;
                },
                (response) => {
                    resolve(response);
                }, (...args) => {
                    reject(...args);
                });
        });
    }

    /**
     * Envia para a url informada array de File
     * 
     * @param {string} url - Url da request e faz o parse JSON da resposta
     * @param {array} files - Array File
     * @returns {Promise}
     */
    async sendFiles(url, files) {
        return new Promise((resolve, reject) => {
            var formData = new FormData();

            for (var i = 0; i < files.length; i++) {
                formData.append(`file${i}`, files[i]);
            };

            this.#requestPost(url, formData,
                (xhr) => {
                    // xhr.headers.append('Content-Type', 'application/x-www-form-urlencoded');

                    return xhr;
                }, (response) => {
                    let json = JSON.parse(response);
                    if (this.#existProtocol(json)) {
                        if (json.status == 'ok') resolve(json.data, json.paging);
                        else reject(json.message);
                    } else {
                        resolve(json);
                    }
                }, (...args) => {
                    reject(...args);
                });
        });
    }

    /**
     * Envia uma solicitação do tipo POST e faz o parse JSON da resposta
     * 
     * @param {string} url - Url da request
     * @param {object} obj - Objeto a ser enviado no formato json
     * @returns {Promise}
     */
    async postJson(url, obj) {
        return new Promise((resolve, reject) => {
            this.#requestPost(url, JSON.stringify(obj),
                (xhr) => {
                    xhr.headers.append('Content-Type', 'application/json');

                    return xhr;
                }, (response) => {
                    let json = JSON.parse(response);
                    if (this.#existProtocol(json)) {
                        if (json.status == 'ok') resolve(json.data, json.paging);
                        else reject(json.message);
                    } else {
                        resolve(json);
                    }
                }, (...args) => {
                    reject(...args);
                });
        });
    }

    #convertObjectToFormData(obj) {
        let encodedString = '';

        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                if (encodedString.length > 0) {
                    encodedString += '&';
                }
                encodedString += prop + '=' + obj[prop];
            }
        }

        return encodedString;
    }

    #createRequest(url, config, success, error) {
        var headers = new Headers();
        headers.append('Accept', 'application/json, text/plain, */*');

        this.#xhr = new AbortController();
        var settings = config({
            signal: this.#xhr.signal,
            mode: 'cors',
            headers: headers
        });

        this.#sending = true;
        fetch(url, settings).then((response) => {
            this.#sending = false;

            if (response.status == 200) {
                response.text().then((text) => {
                    success(text);
                });
            } else {
                error(response.status);
            }

            this.#xhr = null;
        }).catch(function (e) {
            if (e.message == 'Failed to fetch') {
                // error(e.message, Pi.RequestError.OFFLINE);
            }
        });
    }

    #requestGet(url, success, error) {
        // let auth = Pi.getConfig('request.Authorization');

        this.#createRequest(url,
            (config) => {
                config.method = 'GET';
                config.headers.append('X-Requested-With', 'XMLHttpRequest');

                // if (auth != undefined) {
                //     config.headers.append('Authorization', auth);
                // }

                return config;
            },
            (response) => {
                success(response);
            },
            (m, e) => {
                error(m, e);
            }
        );
    }

    #requestPost(url, formData, config, success, error) {
        // let auth = Pi.getConfig('request.Authorization');

        this.#createRequest(url,
            (xhr) => {
                xhr.method = 'POST';

                xhr.headers.append('X-Requested-With', 'XMLHttpRequest');

                // if (auth != undefined) {
                //     xhr.headers.append('Authorization', auth);
                // }

                xhr.body = formData;

                return config(xhr);
            },
            (response) => {
                success(response);
            },
            (m, e) => {
                error(m, e);
            }
        );
    }

    #existProtocol(json) {
        return json.status;
    }

};/**
 * @class
 */
class PiDownload extends PiClass {
    #downloaded = [];
    #cache = false;
    #callback = new PiCallback();

    get cache() {
        return this.#cache;
    }

    set cache(cache) {
        this.#cache = cache;
    }

    /**
     * Faz o download de um documento html
     * 
     * @param {string} url - Url do html
     * @returns {Promise}
     */
    html(url) {
        return new Promise((resolve, reject) => {
            let request = new PiRequest();

            request.get(url).then((html) => {
                resolve([url, html]);
            });
        });
    }

    /**
     * Faz o download de um arquivo json
     * 
     * @param {string} url - Url do json
     * @returns {Promise}
     */
    json(url) {
        return new Promise((resolve, reject) => {
            let request = new PiRequest();

            request.getJson(url).then((json) => {
                resolve([url, json]);
            });
        });
    }

    /**
     * Faz o donwload de um arquivo js
     * 
     * @param {string} url - Url do arquivo js
     * @returns {PiDownlaod}
     */
    js(url) {
        return new Promise((resolve, reject) => {
            let cb = resolve;

            if (this.#downloaded[url]) {
                cb(url, true);
                return this;
            }

            if (this.#callback.exist(url)) {
                this.#callback.add(url, cb);
                return this;
            }
            this.#callback.add(url, cb);

            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = false;
            script.src = this.#createUrl(url);
            script.onload = () => {
                this.#downloaded[url] = true;
                this.#callback.trigger(url, url);
                script.remove();
            };

            script.onerror = function () {
                reject();
            };

            this.#insertElement(script);
        });
    }

    /**
     * Faz o download de um arquivo css
     * 
     * @param {string} url - Url do arquivo css
     * @returns {Promise}
     */
    css(url) {
        return new Promise((resolve, reject) => {
            let cb = resolve;

            if (this.#downloaded[url]) {
                cb(url);
                return this;
            }

            if (this.#callback.exist(url)) {
                this.#callback.add(url, cb);
                return this;
            }
            this.#callback.add(url, cb);

            let style = document.createElement('link');
            style.type = 'text/css';
            style.rel = 'stylesheet';
            style.media = 'all';
            style.href = this.#createUrl(url);

            style.onload = () => {
                this.#downloaded[url] = true;
                this.#callback.trigger(url, url);
                // style.remove();
            };

            style.onerror = function () {
                reject
            };

            this.#insertElement(style);
        });
    }

    #createUrl(url) {
        if (!this.#cache) return url;

        return PiString.format('{0}?_', url, PiRandom.range(1, 100000));
    }

    #getHeader() {
        return document.getElementsByTagName('head')[0] || document.documentElement;;
    }

    #insertElement(element) {
        this.#getHeader().appendChild(element);
    }
};(function () {
    /**
 * @class
 */
    class PiYum extends PiClass {
        static #pkgs = [];
        #loaded = [];
        #version = '';
        #enabled = true;
        #downloadFile = new PiDownload();

        /**
         * Faz um submite para a url informada enviando todas as urls dos arquivos baixados por tipo
         * 
         * @param {string} url - Url para onde todas urls do arquivos baixados por tipo serão enviada
         * @param {string} type - Tipo do arquivo. Ex: js, css, html, ...
         * @returns {PiYum}
         */
        minify(url, type = 'js') {
            this.#submit(url, { urls: this.#listUrls(type) });

            return this;
        }

        /**
         * Retorna o objeto que manipula o download dos arquivos
         * 
         * @returns {PiDownload}
         */
        get download(){
            return this.#downloadFile;
        }

        /**
         * Habilita ou desabilita o download de arquivos
         * 
         * @param {boolean} b
         * @returns {PiYum}
         */
        enable(b = null) {
            this.#enabled = b;

            return this;
        }

        /**
         * Verifica se download esta habilitado
         * 
         * @returns {boolean}
         */
        isEnabled() {
            return this.#enabled;
        }

        /**
         * Define a versão (hash) que será concatenado no final da url do arquivo
         * @param {string} v - Versão
         * @returns {PiYum}
         */
        setVersion(v) {
            if (v.length == 0) return this;

            this.#version = '?v' + v;

            return this;
        }

        /**
         * Define um módulo que será executado somente quando todas as 
         * dependencias forem resolvidas
         * 
         * @param {string} urls - Array de url de arquivos
         * @param {function} callback - Callback que será chamada quando todas as dependencias forem resolvidas
         * @returns {PiYum}
         */
        define(urls, callback) {
            var __callback = null;
            var __urls = null;

            if (PiType.isFunction(urls)) {
                __urls = [];
                __callback = urls;
            } else {
                __urls = urls;
                __callback = callback;
            }

            this.#addPackage(__urls, __callback);

            if (!this.isEnabled()) {
                __callback();
            }

            return this;
        }

        /**
         * Faz o download de todos os arquivos apontados na url
         * e chama o callback assim que as dependencias forem
         * resolvidas
         * 
         * @param {string} urls - Array das urls dos arquivos
         * @param {function} callback - Callback que será executado quando as dependencias forem resolvidas
         * @param {object} context - Objeto de contexto
         * @returns {PiYu}
         */
        download(urls, callback, context) {
            if (!this.isEnabled()) {
                (callback || function () { }).call(context);
                return;
            }

            if (urls.length == 0) {
                if (callback == undefined) return;
                callback.call(context);
                return;
            }

            this.#load(urls, () => {
                setTimeout(function () {
                    if (callback == undefined) return;
                    callback.apply(context, arguments);
                }, 1);
            });

            return this;
        }

        #submit(url, params) {
            var form = document.createElement('form');

            form.setAttribute('method', 'POST');
            form.setAttribute('action', url);
            form.setAttribute('target', '_blank');

            form._submit_function_ = form.submit;

            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    var hiddenField = document.createElement('input');
                    hiddenField.setAttribute('type', 'hidden');
                    hiddenField.setAttribute('name', key);
                    hiddenField.setAttribute('value', params[key]);

                    form.appendChild(hiddenField);
                }
            }

            document.body.appendChild(form);
            form._submit_function_();
        }

        #listUrls(type = 'js') {
            var pkgs = PiYum.#pkgs;
            var urls = [];

            for (let i = pkgs.length - 1; i >= 0; i--) {
                var urls = pkgs[i].urls;
                for (let j = urls.length - 1; j >= 0; j--) {
                    var url = urls[j].toString();
                    if (PiFile.extension(url) == type) {
                        urls.push(url);
                    }
                }
            }

            return urls.join(',');
        }

        #addPackage(urls, callback) {
            PiYum.#pkgs.push({ urls: urls, cb: callback });

            return this;
        }

        #getLastPackage() {
            if (PiYum.#pkgs.length == 0) return null;
            else return PiYum.#pkgs[PiYum.#pkgs.length - 1];
        }

        #load(urls, callback) {
            let total = urls.length;
            let counter = new PiCallback();
            let args = [];

            if (PiType.isFunction(urls)) {
                callback();
                return;
            }

            if (total == 0) {
                callback();
                return;
            }

            counter.add('downloaded', () => {
                total--;
                if (total == 0) {
                    callback.apply(null, args);
                }
            });

            for (let i = 0; i < urls.length; i++) {
                let url = urls[i];
                if (url == undefined) {

                }

                if (url instanceof PiUrl) {
                    url = url.toString();
                }

                let extension = PiFile.extension(url);


                if (extension == 'js') {
                    this.#downloadFile.js(url + this.#version).then((url, cache) => {
                        if (cache) {
                            this.#load(this.#loaded[url].urls, () => {
                                counter.trigger('downloaded');
                            });
                            return;
                        }

                        let pkg = this.#getLastPackage();
                        if (this.#loaded[url] == undefined) {
                            this.#loaded[url] = pkg;
                        } else {
                            pkg = this.#loaded[url];
                        }

                        if (pkg == null) {
                            counter.trigger('downloaded');
                        } else if (pkg.urls.length == 0) {
                            pkg.cb();
                            counter.trigger('downloaded');
                        } else {
                            this.#load(pkg.urls, (...args) => {
                                pkg.cb(...args);
                                counter.trigger('downloaded');
                            });
                        }
                    });
                } else if (extension == 'css') {

                    // if (PigetConfig('yum.sync') === false) {
                    //     counter.trigger('downloaded');
                    //     this.#downloadFile.css(url + this.#version, (url) => {

                    //     });
                    // } else {
                    //     this.#downloadFile.css(url + this.#version, (url) => {
                    //         counter.trigger('downloaded');
                    //     });
                    // }

                    this.#downloadFile.css(url + this.#version).then((url) => {
                        counter.trigger('downloaded');
                    });

                } else if (extension == 'html') {
                    this.#downloadFile.html(url + this.#version).then(([_, html]) => {
                        args[this.#findIndex(urls, url)] = html;
                        counter.trigger('downloaded');
                    });
                } else if (extension == 'json') {
                    this.#downloadFile.json(url + this.#version).then(([_, json]) => {
                        args[this.#findIndex(urls, url)] = json;
                        counter.trigger('downloaded');
                    });
                } else {
                    counter.trigger('downloaded');
                }
            }

            return this;
        }

        #findIndex(urls, url) {
            for (var i = 0; i < urls.length; i++) {
                if (urls[i] == url) return i;
            }

            return -1;
        }

    }

    PiExport('yum', new PiYum());
})();/**
 * @class
 */
PiStatement = {};

/**
 * Executa uma statement iniciando em um contexto
 * 
 * @param {string} statement - Statement que será executada dentro do contexto
 * @param {object} context - Contexto de execução
 * @returns {object}
 */
PiStatement.exec = function (statement, context) {
    return PiStatement.execWithVariables(statement, [[], []], context);
}

/**
 * Executa uma statement dentro de um contexto com variavéis de escopo
 * 
 * @param {string} statement - Statement
 * @param {array} variables - Array com os nomes e valores das variáveis
 * @param {object} context - Objeto de contexto
 * @returns {object}
 */
PiStatement.execWithVariables = function (statement, variables, context) {
    const variableNames = variables[0];
    const variableValues = variables[1];

    for (let i = 0; i < variableNames.length; i++) {
        const variableName = variableNames[i];
        variableNames[i] = variableNames[i].replaceAll('.', '');
        statement = statement.replaceAll(variableName, variableNames[i])
    }

    const func = new Function('_this', ...variableNames, `return (function(){return ${statement}}).call(_this);`);
    return func(context, ...variableValues);
}/**
 * @class
 */
class PiVirtualTree {
    #element = null;
    #elements = [];
    #componentParent = null;
    #hook = [];

    constructor(element, componentParent = null) {
        this.#element = element;
        this.#componentParent = componentParent;
    }

    hook(name, fn) {
        this.#hook[name] = fn;

        return this;
    }

    load(scope = { context: {}}) {
        this.#elements = this.createVirtualElements([this.#element], scope, this.#componentParent);

        return this;
    }

    destroy() {
        for (let i = 0; i < this.#elements.length; i++) {
            const element = this.#elements[i];
            element.destroy();
        }

        this.#elements = [];

        return this;
    }

    createVirtualElements(elements, scope, componentParent = null) {
        let elementsCreated = [];

        if (elements == null) {
            return elementsCreated;
        }

        if (elements.length == 1 && elements[0] instanceof DocumentFragment) {
            const _elementsCreated = this.createVirtualElements(elements[0].children, scope, componentParent);
            elementsCreated = elementsCreated.concat(_elementsCreated);
            return elementsCreated;
        }

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            let component = null;

            if (element._pie == undefined) {
                this._invokeHook('will:create:velement');
                const velement = new PiElement(element, scope);
                this._invokeHook('did:create:velement', velement);
                this._invokeHook('will:load:velement', velement);
                velement.load();
                this._invokeHook('did:load:velement', velement);

                if (velement.isDestroyed) {
                    i--;
                    continue;
                }

                // const tagName = PiString.capital(element.tagName.toLowerCase()).replace(/-/g, '');
                const componentName = element.getAttribute('component');
                const componentClass = PiEnv.global[componentName];

                if (componentClass != undefined) {
                    component = new componentClass();
                } else if (componentName != null) {
                    throw `PiVirtualTree: O component ${componentName} não foi implementado.`;
                }

                if (componentParent) {
                    const name = element.getAttribute('name');

                    if (name != null && component != null) {
                        componentParent[name] = component;
                    }
                }

                elementsCreated.push(velement);
            }

            const _elementsCreated = this.createVirtualElements(element.children, scope, component || componentParent);
            elementsCreated = elementsCreated.concat(_elementsCreated);

            if (component) {
                component.render(element);
            }
        }

        return elementsCreated;
    }

    _invokeHook(name, ...params) {
        if (this.#hook[name]) {
            this.#hook[name](...params);
        }

        return this;
    }
}/**
 * @class
 * @name PiTree
 */
class PiTree {
    /**
     * Cria uma arvóre virtual onde todos os elementos serão instancias de PiElement
     * 
     * @constructor PiTree
     * @param {string|Element} html - View html como parametro
     * @param {PiComponent} component - Component que manipula a árvore virtual
     * @param {object} [scope = {}] - Escopo da arvóre virtual
     */
    constructor(html, scope = {}, component = null) {
        if (html instanceof Element) html = html.innerHTML;
        this._html = html;
        this._document = null;
        this._elementRoot = null;
        this._scope = scope;
        this._component = component;
        this._wp = new PiEnv.global.DOMParser();
        this._children = null;
    }

    /**
     * Analisa e carrega os elementos na árvore virtual
     * 
     * @returns {PiElement}
     */
    load() {
        this._parse();

        return this;
    }

    /**
     * Adiciona a árvore virtual dentro do elemento html passado por parametro
     * 
     * @param {Element} elemento - Elemento html onde será inserido a árvore virtual
     * @param {boolean} [true] clear - Define se o conteúdo do elemento será apagado 
     */
    render(elemento, clear = true) {
        if (clear) {
            elemento.innerHTML = ''; // Limpa a DOM para adicionar a DOM fragmentada(cópia) para a DOM principaç 
        }

        elemento.append(this._elementRoot); //Adicionou

        return this;
    }

    /**
     * Retorna o documento do html analisado
     * 
     * @returns {Element}
     */
    get document() {
        return this._document;
    }

    /**
     * Retorna o elemento raiz do html analisado
     * 
     * @returns {Element}
     */
    get root() {
        return this._elementRoot;
    }

    /**
     * Retorna todos os elementos filhos da raiz do html analisado
     * 
     * @returns [Element]
     */
    get children() {
        return this._children;
    }

    destroy() {
        this._virtualTree.destroy();
    }

    _parse() {
        this._loadDocument();
        this._loadElementRoot();
        this._loadVirtualTree();
    }

    _loadDocument() {
        try {
            this._document = this._wp.parseFromString(this._html, 'text/html'); //Vai fazer o parse de string para Element
        } catch (error) {
            console.log('PiTree: O html informado esta formatado incorretamente');
            console.log(this._html);
        }
    }

    _loadVirtualTree() {
        this._virtualTree = new PiVirtualTree(this._elementRoot, this._component);
        this._virtualTree.load(this._scope);
    }

    _loadElementRoot() {
        const root = document.createDocumentFragment(); // Vai criar um fragmento da DOM principal
        const element = this._document.getElementsByTagName('body')[0];
        const elements = [...element.children];

        for (let i = 0; i < elements.length; i++) {
            root.appendChild(elements[i]); // Vai adicional todos os elementos da DOM principal para a DOM fragmentada
        }

        this._elementRoot = root;
        this._children = elements;
    }
};
/**
 * @class
 */
class PiExpression {

    /**
     * 
     * @param {string} template - Template base
     */
    constructor(template) {
        this._template = template;

        this._rxExpression = /\{\{[^\}\}]+\}\}/gi;
        this._rxVariable = /@[\w\.]+/gi;

        this._load();
    }

    /**
     * Retorna todas as expressões encontradas no template base
     * 
     * @returns {array}
     */
    get all() {
        const expressions = [];

        for (let i = 0; i < this._expressions.length; i++) {
            expressions.push(this._clear(this._expressions[i].value));
        }

        return expressions;
    }

    /**
     * Retorna todas as variáveis encontradas dentro das expressões
     * 
     * @returns {array}
     */
    get variables() {
        if (this._variables == undefined) {
            this._variables = this._extractAllVariables();
        }

        return this._variables;
    }

    /**
     * Retorna resultado do template parseado com o contexto informado
     * 
     * @param {object} context 
     * @returns {string}
     */
    parse(context, variables = [[], []]) {
        let expressions = this._expressions;
        let phrase = this._phrase;

        for (let i = 0; i < expressions.length; i++) {
            const expression = expressions[i];
            const stmt = this._clear(expression.value);
            const variableNames = this._extractVariables(expression.value);
            const variableValues = this._extractVariablesValues(variableNames, context);
            const _variableNames = variables[0].concat(variableNames);
            const _variableValues = variables[1].concat(variableValues);

            let value = PiStatement.execWithVariables(stmt[0] == '#' ? stmt.substr(1) : 'this.' + stmt, [_variableNames, _variableValues], context);

            if (PiType.isNumber(value) && value == 0) {
                value = '0';
            } else if (PiType.isObject(value)) {
                value = JSON.stringify(value);
            }

            phrase = phrase.replace(expression.key, PiType.isBoolean(value) ? value : value || '');
        }

        return phrase;
    }

    _load() {
        var { phrase, expressions } = this._extractPhraseAndExpressions();
        this._phrase = phrase;
        this._expressions = expressions;
    }

    _clear(expression) {
        expression = expression.replace(/\{/gi, '');
        expression = expression.replace(/\}/gi, '');
        expression = expression.replace(this._rxVariable, function (v) {
            return v.substr(1);
        });

        return expression.trim();
    }

    _extractPhraseAndExpressions() {
        var expressions = [];
        var counter = 1;
        var phrase = this._template.replace(this._rxExpression, function (expressionFounded) {
            const variable = `_$${counter++}_`;

            expressions.push({
                value: expressionFounded,
                key: variable
            });

            return variable;
        });

        return { phrase, expressions };
    }

    _extractAllVariables() {
        var variables = this._template.match(this._rxVariable) || [];

        for (let i = 0; i < variables.length; i++) {
            const v = variables[i];
            variables[i] = v.substr(1);
        }

        return variables;
    }

    _extractVariables(expression) {
        var variables = expression.match(this._rxVariable) || [];

        for (let i = 0; i < variables.length; i++) {
            const v = variables[i];
            variables[i] = v.substr(1);
        }

        return variables;
    }

    _extractVariablesValues(variableNames, context) {
        const variables = [];

        for (let i = 0; i < variableNames.length; i++) {
            const name = variableNames[i];

            variables.push(PiObject.extractValue(context, name));
        }

        return variables;
    }

}/**
 * @class
 */
PiFunction = {};

/**
 * Função vazia
 */
PiFunction.noop = function () { };
class PiForEachDirective {
    constructor(stmt, context = {}, fn = PiFunction.noop) {
        this._stmt = stmt;
        this._context = context;
        this._fn = fn;
        this._end = PiFunction.noop;

        this._load();
    }

    get variableInterableName() {
        return this._variableInterableName;
    }

    get objectInterableName() {
        return this._objectInterableName;
    }

    loop(fn) {
        this._fn = fn;

        return this;
    }

    run(array = null, indexBegin = 0, indexEnd = -1, step = 1) {
        const objectInterable = array || PiObject.extractValue(this._context, this._objectInterableName);
        const foreachFn = new Function('_this', 'arr', 'indexBegin', 'indexEnd', 'step', 'vn', 'fn', `for(var i = indexBegin ; i < indexEnd ; i += step){fn(arr, i, vn);}`);

        if (indexEnd == -1) {
            indexEnd = array.length;
        }

        foreachFn(this, objectInterable, indexBegin, indexEnd, step, this._variableInterableName, this._fn)
        this._end();

        return this;
    }

    end(fn) {
        this._end = fn;

        return this;
    }

    _load() {
        const stmt = this._stmt;
        const tokens = stmt.trim().split(' ');

        if (tokens.length != 3) {
            throw `PiForEachDirective: Statement inválida para laço foreach = ${stmt}. Padrão esperado: (variable in interable)`;
        }

        this._variableInterableName = tokens[0];
        this._objectInterableName = tokens[2];
    }
}/**
 * @class
 */
class PiElement {
    /**
     * Constroi PiElement baseado no elemento html
     * 
     * @param {Element} element - Elemento html
     * @param {object} [scope = {context: {}}] - Classe de escopo
     */
    constructor(element, scope = { context: {} }) {
        this._element = element;
        this._attrNames = element.getAttributeNames();
        this._destroyed = false;
        this._directives = [];

        this._scope = scope;
        this._watchs = [];
        this._foreachContext = {};
        this._children = [];

        this._loadDirectivesBase();

        this._element._pie = true;
    }

    /**
     * 
     * @param {string} name - Adiciona propriedade ao contexto do foreach
     * @param {obj} value - Objeto associado a propriedade de contexto do foreach
     * @returns {PiElement}
     */
    addForeachContext(name, value) {
        this._foreachContext[name] = value;

        return this;
    }

    /**
     * Monitora alteração sobre propriedade 
     * 
     * @param {string} propertyName - Nome da propriedade a ser monitorada
     * @param {function} fn - Função de callback
     * @returns {PiElement}
     */
    watch(propertyName, fn) {
        this._addContextWatch(propertyName, fn);

        return this;
    }

    /**
     * Para de monitorar uma proprieade do contexto
     * 
     * @param {string} propertyName - Nome da propriedade
     * @returns {PiElement}
     */
    unWatch(propertyName) {
        const arr = this._watchs;

        for (let i = 0; i < arr.length; i++) {
            if (arr[i].property == propertyName) {
                PiObject.off(this._scope, arr[i].ids);
                break;
            }
        }

        return this;
    }

    /**
     * Carrega e analisa todas as diretivas juntamente com o template
     * 
     * @returns {PiElement}
     */
    load() {
        this._initDirectives();
        this._loadTemplate();

        return this;
    }

    /**
     * Adiciona uma directiva para um atributo do elemento
     * 
     * @param {string} name - nome da diretiva
     * @param {function} fn - Função de callback
     * @returns {this}
     */
    addDirective(name, fn) {
        this._directives[name] = fn;

        return this;
    }

    /**
     * Retorna se existe uma diretiva adicionada pelo seu nome
     * 
     * @param {string} name - Nome da diretiva
     * @returns {boolean}
     */
    existDirective(name) {
        return this._directives[name] != null;
    }

    /**
     * Retorna wrapper jquery
     * 
     * @returns {jQueryElement}
     */
    get $() {
        if (this._$element) return this._$element;
        return this._$element = $(this._element);
    }

    /**
     * Alias para listen
     * 
     * @param {string} eventName - Nome do evento
     * @param {function} fn - Função de callback
     * @param  {...any} args - Argumentos enviados ao callback quando ocorrer o evento
     * @returns {PiElement}
     */
    on(eventName, fn, ...args) {
        return this.listen(eventName, fn, ...args);
    }

    /**
     * Adiciona um callback sobre um evento do elemento
     * 
     * @param {string} eventName - Nome do evento
     * @param {function} fn - Função de callback
     * @param  {...any} args - Argumentos enviados ao callback quando ocorrer o evento
     * @returns {PiElement}
     */
    listen(eventName, fn, ...args) {
        this._element.addEventListener(eventName, (e) => {
            fn.apply(this, [e, ...args]);
        });

        return this;
    }

    /**
     * Alias para unlisten
     * 
     * @param {string} eventName - Nome do evento
     * @param {function} fn - Função de callback
     * @returns {PiElement}
     */
    off(eventName, fn) {
        return this.unlisten(eventName, fn);
    }

    /**
     * Remove callback sobre um evento do elemento
     * 
     * @param {string} eventName - Nome do evento
     * @param {function} fn - Função de callback
     * @returns {PiElement}
     */
    unlisten(eventName, fn) {
        this._element.removeEventListener(eventName, fn);

        return this;
    }

    /**
     * Remove elemento do DOM
     * 
     * @returns {PiElement}
     */
    destroy() {
        if (this._destroyed) {
            return;
        }

        this._destroyed = true;
        this._element.remove();
        this._clearContextWatch();

        for (let i = 0; i < this._children.length; i++) {
            this._children[i].destroy();
        }
        this._children = [];

        return this;
    }

    /**
     * Insere elemento depois
     * 
     * @param {PiElement} element - Elemento a ser inserido
     * @returns {PiElement}
     */
    insertBefore(element) {
        this._element.parentNode.insertBefore(element._element, this._element.nextElementSibling);

        return this;
    }

    /**
     * Insere elemento antes
     * 
     * @param {PiElement} element - Elemento a ser inserido
     * @returns {PiElement}
     */
    insertAfter(element) {
        this._element.parentNode.insertBefore(element._element, this._element.nextSibling);

        return this;
    }

    /**
     * Adiciona um elemento 
     * 
     * @param {PiElement} element 
     * @returns {PiElement}
     */
    append(element) {
        this._element.parentNode.append(element._element);

        return this;
    }

    /**
     * Executa uma statement dentro do contexto sempre que o evento associado for disparado
     * 
     * @param {string} statement - Statement executada sempre que o ocorrer o evento
     * @param {strin} event - Nome do evento a ser observado
     * @returns {PiElement}
     */
    addEventStatement(statement, event) {
        const expression = new PiExpression(statement);

        this.listen(event, function (e) {
            const ctx = this._prepareContext();
            const defaultVariables = this._getDefaultVariables();
            defaultVariables[0].push('$event');
            defaultVariables[1].push(e);

            const stmt = expression.parse(ctx, defaultVariables);

            return PiStatement.execWithVariables('this.' + stmt, defaultVariables, ctx);
        });

        return this;
    }

    _getDefaultVariables() {
        const self = this._element._component || this;

        return [['$this', '$element', '$index', '$value'], [self, this._element, this._foreachContext.arrayIndex, this._element.get()]];
    }

    /**
     * Retorna o valor do elemento
     * 
     * @returns {string|number|boolean}
     */
    get value() {
        const e = this._element;

        if (e instanceof HTMLInputElement && e.type == 'checkbox') {
            return e.checked;
        }

        if (e instanceof HTMLInputElement && e.type == 'radio') {
            return e.checked;
        }

        return e.value;
    }

    /**
     * Define o valor do elemento
     * 
     * @param {string|boolean} value - Valor
     * @returns {PiElement}
     */
    set value(value) {
        const e = this._element;

        if (e instanceof HTMLInputElement && (e.type == 'checkbox' || e.type == 'radio')) {
            e.checked = value;
            return this;
        }

        e.value = value;

        return this;
    }

    _addBindToElementContext(propertyName, eventName) {
        let isChangePropertyByEvent = false;

        const value = PiObject.extractValue(this._scope, 'context.' + propertyName);
        this._element.set(value);

        this._addContextWatch('context.' + propertyName, () => {
            if (isChangePropertyByEvent) {
                return;
            }

            const value = PiObject.extractValue(this._scope, 'context.' + propertyName);
            this._element.set(value);

            this._updateView();
        });

        if (eventName !== false) {
            this.listen(eventName, function () {
                isChangePropertyByEvent = true;
                PiObject.setProperty(this._scope.context, propertyName, this.value);
                isChangePropertyByEvent = false;
            });
        } else {
            this.listen('updated', function (e) {
                isChangePropertyByEvent = true;
                PiObject.setProperty(this._scope.context, propertyName, e.detail);
                isChangePropertyByEvent = false;
            });
        }

        return this;
    }

    /**
     * Adiciona um vinculo de direção dupla entre uma propriedade do contexto e o elemento virtual
     * 
     * @param {string} propertyName - Nome da propriedade do contexto que será vinculada ao elemento
     * @param {string} eventName - Nome da propriedade do contexto que será vinculada ao elemento
     * @returns {PiElement}
     */
    addBind(propertyName, _, eventName) {
        if (propertyName == null || propertyName.length == 0) {
            return;
        }

        this._addBindToElementContext(propertyName, eventName);

        // if (PiObject.extractValue(this._foreachContext, propertyName) !== undefined) {
        //     this._addBindToForeachContext(propertyName, eventName);
        // } else {
        //     this._addBindToElementContext(propertyName, eventName);
        // }

        return this;
    }

    /**
     * Retorna verdadeiro se o elemento estiver destruido
     * 
     * @returns {boolean}
     */
    get isDestroyed() {
        return this._destroyed;
    }

    /**
     * Define uma expression de inicialização
     * 
     * @param {string} expression
     * @returns {PiElement}
     */
    setInitDirective(expression) {
        const ex = new PiExpression(expression);
        const ctx = this._prepareContext();
        const defaultVariables = this._getDefaultVariables();
        const stmt = ex.parse(ctx, defaultVariables);

        // PiStatement.exec('this.' + stmt, ctx);
        PiStatement.execWithVariables('this.' + stmt, defaultVariables, ctx);

        return this;
    }

    /**
     * Adiciona bind fullduplex do elemento a propriedade da model
     * 
     * @param {string} propertyName - Nome da propriedade da model que será vinculada ao elemento
     * @returns {PiElement}
     */
    setModelDirective(propertyName) {
        let event = 'change';

        if (this._element instanceof HTMLInputElement) {
            event = 'keyup';
        }

        this._addBindToElementContext(propertyName, event);

        return this;
    }

    /**
     * Define o valor do elemento baseado em uma expression language avaliada dentro do contexto do elemento
     * 
     * @param {string} expression - Expressão a ser avaliada dentro do contexto
     * @returns {PiElement}
     */
    setValueDirective(expression) {
        const ex = new PiExpression(expression);
        const ctx = this._prepareContext();

        this.value = ex.parse(ctx, this._getDefaultVariables());

        return this;
    }

    /**
     * Define se o elemento terá o atributo 'selected' baseado na expression language
     * 
     * @param {string} expression - Expressão a ser avaliada dentro do contexto
     * @returns {PiElement}
     */
    setSelectedDirective(expression) {
        const ex = new PiExpression(expression);
        const ctx = this._prepareContext();
        const value = ex.parse(ctx, this._getDefaultVariables());

        if (value) {
            this._element.setAttribute('selected', true);
        } else {
            this._element.removeAttribute('selected');
        }

        return this;
    }

    setConditionalDirective(expression) {
        const ctx = this._prepareContext();
        const ex = new PiExpression(expression);
        const variables = ex.variables;
        const variableName = expression.replaceAll('{{', '').replaceAll('}}', '');

        this._loadConditionalDirective(ex);

        if (!PiType.isNullOrUndefined(ctx[variableName])) {
            this._addContextWatch('context.' + variableName, () => {
                this._loadConditionalDirective(ex);
            });
        }

        if (variables.length > 0) {
            for (let i = 0; i < variables.length; i++) {
                const variable = variables[i];
                this._addContextWatch('context.' + variable, () => {
                    this._loadConditionalDirective(ex);
                });
            }
        }
    }

    _loadConditionalDirective(ex) {
        const ctx = this._prepareContext();
        const defaultVariables = this._getDefaultVariables();
        const value = PiStatement.execWithVariables(ex.parse(ctx, defaultVariables), defaultVariables, ctx);

        const nextElement = this._element.nextElementSibling;
        const hasElse = nextElement && nextElement.hasAttribute(':else');

        if (value) {
            this.$.show();

            if (hasElse) {
                $(nextElement).hide();
            }
        } else {
            this.$.hide();

            if (hasElse) {
                $(nextElement).show();
            }
        }
    }

    /**
     * Define se o elemento terá o atributo 'disabled' baseado na expression language
     * 
     * @param {string} expression - Expressão a ser avaliada dentro do contexto
     * @returns {PiElement}
     */
    setDisabledDirective(expression) {
        const ex = new PiExpression(expression);
        const ctx = this._prepareContext();
        const value = ex.parse(ctx, this._getDefaultVariables());

        if (value) {
            this._element.removeAttribute('disabled');
        } else {
            this._element.setAttribute('disabled', true);
        }

        this._addContextWatch('context.' + expression, () => {
            const value = PiObject.extractValue(this._scope, 'context.' + expression);

            if (value) {
                this._element.removeAttribute('disabled');
            } else {
                this._element.setAttribute('disabled', true);
            }
        });

        return this;
    }

    /**
     * Define a manipulação do estilo do elemento por meio de uma expression language
     * 
     * @param {string} expression 
     * @returns {PiElement}
     */
    setStyleDirective(expression) {
        this._expressionStyle = new PiExpression(expression);

        this._updateStyle();

        const expressions = this._expressionStyle.all;
        for (let i = 0; i < expressions.length; i++) {
            const exp = expressions[i];

            this._addContextWatch('context.' + exp, () => {
                this._updateStyle();
            });
        }

        return this;
    }

    /**
     * Define a manipulação das classes do elemento por meio de uma expression language
     * 
     * @param {string} expression
     * @returns {PiElement}
     */
    setClassDirective(expression) {
        this._expressionClass = new PiExpression(expression);

        this._updateClass();

        const variables = this._expressionClass.variables;
        for (let i = 0; i < variables.length; i++) {
            const v = variables[i];

            this._addContextWatch('context.' + v, () => {
                this._updateClass();
            });
        }

        return this;
    }

    /**
     * Define a diretiva foreach do elemento
     * 
     * @param {stmt} stmt - Declaração foreach
     * @returns {PiElement}
     */
    setForEachDirective(stmt) {
        this._prepareContext();

        const foreach = new PiForEachDirective(stmt);
        const propertyName = foreach.objectInterableName;
        const attrNodes = this._getPiAttributeNodes([':foreach']);
        const array = PiObject.extractValue(this._scope, 'context.' + propertyName);

        let nodes = [];
        let parentNode = this._element.parentNode;
        let currentElements = [];

        foreach
            .loop((arr, index, vn) => {
                const foreachPropertyName = vn;

                this._setAttributeNodes(attrNodes);
                this._prepareContext();

                const clonedElement = this._element.cloneNode(true);
                const newElement = new PiElement(clonedElement, this._scope);

                newElement
                    .addForeachContext('enabled', true)
                    .addForeachContext('array', arr)
                    .addForeachContext('arrayName', propertyName)
                    .addForeachContext('arrayIndex', index);

                Object.defineProperty(newElement._foreachContext, foreachPropertyName, {
                    enumerable: true,

                    get: function () {
                        const array = newElement._foreachContext.array;
                        const index = newElement._foreachContext.arrayIndex;

                        return array[index];
                    },

                    set: function (value) {
                        const array = newElement._foreachContext.array;
                        const index = newElement._foreachContext.arrayIndex;

                        array[index] = value;
                    }
                });

                newElement._prepareContext();
                newElement.load();

                const vtree = new PiVirtualTree();
                vtree.hook('did:create:velement', (ve) => {
                    newElement._children.push(ve);
                    ve._foreachContext = newElement._foreachContext;
                });

                vtree.createVirtualElements(clonedElement.children, this._scope);

                nodes.push(newElement._element);
                currentElements.push(newElement);
            })
            .end(() => {
                parentNode.append(...nodes);
                nodes = [];
            }).
            run(array);

        Object.defineProperties(array, {
            'load': {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (array) {
                    this.splice(0, 0, ...array);

                    return this;
                }
            },
            'add': {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (item) {
                    this.splice(this.length, 0, item);

                    return this;
                }
            },
            'clear': {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function () {
                    this.splice(0, this.length);

                    return this;
                }
            },
            'remove': {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (index) {
                    this.splice(index, 1);

                    return this;
                }
            },
            'reload': {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function () {
                    // destroy os elementos
                    for (let i = 0; i < this.length; i++) {
                        currentElements[i].destroy();
                    }
                    currentElements = [];

                    foreach.run(this, 0);
                }
            },
            'splice': {
                enumerable: false,
                configurable: false,
                writable: false,
                value: function (index, deleteCount, ...items) {
                    if (deleteCount > 0) {
                        const length = index + deleteCount > currentElements.length ? currentElements.length : index + deleteCount;

                        // destroy os elementos
                        for (let i = index; i < length; i++) {
                            currentElements[i].destroy();
                        }

                        Array.prototype.splice.call(this, index, deleteCount);
                        currentElements.splice(index, deleteCount);

                        // atualiza os indexes
                        for (let i = 0; i < currentElements.length; i++) {
                            currentElements[i]._foreachContext.arrayIndex = i;
                        }
                    }

                    if (items.length > 0) {
                        Array.prototype.splice.call(this, index, 0, ...items);
                        foreach.run(this, index);
                    }

                    return this;
                }
            }
        });

        this.destroy();

        return this;
    }

    _getPiAttributeNodes(excepts = []) {
        const attrs = [];

        for (let i = 0; i < this._attrNames.length; i++) {
            const name = this._attrNames[i];
            const firstCharacter = name[0];

            if (excepts.indexOf(name) == -1 && (firstCharacter == ':' || firstCharacter == '#' || firstCharacter == '@')) {
                attrs.push(this._element.getAttributeNode(name));
            }
        }

        return attrs;
    }

    _setAttributeNodes(attrNodes = []) {
        for (let i = 0; i < attrNodes.length; i++) {
            const attrNode = attrNodes[i];
            if (attrNode == null) {
                continue;
            }
            this._element.setAttributeNode(attrNode);
        }

        return this;
    }

    _loadDirectivesBase() {
        this.addDirective('foreach', this.setForEachDirective);
        this.addDirective('class', this.setClassDirective);
        this.addDirective('style', this.setStyleDirective);
        this.addDirective('init', this.setInitDirective);
        this.addDirective('bind', this.addBind);
        this.addDirective('on', this.addEventStatement);
        this.addDirective('value', this.setValueDirective);
        this.addDirective('selected', this.setSelectedDirective);
        this.addDirective('disabled', this.setDisabledDirective);
        this.addDirective('if', this.setConditionalDirective);
        this.addDirective('model', this.setModelDirective);
    }

    _loadTemplate() {
        if (this._destroyed) {
            return;
        }

        const html = this._element.outerText || this._element.innerHTML;
        if (html.indexOf('{{') > -1 && this._element.childElementCount == 0) {
            this._loadBindTemplate();

            this._expression = new PiExpression(html);
            this._updateView();
        }
    }

    _loadBindTemplate() {
        if (this._foreachContext.enabled) {
            return;
        }

        const html = this._element.outerText || this._element.innerHTML;
        const variableName = html.replaceAll('{{', '').replaceAll('}}', '').trim();

        if (/^[a-zA-Z_$][\w_$.]+[\w_$]+$/gi.test(variableName)) {
            this._addContextWatch('context.' + variableName, () => {
                this._updateView();
            });
        }
    }

    _updateView() {
        if (this._destroyed) {
            return;
        }

        if (this._expression) {
            this._element.innerHTML = this._expression.parse(this._prepareContext(), this._getDefaultVariables());
        }
    }

    _updateStyle() {
        if (this._destroyed) {
            return;
        }

        if (this._expressionStyle) {
            const styleInline = this._expressionStyle.parse(this._prepareContext(), this._getDefaultVariables());
            const styles = styleInline.split(';');

            for (let i = 0; i < styles.length; i++) {
                const style = styles[i].split(':');
                if (style.length != 2) {
                    continue;
                }

                const styleName = style[0].trim();
                const styleValue = style[1].trim();

                this.$.css(styleName, styleValue);
            }
        }
    }

    _updateClass() {
        if (this._destroyed) {
            return;
        }

        if (this._expressionClass) {
            const classList = this._expressionClass.parse(this._prepareContext(), this._getDefaultVariables()).trim();
            if (classList == this._element.className) {
                return
            }

            this._element.className = '';
            this._element.classList.add(...classList.split(' '));
        }
    }

    _initDirectives() {
        if (this._destroyed) {
            return;
        }

        for (let i = 0; i < this._attrNames.length; i++) {
            const attrName = this._attrNames[i];
            const attrValue = this._element.getAttribute(attrName);
            const { name, prop, eventName } = this._extractAttributeNameAndProperty(attrName);

            if (this.existDirective(name)) {
                this._element.removeAttribute(attrName);
                this._directives[name].call(this, attrValue, prop, eventName, name);
                continue;
            }

            if (name == 'foreach') {
                return;
            }

            if (attrName.indexOf('#') == 0) {
                const ex = new PiExpression(attrValue);
                const value = ex.parse(this._prepareContext(), this._getDefaultVariables());
                if (value) {
                    this._element.setAttribute(attrName.substr(1), value);
                }

                this._element.removeAttribute(attrName);
            }
        }
    }

    _extractAttributeNameAndProperty(attribute) {
        let name = '';
        let prop = '';
        let eventName = false;

        if (attribute.indexOf('@') > -1) {
            name = 'on';
            prop = attribute.replace('@', '');
        } else if (attribute.indexOf(':') > -1) {
            name = attribute.replace(':', '');
            prop = false

            const nameAndEvent = name.split('.');
            if (nameAndEvent.length > 1) {
                name = nameAndEvent[0];
                eventName = nameAndEvent[1];
            }
        }

        if (prop == undefined) {
            prop = false;
        }

        return { name, prop, eventName };
    }

    _prepareContext() {
        this._injectForeachContext();
        return this._getContext();
    }

    _injectForeachContext() {
        PiObject.extend(this._scope.context, this._foreachContext);
    }

    _getContext() {
        return this._scope.context;
    }

    _clearContextWatch() {
        let ids = [];

        for (let i = 0; i < this._watchs.length; i++) {
            ids = ids.concat(this._watchs[i].ids);
        }

        PiObject.off(this._scope, ids);
        this._watchs = [];
    }

    _addContextWatch(property, fn) {
        const ids = PiObject.on(this._scope, property, fn)
        this._watchs = this._watchs.concat({
            property: property,
            ids: ids
        });

        return this;
    }

    // _getForeachProperty() {
    //     this._prepareContext();
    //     const array = this._foreachContext.array;
    //     const index = this._foreachContext.arrayIndex;
    //     return array[index];
    // }

    // _addBindToForeachContext(propertyName, eventName) {
    //     // se possuir uma subpropriedade então eh um array de objetos
    //     // caso contrário é um array de tipos primitivos
    //     if (propertyName.indexOf('.') > 0) {
    //         // array de objetos

    //         const object = this._getForeachProperty();

    //         if (object == undefined) {
    //             throw `PiElement: Propriedade definida ${propertyName} porém não existente no array informado do foreach`;
    //         }

    //         let isChangePropertyByEvent = false;
    //         const arrayOfProperties = propertyName.split('.');

    //         arrayOfProperties.splice(0, 1);
    //         propertyName = arrayOfProperties.join('.');

    //         PiObject.on(object, propertyName, () => {
    //             if (isChangePropertyByEvent) {
    //                 return;
    //             }

    //             const object = this._getForeachProperty();
    //             const value = PiObject.extractValue(object, propertyName);

    //             this._element.set(value);

    //             this._updateView();
    //         });

    //         if (eventName !== false) {
    //             this.listen(eventName, function () {
    //                 isChangePropertyByEvent = true;

    //                 const object = this._getForeachProperty();
    //                 PiObject.setProperty(object, propertyName, this.value);

    //                 isChangePropertyByEvent = false;
    //             });
    //         } else {
    //             this.listen('updated', function (e) {
    //                 isChangePropertyByEvent = true;

    //                 const object = this._getForeachProperty();
    //                 PiObject.setProperty(object, propertyName, e.detail);

    //                 isChangePropertyByEvent = false;
    //             });
    //         }

    //     } else {
    //         // array de tipos primitivos
    //         this._prepareContext();
    //         const array = this._foreachContext.array;
    //         const index = this._foreachContext.arrayIndex;
    //         let arrayValue = array[index];

    //         Object.defineProperty(array, index, {
    //             enumerable: false,
    //             configurable: true,
    //             set: (value) => {
    //                 arrayValue = value;
    //                 this._element.set(value);

    //                 this._updateView();
    //             },
    //             get: function () {
    //                 return arrayValue;
    //             }
    //         });

    //         if (eventName !== false) {
    //             this.listen(eventName, function () {
    //                 arrayValue = this.value;
    //             });
    //         } else {
    //             this.listen('updated', function (e) {
    //                 arrayValue = e.detail;
    //             });
    //         }
    //     }

    //     return this;
    // }
};/**
 * @class
 */
class PiComponent extends PiClass {
    event = new PiEvent();

    constructor(...args) {
        super(...args);

        this._tree = null;
        this._watchs = [];
        
        this._scope = {
            context: this
        };
    }

    /**
     * Injeta o modelo em todos os elementos de pagina com o atributo 'data-model'
     * Caso o parametro seja um json, seu valor será embutido no component
     * 
     * @param {PiModel} model - Modelo a ser injetado
     * @returns {PiComponent}
     */
    inject(model) {
        if (model instanceof PiModel) {
            const names = PiString.clips(this.element.innerHTML, 'data-model="', '"');
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                const element = this.element.querySelector('[data-model="' + name + '"]');
                const value = PiObject.extractValue(model, name);

                if (element._component) {
                    element._component.set(value);
                } else if (element.firstChild && element.firstChild._component) {
                    element.firstChild._component.set(value);
                } else {
                    element.set(value);
                }
            }
        } else {
            super.inject(model);
        }

        return this;
    }

    /**
     * Retorna o valor que representa o component
     * 
     * @returns {string}
     */
    get() {
        return '';
    }

    /**
     * Define um valor para o component
     * Dispara o evento 'change'
     * 
     * @returns {PiComponent}
     */
    set(value) {
        if (this.element == null) {
            return this;
        }

        this.dispatchEvent('change', value);

        return this;
    }

    /**
     * Dispara um evento nativo sobre o elemento
     * 
     * @param {string} eventName - Nome do evento
     * @param {Object} param - Objeto a ser passado pelo evento
     * @returns {PiComponent}
     */
    dispatchEvent(eventName, param) {
        this.element.dispatchEvent(new CustomEvent(eventName, {
            detail: param
        }));

        return this;
    }

    /**
     * Retorna wrapper jquery
     * 
     * @returns {jQueryElement}
     */
    get $element() {
        if (this._$element) return this._$element;
        return this._$element = $(this.element);
    }

    /**
     * Renderiza o elemento anexando ou inserindo no elemento
     * 
     * @param {Element} element - Elemento html onde o componente será renderizado
     * @param {boolean} append 
     * @returns {PiComponent}
     */
    render(element, append = false) {
        this.#setElement(element);

        this.viewWillLoad();
        this.viewLoad(append);
        this.viewDidLoad();

        return this;
    }

    viewWillLoad() {

    }

    viewLoad(append = false) {
        if (this.view) {
            this._tree = new PiTree(this.view, this._scope, this);
            this._tree
                .load()
                .render(this.element, !append);
            
            this.element._component = this;
        }
    }

    viewDidLoad() {

    }

    /**
     * Monitora alteração sobre propriedade 
     * 
     * @param {string} property - Nome da propriedade a ser monitorada
     * @param {function} fn - Função de callback
     * @returns {PiElement}
     */
     watch(property, fn) {
        const ids = PiObject.on(this._scope, 'context.' + property, fn)
        this._watchs = this._watchs.concat({
            property: property,
            ids: ids
        });

        return this;
    }

    /**
     * Para de monitorar uma proprieade do contexto
     * 
     * @param {string} property - Nome da propriedade
     * @returns {PiElement}
     */
    unWatch(property) {
        const arr = this._watchs;
        
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].property == property) {
                PiObject.off(this._scope, arr[i].ids);
                break;
            }            
        }

        return this;
    }

    destroy() {
        if (this._tree == null) {
            return;
        }

        // remove elementos no html
        const children = this._tree.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];

            child.parentNode.removeChild(child);
        }

        this.#clearContextWatch();

        // destroy velements
        if (this._tree) {
            this._tree.destroy();
            this._tree = null;
        }

        if (this._vtree) {
            this._vtree.destroy();
            this._vtree = null;
        }
    }

    #clearContextWatch() {
        let ids = [];

        for (let i = 0; i < this._watchs.length; i++) {
            ids = ids.concat(this._watchs[i].ids);
        }

        PiObject.off(this._scope, ids);
        this._watchs = [];
    }

    #setElement(element) {
        if (element == null) {
            throw `PiComponent: Element html de renderização não informado para o componente ${this.constructor.name}`;
        }

        if (element instanceof jQuery) {
            this.element = element[0];

            this._vtree = new PiVirtualTree(this.element, this)
            this._vtree.load(this._scope);
        } else {
            this.element = element;
        }

        this.#loadAttributes();
    }

    #loadAttributes() {
        const el = this.element;
        const attrs = el.getAttributeNames();

        for (let i = 0; i < attrs.length; i++) {
            let value = el.getAttribute(attrs[i]);

            if (PiType.isString(value) && (PiType.isObject(value) || PiType.isArray(value))) {
                value = JSON.parse(value);
            }

            this[attrs[i]] = value;
        }
    }
}/**
 * @class
 */
class PiDictionary {
    constructor() {
        this._list = [];
    }

    /**
     * Adiciona o par chave valor
     * 
     * @param {string} key - Chave
     * @param {string} value - Valor
     * @returns {PiDictionary}
     */
    add(key, value) {
        this._list[key] = value;

        return this;
    }

    /**
     * Verifica se existe a chave
     * 
     * @param {string} key - Chave
     * @returns {boolean}
     */
    existKey(key) {
        return this._list[key] != undefined;
    }

    /**
     * Verifica se existe o valor
     * 
     * @param {string} value - Valor
     * @returns {boolean}
     */
    existValue(value) {
        for (let i = this._list.length - 1; i >= 0; i--) {
            if (this._list[i] == value) return true;
        }

        return false;
    }

    /**
     * Retorna o valor
     * 
     * @param {string} key - Chave
     * @returns {string}
     */
    getValue(key) {
        return this._list[key];
    }

    /**
     * Remove a chave
     * 
     * @param {string} key - Chave
     * @returns {PiDictionary}
     */
    remove(key) {
        delete this._list[key];

        return this;
    }

    /**
     * Limpa o dicionario
     * 
     * @returns {PiDictionary}
     */
    clear() {
        this._list = [];

        return this;
    }

    /**
     * Convert o dicionario em array
     * 
     * @returns {array}
     */
    toArray() {
        return this._list;
    }

};/**
 * @class
 */
class PiAs {
    
    constructor() {
        this._alias = new PiDictionary();
    }

    /**
     * Adiciona a lista de parametros ao conjunto
     * 
     * @returns {boolean}
     */
    add() {
        if (arguments.length < 2) {
            console.log("PiAs: numero insulficiente de parametros");
            return false;
        }

        if (this._alias.existKey(arguments[0])) {
            console.log("PiAs: este apelido ja foi definido: " + arguments[0]);
            return false;
        }

        let value = "";
        for (let i = 1; i < arguments.length; i++) {
            let as = arguments[i];

            if (this._alias.existKey(as)) {
                value += this._alias.getValue(as);
            } else {
                value += as;
            }
        }

        this._alias.add(arguments[0], value);

        return true;
    }

    /**
     * Atualiza o conjunto
     * @returns {boolean}
     */
    update() {
        if (arguments.length < 2) {
            console.log("PiAs: numero insulficiente de parametros");
            return false;
        }

        if (this._alias.existKey(arguments[0])) {
            this.remove(arguments[0]);
            return false;
        }

        let value = "";
        for (let i = 1; i < arguments.length; i++) {
            let as = arguments[i];

            if (this._alias.existKey(as)) {
                value += this._alias.getValue(as);
            } else {
                value += as;
            }
        }

        this._alias.add(arguments[0], value);

        return true;
    }

    /**
     * Remove um item do conjunto
     * 
     * @param {string} as - Item
     * @returns {boolean}
     */
    remove(as) {
        this._alias.remove(as);

        return this;
    }

    /**
     * Retorna se existe o item no conjunto
     * 
     * @param {string} as 
     * @returns {boolean}
     */
    exist(as) {
        return this._alias.existKey(as);
    }

    /**
     * Retorna o valor do item
     * 
     * @param {strign} as 
     * @returns {object}
     */
    getValue(as) {
        let v = this._alias.getValue(as);

        if (this.exist(as) == false) {
            return null;
        } else if (this._alias.existKey(v)) {
            return this.getValue(v);
        } else {
            return v;
        }
    }

}/**
 * @class
 */
class PiValidator {
    constructor(label) {
        this._label = label;
        this._value = null;
        this._model = null;
        this._field = null;
    }

    /**
     * Carrega o modelo a propriedade e seu valor
     * 
     * @param {object} model - Modelo a ser validado
     * @param {string} field - Propriedade do modelo a ser validada
     * @param {object} value - Valor atribuido a propriedade
     * @returns {PiValidator}
     */
    load(model, field, value) {
        this._model = model;
        this._field = field;
        this._value = value;

        return this;
    }

    set label(label) {
        this._label = label;
    }

    get label() {
        return this._label;
    }
}

/**
 * @class
 */
class PiValidatorRequire extends PiValidator {

    /**
     * 
     * @param {string} label - Texto a ser exibido caso a regra seja válida
     */
    constructor(label) {
        super(label);
    }

    /**
     * Retorna se o valor é valido para a regra estabelecida
     * 
     * @returns {boolean}
     */
    isValid() {
        let v = this._value,
            t = PiType.typeof(v),
            b = true;

        if (t == "Boolean" && v === false) return false;
        if (t == 'String' && v.length == 0) b = false
        if (v == undefined) return false;
        if (v == false && v != 0) return false;
        else if (t == 'Array' && v.length == 0) b = false;
        else if (t == 'Object' && PiObject.isEmpty(v)) b = false;

        return b;
    }

}

class PiValidatorEmail extends PiValidator {
    constructor(label) {
        super(label)
    }

    isValid() {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this._value);
    }
}

/**
 * @class
 */
class PiValidatorCallback extends PiValidator {

    /**
     * 
     * @param {string} label - Texto que aparecerá na view caso a regra seja inválida
     * @param {function} callback - Callback para validar o valor
     */
    constructor(label, callback) {
        super(label);

        this._cb = callback;
    }


    /**
     * Retorna se o valor é valido para a regra estabelecida
     * 
     * @returns {boolean}
     */
    isValid() {
        return this._cb.call(this._model, this._value, this);
    }

}/**
 * @class
 */
class PiPromise extends PiClass {
    instances() {
        this._isOnce = false;

        this.clear();
    }

    /**
     * Espera até que todas as promises informadas por parametro
     * sejam resolvidas. Chama o callback de ok caso haja sucesso
     * em todos os retornos. Caso haja um erro retorna o callback de error
     * 
     * @returns {PiPromise}
     */
    static wait() {
        var promise = new PiPromise();
        var count = 0;
        var success = true;

        for (let i = 0; i < arguments.length; i++) {
            const arg = arguments[i];
            arg.done(() => {
                count++;
                if (count == arguments.length) {
                    success ? promise.callDone() : promise.callErr();
                }
            }).error(() => {
                success = false;
            });
        }

        return promise;
    }

    /**
     * Resolve a promise
     * 
     * @returns {PiPromise}
     */
    resolve() {
        this._argOk = arguments;

        this._callOk();
        this._callOnce();
        this._callDone();

        if (this._isOnce) {
            this.reset();
        }

        return this;
    }

    /**
     * Rejeita a promise
     * 
     * @returns {PiPromise}
     */
    reject() {
        this._argErr = arguments;

        this._callErr();
        this._callDone();

        if (this._isOnce) {
            this.reset();
        }

        return this;
    }

    /**
     * Adiciona callback disparado quando a promise for resolvida
     * 
     * @param {function} cb - Callback
     * @param {object} context - Objeto de contexto
     * @returns {PiPromise}
     */
    ok(cb, context) {
        this._cbOk.push({ cb: cb, context: context });

        if (this._isOk) {
            this._callOk();
        }

        return this;
    }

    /**
     * Adiciona callback disparado apenas uma vez quando a promise for resolvida
     * 
     * @param {function} cb - Callback
     * @param {object} context - Objeto de contexto
     * @returns {PiPromise}
     */
    once(cb, context) {
        this._cbOnce.push({ cb: cb, context: context });

        if (this._isOk) {
            this._callOnce();
        }

        return this;
    }

    /**
     * Adiciona callback disparado quando a promise for rejeitada
     * 
     * @param {function} cb - Callback
     * @param {object} context - Objeto de contexto
     * @returns {PiPromise}
     */
    error(cb, context) {
        this._cbErr.push({ cb: cb, context: context });

        if (this._isErr) {
            this._callErr();
        }

        return this;
    }

    /**
     * Adiciona callback disparado sempre que a promise é resolvida ou rejeitada
     * 
     * @param {function} cb - Callback
     * @param {object} context - Objeto de contexto
     * @returns {PiPromise}
     */
    done(cb, context) {
        this._cbDone.push({ cb: cb, context: context });

        if (this._isDone) {
            this._callDone();
        }

        return this;
    }

    /**
     * Limpa todos os callbacks
     * 
     * @returns {PiPromise}
     */
    reset() {
        this._cbOk = [];
        this._cbErr = [];
        this._cbDone = [];

        return this;
    }

    /**
     * Reseta todos os valores
     * 
     * @returns {PiPromise}
     */
    clear() {
        this._cbOk = [];
        this._cbErr = [];
        this._cbDone = [];
        this._cbOnce = [];

        this._isOk = false;
        this._isErr = false;
        this._isDone = false;

        this._argOk = [];
        this._argErr = [];

        return this;
    }

    _call(arr, args) {
        for (let i = arr.length - 1; i >= 0; i--) {
            arr[i].cb.apply(arr[i].context, args);
        }
    }

    _callOnce() {
        this._isOk = true;
        this._call(this._cbOnce, this._argOk);
        this._cbOnce = [];
    }

    _callOk() {
        this._isOk = true;
        this._call(this._cbOk, this._argOk);
    }

    _callErr() {
        this._isErr = true;
        this._call(this._cbErr, this._argErr);
    }

    _callDone() {
        this._isDone = true;
        this._call(this._cbDone, []);
    }
};/**
 * @class
 */
class PiUrl extends PiClass {
    init() {
        let arr = arguments,
            url = '';

        for (let i = 0; i < arr.length; i++) {
            let alias = arr[i];

            if (PiUrl.alias.exist(arr[i])) {
                alias = PiUrl.alias.getValue(arr[i]);
            }

            if (alias[0] == '/' && url[url.length - 1] == '/') {
                url += alias.substring(1);
            } else {
                url += alias;
            }

        }

        this.setUrl(url);
    }

    /**
     * Define a url
     * 
     * @param {string} url
     * @returns {PiUrl}
     */
    setUrl(url) {
        if (PiUrl.alias.exist(url)) {
            url = PiUrl.alias.getValue(url);
        }

        if (PiUrl.isValid(url)) this._url = url;

        return this;
    }

    /**
     * Obtem o scheme da url
     * 
     * @returns {string}
     */
    scheme() {
        let url = this.getUrl(),
            i = url.indexOf(':');

        if (i < 0) return '';
        return url.substr(0, i);
    }

    /**
     * Define ou obtem o host da url
     * 
     * @param {string} host
     * @returns {string}
     */
    host(host) {
        let url = this.getUrl(),
            h = this._parse(url, 'host');

        if (host === undefined) {
            return h;
        } else {
            this.setUrl(url.replace(h, host));
            return this;
        }
    }

    /**
     * Define ou obtem a porta da url
     * 
     * @param {string|int} port 
     * @returns {PiUrl|int}
     */
    port(port) {
        let url = this.getUrl(),
            p = this._parse(url, 'port') || '';

        if (PiType.isUndefined(port)) {
            return p;
        }

        let pt = this.port() || '',
            href = this.href();

        if (pt.length == 0) {
            url = url.replace(href, href + ':' + port);
        } else {
            url = url.replace(p, port);
        }

        this.setUrl(url);

        return this;
    }

    /**
     * Define ou obtem o href da url
     * 
     * @param {string} url - Href
     * @returns {PiUrl|string}
     */
    href(url) {
        let u = this.host(),
            h = u,
            s = this._parse(this.getUrl(), 'scheme');

        if (url === undefined) {
            let p = this.port();

            if (p.length == 0) p = '';
            else p = ':' + p;

            if (s.length > 0) {
                h = s + '://' + u + p;
            } else {
                h = u + p;
            }

            return h;
        }

        this.setUrl(url);

        return this;
    }

    /**
     * Define ou obtem o hash da url
     * 
     * @param {string} hash 
     * @returns {PiUrl|string}
     */
    hash(hash) {
        let url = this.getUrl(),
            hh = this._parse(url, 'hash');

        if (hash === undefined) {
            return hh;
        } else {

            if (hh.length == 0) {
                this.setUrl(url + '#' + hash);
            } else {
                this.setUrl(url.replace(hh, hash));
            }

            return this;
        }
    }

    /**
     * Anexa ao path da url o path informado
     * 
     * @param {string} path 
     * @returns {PiUrl}
     */
    appendPath(path) {
        let url = this.getUrl(),
            p = this._parse(url, 'path');

        if (PiUrl.alias.exist(path)) {
            path = PiUrl.alias.getValue(path);
        }

        if (url.substring(url.length - 1) != '/') url += '/';
        this.setUrl(url + path);
        return this;
    }

    /**
     * Define ou obtem o path da url
     * 
     * @param {string} path 
     * @returns {PiUrl|string}
     */
    path(path) {
        let url = this.getUrl(),
            p = this._parse(url, 'path'),
            pp = '/' + p;

        if (path === undefined) {
            return pp;
        }

        if (PiUrl.alias.exist(path)) {
            path = PiUrl.alias.getValue(path);
        }

        if (p.length == 0) {
            if (url.substring(url.length - 1) != '/' && path.charAt(0) != '/') url += '/' + path;
            else url += path;
        } else {
            url = url.replace(pp, path);
        }

        this.setUrl(url);

        return this;
    }

    /**
     * Define ou obtem o filename da url
     * 
     * @param {string} filename 
     * @returns {PiUrl|strin}
     */
    filename(filename) {
        let url = this.getUrl();

        if (filename === undefined) {
            return url.replace(/\\/g, '/').replace(/.*\//, '').replace(/\?.*/, '') || '';
        } else {
            let u = this.getUrl(),
                f = this.filename();

            this.setUrl(u.replace(f, filename));
            return this;
        }
    }

    /**
     * Define ou obtem a query string da url
     * 
     * @param {string} query 
     * @returns {PiUrl|string}
     */
    query(query) {
        let url = this.getUrl(),
            p = this._parse(url, 'query');

        if (query === undefined) {
            return p;
        } else {
            let q = this.query();
            this.setUrl(url.replace(q, query));
            return this;
        }
    }

    /**
     * Adiciona uma valor a query string
     * 
     * @param {string} key - Chave
     * @param {string} value - Valor
     * @returns {PiUrl}
     */
    addQuery(key, value) {
        let q = this.query(),
            url = this.getUrl(),
            qs = PiString.format('{1}={2}', url, key, encodeURIComponent(value));

        if (q.length == 0) {
            this.setUrl(url + '?' + qs);
        } else {
            this.setUrl(url + '&' + qs);
        }

        return this;
    }

    /**
     * Obtem um valor da query string pela sua chave
     * 
     * @param {string} key - Chave
     * @returns {string}
     */
    getQuery(key) {
        let qs = this.query().split('&');

        for (var i = 0; i < qs.length; i++) {
            let q = qs[i].split('=');
            if (q[0] == key) {
                return decodeURIComponent(q[1]);
            }
        }

        return '';
    }

    /**
     * Obtem o dirname da url
     * 
     * @returns {string}
     */
    dirname() {
        return this.getUrl().replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
    }

    /**
     * Retorna a url formatada
     * 
     * @returns {string}
     */
    getUrl() {
        // var m = this.options;

        // if (PiSubdomains.exist(m)) {
        //     var s = PiSubdomains.next(m);
        //     return PiString.format(this.url, s);
        // }

        return this._url || '';
    }

    /**
     * Alias to getUrl
     * 
     * @returns {strin}
     */
    toString() {
        return this.getUrl();
    }

    _parse(url, parte) {
        let p = { 'url': 0, 'scheme': 1, 'slash': 2, 'host': 3, 'port': 4, 'path': 5, 'query': 6, 'hash': 7 },
            pattern = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
            s = pattern.exec(url || '');

        if (s == null) return '';
        return s[p[parte]] || '';
    }

    /**
     * Verifica se a url informada é valida
     * 
     * @param {string} url 
     * @returns {boolean}
     */
    static isValid(url) {
        return /(http|https|)(:\/\/|)([\w-]+\.?)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(url || '');
    }

    /**
     * Adiciona a lista de parametros a url
     * 
     */
    static add() {
        PiUrl.alias.add.apply(PiUrl.alias, arguments);
    }

    /**
     * 
     * @param {string} name 
     * @returns {string}
     */
    static get(name) {
        return PiUrl.alias.getValue(name);
    }

    static to() {
        let arr = arguments,
            url = '';

        for (let i = 0; i < arguments.length; i++) {
            let alias = arr[i];

            if (PiUrl.alias.exist(arr[i])) {
                alias = PiUrl.alias.getValue(arr[i]);
            }

            if (alias[0] == '/' && url[url.length - 1] == '/') {
                url += alias.substring(1);
            } else {
                url += alias;
            }

        }

        PiEnv.location = url;
    }

    static query(query) {
        let q = PiUrl.create(PiEnv.location).query(),
            p = q.split('&');

        for (let i in p) {
            let pp = p[i].split('=');
            if (pp[0] == query) return pp[1];
        }
    }

};

PiUrl.alias = new PiAs();/**
 * @class
 */
class PiAction extends PiClass {
    constructor(options) {
        super(options)

        this._request = new PiRequest();
        this._promise = new PiPromise();

        this._load();
    }

    /**
     * Retorna a promise
     * 
     * @returns {PiPromise}
     */
    get promise() {
        return this._promise;
    }

    /**
     * Shadow method
     */
    invoke() {
        return this._callModelMethod.apply(this, arguments);
    }

    processErrorResponse() {
        this._promise.reject.apply(this._promise, arguments);
    }

    processSuccessResponse(data, paging) {
        const createModel = this.model.create;

        if (PiType.isArray(data)) {
            let arr = [];

            for (let i = 0; i < data.length; i++) {
                arr.push(this.model.create().initWithJson(data[i]));
            }

            data = arr;
        } else {
            data = this.model.create().initWithJson(data);
        }

        this._promise.resolve.call(this._promise, data, paging);
    }

    _load() {
        this._parseStmt(this.actionStmt);
        this._addModelMethod();
    }

    _addModelMethod() {
        var self = this;
        this.model[this.actionName] = function () {
            return self.invoke.apply(self, arguments);
        };
    }

    _callModelMethod(...args) {
        this._promise = new PiPromise();

        if (PiType.isObject(args[0])) {
            this.model.inject(args[0]);
        }

        if (this._method == 'GET') {
            this._createRequestGet.apply(this, args);
        }

        if (this._method == 'POST') {
            this._createRequestPost.apply(this, args);
        }

        return this._promise;
    }

    _createRequestGet(...args) {
        let url = this._createUrl(...args);

        if (this._request.isSending()) {
            this._request.abort();
        }

        this.model.requestWillGet(url);

        this._request.getJson(url)
            .then((...args) => {
                args.splice(0, 0, this);
                args.splice(1, 0, url);
                this.model.responseSuccessWillLoad.apply(this.model, args);
            })
            .catch((...args) => {
                args.splice(0, 0, this);
                args.splice(1, 0, url);
                this.model.responseErrorWillLoad.apply(this.model, args);
            });

        this.model.requestDidGet(url);
    }

    _createRequestPost(...args) {
        let url = this._createUrl(...args);
        let json = this.model.toJson();

        if (this._request.isSending()) {
            this._request.abort();
        }

        this.model.requestWillPost(json, url);
        this._request.postJson(url, json)
            .then((...args) => {
                args.splice(0, 0, this);
                args.splice(1, 0, url);
                this.model.responseSuccessWillLoad.apply(this.model, args);
            }).catch((...args) => {
                args.splice(0, 0, this);
                args.splice(1, 0, url);
                this.model.responseErrorWillLoad.apply(this.model, args);
            });

        this.model.requestDidPost(json, url);
    }

    _createUrl(...args) {
        let action = this._getAction(...args);
        let url = '';

        if (this.model._baseUrl instanceof PiUrl) {
            url = PiUrl.create(this.model._baseUrl).path(action);
        } else {
            url = PiUrl.create(this.model._baseUrl + action);
        }

        return url;
    }

    _getAction(...args) {
        let count = 0;

        return this._url.replace(/\:\w+[\(\w*\)]*/gi, (pattern) => {
            let property = pattern.substring(1);
            let modelValue = this.model[property] || '';

            if (args.length == 0) {
                return modelValue;
            } else {
                return (args[count++] || modelValue).toString();
            }
        });
    }

    _parseStmt(stmt) {
        let p = stmt.split(':/');

        if (p.length == 1) {
            this._url = '/' + p[0];
        } else {
            this._url = '/' + p[1];
        }

        if (stmt.toUpperCase().indexOf('GET') > -1) {
            this._method = 'GET';
        } else if (stmt.toUpperCase().indexOf('POST') > -1) {
            this._method = 'POST';
        } else if (this._url.indexOf('?') > -1) {
            this._method = 'GET';
        } else {
            this._method = 'POST';
        }
    }

};/**
 * @class
 */
class PiModel extends PiClass {
    instances() {
        this._actionList = [];
        this._validatorList = [];
        this._baseUrl = '';
    }

    /**
     * Initializa as rotas
     * 
     * @param {string} url - Url base utilizada pelas actions para as requests
     */
    init(url) {
        this._loadActions();
        this._loadValidations();

        this._configUrl(url || this.parameters.url);
    }

    /**
     * Injeta o json dentro da model
     * 
     * @param {object} json - Json a ser injetado no modelo
     * @returns {PiModel}
     */
    initWithJson(json) {
        this.inject(json);

        return this;
    }

    /**
     * Adiciona uma action
     * 
     * @param {string} name - Nome da rota
     * @param {string} stmt - Rota no formato: METHOD:/route?querystring
     * @returns {PiModel}
     */
    addAction(name, stmt) {
        const action = new PiAction({
            actionName: name,
            actionStmt: stmt,
            model: this
        });

        this._actionList[name] = action;

        return this;
    }

    /**
     * Adiciona uma regra de validação para uma propriedade da model
     * 
     * @param {string} name - Propriedade da model
     * @param {PiValidator} rule - Classe que implementa a regra de validação
     * @returns {PiModel}
     */
    addValidator(name, rule) {
        this._validatorList[name] = rule;

        return this;
    }

    /**
     * Retorna um objeto literal contendo todas as regras de validação
     * 
     * @returns {object}
     */
    validators() {
        return {};
    }

    /**
     * Retorna um objeto literal contendo todas as actions
     * 
     * @returns {object}
     */
    actions() {
        return {};
    }

    /**
     * Define um valor para uma propriedade.
     * Este método dispara a execução da validação 
     * de propriedade antes de inserir o valor
     * 
     * @param {string} key - Nome da propriedade
     * @param {object} value - Valor da propriedade
     * @returns {PiModel}
     */
    setProperty(key, value) {
        const names = key.split('.');
        let isComposed = names.length > 1,
            rule = this._validatorList[key];

        if (isComposed) {
            let last = names[names.length - 1],
                property = PiObject.extractPropertyContext(this, key);

            if (property instanceof PiModel) {
                property.setProperty(last, value);
            } else {
                property[last] = value;
            }

        } else {
            if (rule == undefined) {
                this[key] = value;
            } else {
                rule.load(this, key, value);

                if (rule.isValid()) {
                    this[key] = value;
                } else {
                    throw rule.label;
                }
            }
        }

        return this;
    }

    /**
     * Insere a model caso id seja zero ou atualiza a model 
     * caso o valor do id seja maior que zero
     * 
     * @returns {PiPromise}
     */
    save() {
        if (this.id == undefined) return this.insert()
        else if (this.id == 0) return this.insert();
        else return this.update();
    }

    /**
     * Retorna uma action pelo nome
     * 
     * @param {string} name - Nome da action
     * @returns {PiAction}
     */
    getAction(name) {
        return this._actionList[name];
    }

    /**
     * Tentar injetar os data-models do component na model caso o parametro seja um PiComponent.
     * Retorna em um array string com todos os erros encontrados.
     * Se o parametro for um json ele ira injetar as propriedades na model.
     * 
     * @param {PiComponent} component
     * @param {object} options 
     * @returns {array}
     */
    inject(component, options = {}) {
        if (component instanceof PiComponent || component instanceof PiApp) {
            let names = PiString.clips(component.element.innerHTML, 'data-model="', '"'),
                isComponent = false,
                errors = [];

            options = PiObject.extend({}, {
                invalidInputClass: 'invalid-feedback'
            }, options);

            for (let i = 0; i < names.length; i++) {
                let property = names[i],
                    element = component.element.querySelector('[data-model="' + property + '"]'),
                    value = undefined
                    parent = element.parentNode;

                if (element.firstChild && element.firstChild._component) {
                    value = element.firstChild._component.get();
                    isComponent = true;
                } else if (element._component) {
                    value = element._component.get();
                    isComponent = true;
                } else {
                    value = element.get();
                }

                var nextElement = element.nextElementSibling;
                var elementMessage = null;
                if (nextElement && nextElement.hasAttribute('validation-message')) {
                    elementMessage = nextElement;
                } else {
                    elementMessage = document.createElement('div');
                    elementMessage.setAttribute('validation-message', '');
                    parent.insertBefore(elementMessage, element.nextSibling);
                }
                
                if (element.setCustomValidity) {
                    element.setCustomValidity('');
                }
                
                elementMessage.style.display = 'none';
                elementMessage.innerHTML = '';
                elementMessage.classList.remove(options.invalidInputClass);
                parent.classList.remove('was-validated');

                try {
                    this.setProperty(property, value);
                } catch (msg) {
                    elementMessage.innerHTML = msg;
                    elementMessage.classList.add(options.invalidInputClass);
                    elementMessage.style.display = 'block';
                    
                    if (element.setCustomValidity) {
                        element.setCustomValidity(msg);
                    }

                    if (!isComponent) {
                        parent.classList.add('was-validated');
                    }

                    errors.push(msg);
                }
            }

            return errors;
        } else {
            if (component instanceof PiModel) {
                super.inject(component.toJson());
            } else {
                super.inject(component);
            }
        }

        return [];
    }

    requestWillGet(json) {

    }

    jsonDidConvert(json) {
        super.jsonDidConvert(json);

        delete json._baseUrl;
        delete json._actionList;
        delete json._validatorList;
    }

    requestDidGet(json) {

    }

    requestWillPost(json) {

    }

    requestDidPost(json) {

    }

    responseSuccessWillLoad(action, url, data) {
        this.responseSuccess.apply(this, arguments);
    }

    responseSuccess(action, url, ...args) {
        action.processSuccessResponse.apply(action, args);
        this.responseSuccessDidLoad.apply(this, arguments);
    }

    responseSuccessDidLoad() {

    }

    responseErrorWillLoad(action, url, data) {
        this.responseError.apply(this, arguments);
    }

    responseError(action, url, ...args) {
        action.processErrorResponse.apply(action, args);
        this.responseErrorDidLoad.apply(this, arguments);
    }

    responseErrorDidLoad() {

    }

    _loadActions() {
        const userActions = this.actions();
        const defaultActions = {
            'add': 'POST:/add',
            'insert': 'POST:/insert',
            'update': 'POST:/update',
            'remove': 'GET:/remove?id=:id',
            'get': 'GET:/get?id=:id',
            'find': 'GET:/find?id=:id',
            'all': 'GET:/all'
        };
        const actions = PiObject.extend({}, defaultActions, userActions);

        for (let name in actions) {
            this.addAction(name, actions[name]);
        }
    }

    _configUrl(url) {
        const modelUrl = PiConfig.get('model.url');

        if (modelUrl == undefined) {
            this._setBaseUrl(url);
        } else {
            this._setBaseUrl(modelUrl + url);
        }
    }

    _setBaseUrl(url) {
        if (url == undefined) {
            this._baseUrl = PiUrl.create('localhost').href();
        } else {
            this._baseUrl = url;
        }

        return this;
    }

    _loadValidations() {
        const validators = this.validators();
        for (var v in validators) {
            this.addValidator(v, validators[v]);
        }
    }
};/**
 * @class
 */
class PiEvent {
    #list = [];

    /**
     * Adiciona um evento para ser observado
     * 
     * @param {string} event - Nome do evento
     * @param {function} callback - Callback
     * @param {object} ctx - Contexto do callback
     * @param {boolean} once - Se o callback deverá ser chamado apenas uma vez
     * @returns {PiEvent}
     */
    listen(event, callback, ctx, once = false) {
        callback.id = PiRandom.uuid('xxx-xx');
        this.#list.push({ event: event, cb: callback, ctx: ctx, once: once });

        return this;
    }

    /**
     * Deixa de observar um evento
     * 
     * @param {string} event - Nome do evento
     * @param {function} cb - Callback
     * @returns {PiEvent}
     */
    unlisten(event, cb = '*') {
        for (let i = this.#list.length - 1; i >= 0; i--) {
            let item = this.#list[i];
            if (item.event == event) {
                if (cb == '*' || cb.id == item.cb.id) {
                    this.#list.splice(i, 1);
                    i--;
                }
            }
        }

        return this;
    }

    /**
     * Adiciona um evento para ser observado apenas uma vez
     * 
     * @param {string} event - Nome do evento
     * @param {function} callback - Callback
     * @param {object} ctx - Contexto do callback
     * @returns {PiEvent}
     */
    once(event, callback, ctx) {
        this.listen(event, callback, ctx, true);

        return this;
    }

    /**
     * Dispara os callback associados ao evento
     * 
     * @param {string} event - Nome do evento
     * @param  {...any} args - Parametros enviados ao callback do evento
     * @returns {PiEvent}
     */
    trigger(event, ...args) {
        let eventsOnce = [];

        for (let i = 0; i < this.#list.length; i++) {
            if (this.#list[i].event == event) {
                let item = this.#list[i];
                item.cb.apply(item.ctx, args);

                if (item.once) {
                    eventsOnce.push(item);
                }
            }
        }

        for (let i = eventsOnce.length - 1; i >= 0; i--) {
            this.unlisten(eventsOnce[i].event, eventsOnce[i].cb);
        }

        return this;
    }

    /**
     * Verifica se foi adicionado um evento
     * 
     * @param {string} event - Nome do evento
     * @returns {boolean}
     */
    exist(event) {
        for (let i = this.#list.length - 1; i >= 0; i--) {
            if (this.#list[i].event == event) return true;
        }

        return false;
    }

    /**
     * Remove todos os eventos
     * 
     * @returns {PiEvent}
     */
    clear() {
        this.#list = [];

        return this;
    }

};(function () {
    /**
     * @class
     */
    class PiHistory extends PiClass {
        #event = new PiEvent();

        /**
         * Adiciona um evento
         * 
         * @param {string} event - Nome do evento
         * @param {function} fn - Callback
         * @param {object} ctx - Contexto
         * @returns {PiHistory}
         */
        listen(event, fn, ctx) {
            this.#event.listen(event, fn, ctx);

            return this;
        }

        /**
         * 
         * @param {string} event - Nome do evento
         * @param {function} fn - Callback
         * @returns {PiHistory}
         */
        unlisten(event, fn) {
            this.#event.unlisten(event, fn);

            return this;
        }

        // reload(href) {
        //     this.#event.trigger('change', href);

        //     return this;
        // }

        /**
         * 
         * @param {string} href - Url a 
         * @param {string} title 
         * @returns {PiHistory}
         */
        // add(href, title) {
        //     if (href == null) return;

        //     try {
        //         if (PiConfig.get('history.prefixHashtag') === true) {
        //             PiUrlHash.to(`#${href}`);
        //         } else {
        //             history.pushState({
        //                 title: title,
        //                 href: href
        //             }, title, href);

        //             this.#event.trigger('change', href);
        //         }
        //     } catch (e) { }

        //     return this;
        // }

        // listen() {
        //     var popstate = Pi.getConfig('history.popstate');
        //     if (popstate == undefined || popstate == false) return;

        //     $('html').on('click', 'a', (e) => {
        //         try {
        //             var baseUrl = Pi.Url.create('localhost').getUrl();
        //             var el = e.currentTarget;
        //             var ignore = el.getAttribute('data-history-ignore');

        //             if (ignore == 'true') return;
        //             if (el.href.indexOf(baseUrl) < 0) return;

        //             var title = el.getAttribute('data-title') || document.title || '';
        //             var href = el.href.replace(baseUrl, '');

        //             this.add('#' + href.split('#')[1], title);
        //         } catch (e) {
        //             console.log(e);
        //         }

        //         return e.preventDefault();
        //     });

        //     PiEnv.global.onpopstate = () => {
        //         this.#event.trigger('change', Pi.Url.create(PiEnv.location).path());
        //     }
        // }
    }

    PiExport('PiHistory', new PiHistory());
})();/**
 * @class
 */
class PiUrlHash {
    static _callbacks = [];
    #hashId = 0;

    /**
     * Disparado sempre que a hash da url for alterada
     */
    hashDidChange() {

    }

    /**
     * Observa mudanças no hash da url
     * 
     * @returns {PiUrlHash}
     */
    listen() {
        this.#hashId = PiRandom.uuid('xxx-xxx');

        PiUrlHash._callbacks.push({
            id: this.#hashId,
            cb: () => {
                return this.hashDidChange(PiUrlHash.get());
            }
        });

        return this;
    }

    /**
     * Deixa de observar mudanças no hash da url
     * 
     * @returns {PiUrlHash}
     */
    unlisten() {
        const arr = PiUrlHash._callbacks;

        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            if (item.id == this.#hashId) {
                PiUrlHash._callbacks.splice(i, 1);
                return this;
            }

        }

        return this;
    }

    /**
     * Retorna o valor atual do hash da url
     * 
     * @returns {string}
     */
    static get() {
        let h = PiEnv.location.hash;
        h = h.length == 0 ? h : h.substr(1);

        return h;
    }

    /**
     * Define o valor do hash da url
     * 
     * @param {string} hash - Valor do hash
     */
    static to(hash) {
        let h = PiUrlHash.get();
        let q = h.indexOf('?');

        if (q > -1) {
            q = h.substr(q);
            h = h.substr(0, q);
        } else {
            q = '';
        }

        if ('!' + h == hash || '!' + hash == h) {
            return this;
        }

        if (q.length > 0) {
            hash += q;
        }

        PiEnv.location.hash = hash;
    }

    /**
     * Retorna o valor da query string no hash da url
     * 
     * @param {string} key - Chave da query string
     * @returns {string}
     */
    static getQueryString(key) {
        let h = PiUrlHash.get();
        let ps = h.split('?');

        if (ps.length < 2) return '';
        let kv = ps[1].split('&');
        for (let i = 0; i < kv.length; i++) {
            var k = kv[i].split('=');
            if (k[0] == key) return k[1];
        }

        return '';
    }

    /**
     * Remove um par chave-valor da query string do hash da url
     * 
     * @param {string} key - Chave da query string
     */
    static removeQueryString(key) {
        let h = PiUrlHash.get();
        let ps = h.split('?');
        let p = [];
        let map = [];

        if (ps.length > 1) {
            p = ps[1].split('&');
            for (let i = 0; i < p.length; i++) {
                if (p[i].length == 0) continue;

                let _ps = p[i].split('=');
                map[_ps[0]] = _ps[1];
            }
        }

        delete map[key];

        var arr = [];
        for (const key in map) {
            arr.push(`${key}=${map[key]}`);
        }

        PiEnv.location.hash = `${ps[0]}?${arr.join('&')}`;
    }

    /**
     * Adiciona um par chave-valor para a query string do hash da url
     * 
     * @param {string} key - Chave da query string
     * @param {string} value - Valor da query string
     */
    static addQueryString(key, value = '') {
        let h = PiUrlHash.get();
        let ps = h.split('?');
        let p = [];
        let map = [];

        if (ps.length > 1) {
            p = ps[1].split('&');
            for (let i = 0; i < p.length; i++) {
                if (p[i].length == 0) continue;

                let _ps = p[i].split('=');
                map[_ps[0]] = _ps[1];
            }
        }

        map[key] = value || '';
        var arr = [];
        for (const key in map) {
            arr.push(`${key}=${map[key]}`);
        }

        PiEnv.location.hash = `${ps[0]}?${arr.join('&')}`;
    }

    /**
     * Adiciona array de paths para o hash da url
     * 
     * @param  {...any} args - Array de paths
     */
    static add(...args) {
        let h = PiUrlHash.get();

        if (h.length > 0) {
            PiUrlHash.to(h + '/' + args.join('/'));
        } else {
            PiUrlHash.to(args.join('/'));
        }
    }

    /**
     * Remove do hash da url o valor informado
     * 
     * @param {string} str - String a ser removida
     * @returns {PiUrlhash}
     */
    static remove(str) {
        PiEnv.location.hash = PiEnv.location.hash.replace(str, '');

        return this;
    }

};

PiEnv.global.onhashchange = function () {
    const arr = PiUrlHash._callbacks;
    let totalRouteNotFound = 0;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].cb() == false) {
            totalRouteNotFound++;
        }
    }

    if (totalRouteNotFound == arr.length) {
        if (PiType.isFunction(app.service.routes['default'])) {
            app.service.routes['default']();
        }
    }
};/**
 * @class
 */
class PiRoute extends PiUrlHash {
    #routes = [];
    #isRouteFound = false;

    /**
     * Adiciona um array de callback para rotas
     * 
     * @param {array} routes - Array de callbacks para as rotas
     * @param {object} ctx - Contexto dos callbacks
     */
    add(routes, ctx) {
        this.#routes = [];

        for (let route in routes) {
            this.#addRoute(route, routes[route], ctx);
        }

        return this;
    }

    get isRouteFound() {
        return this.#isRouteFound;
    }

    // /**
    //  * Observa mudança no hash da url
    //  * 
    //  * @returns {PiRoute}
    //  */
    // listen() {
    //     PiHistory.listen('change', this.hashDidChange, this);

    //     return this;
    // }

    // /**
    //  * Deixa de observar a mudança no hash da url
    //  * 
    //  * @returns {PiRoute}
    //  */
    // unlisten() {
    //     PiHistory.ulisten('change', this.hashDidChange);

    //     return this;
    // }

    /**
     * Remove uma função de rota
     * 
     * @param {function} route - Função de rota
     * @returns {PiRoute}
     */
    remove(route) {
        for (let i = this.#routes.length - 1; i >= 0; i--) {
            if (this.#routes[i].name = route) {
                this.#routes[i].splice(i, 1);
                i--;
            }
        }

        return this;
    }

    /**
     * Dispara o função de rota
     * 
     * @param {string} hash
     * @returns {PiRoute}
     */
    trigger(hash) {
        this.hashDidChange(hash);

        return this;
    }

    hashDidChange(hash) {
        var hash = this.#removeQueryString(hash);
        var isRouteFound = false;

        for (let i = 0; i < this.#routes.length; i++) {
            let route = this.#routes[i],
                regex = new RegExp(route.pattern, 'mgi'),
                matchs = hash.match(regex);

            if (matchs == null) continue;

            let patchs = route.name.split('/'),
                parameters = [],
                variables = [];

            for (let j = 0; j < patchs.length; j++) {
                if (patchs[j][0] == ':') {
                    variables.push(j);
                }
            }

            patchs = hash.split('/');
            for (let j = 0; j < variables.length; j++) {
                parameters.push(patchs[variables[j]]);
            }

            route.cb.apply(route.ctx, parameters);
            isRouteFound = true;
            break;
        }

        this.#isRouteFound = isRouteFound;

        if (!isRouteFound) {
            // this.#triggerRouteNotFound();
            return false;
        }

        return true;
    }

    #triggerRouteNotFound() {
        for (let i = 0; i < this.#routes.length; i++) {
            const route = this.#routes[i];
            if (route.name == 'default') {
                route.cb.apply(route.ctx);
            }
        }
    }

    #addRoute(route, callback, ctx) {
        this.#routes.push({ name: route, cb: callback, ctx: ctx, pattern: route.replace(/\:(\w*)/gi, "([^&/#?]*)") });

        return this;
    }

    #removeQueryString(hash) {
        let p = hash.split('?');
        return p[0];
    }

}/**
 * @class
 */
class PiService extends PiClass {
    #_route = new PiRoute();

    init(routes = []){
        this.routes = routes;
    }

    start() {
        this.#_route.add(this.routes, this);
        this.#_route.trigger(PiUrlHash.get());
        this.#_route.listen();
    }

    stop() {
        this.#_route.unlisten();
    }

    get isRouteFound() {
        return this.#_route.isRouteFound;
    }
}(function () {
    /**
     * @class
     */
    class PiInitialize {
        #readyFn = [];
        #bootFn = [];
        #bootInit = [];
        #bootStart = [];
        #isLoaded = false;

        /**
         * 
         * @param {function} fn - Função que será executada no inicio do boot
         * 
         * @returns {PiInitialize}
         */
        boot(fn) {
            this.#bootFn.unshift(fn);

            return this;
        }

        /**
         * Função executada apos o boot
         * 
         * @param {function} fn - Callback
         * @returns {PiInitialize}
         */
        init(fn) {
            this.#bootInit.unshift(fn);

            return this;
        }

        /**
         * Função executada após a inicialização
         * @param {function} fn - Callback
         * @returns {PiInitialize}
         */
        start(fn) {
            this.#bootStart.unshift(fn);

            return this;
        }

        /**
         * Executa a sequencia de incialização: boot -> callback -> ready
         * 
         * @param {function} fn - Função que será executada após o boot
         * @returns {PiInitialize}
         */
        load(fn = PiFunction.noop) {
            $(() => {
                this.#dispatch(this.#bootFn);
                this.#dispatch(this.#bootInit);
                this.#dispatch(this.#bootStart);
                this.#dispatch(this.#readyFn);

                console.log(';)')
                this.#isLoaded = true;
            });

            return this;
        }

        /**
         * Função executada após todo processo de inicialização
         * 
         * @param {function} fn - Função que será executada depois que o sistema estiver inicializado
         * @returns {PiInitialize}
         */
        ready(fn) {
            if (this.#isLoaded) {
                fn();
                return;
            }

            this.#readyFn.unshift(fn);

            return this;
        }

        #dispatch(arr) {
            for (let i = 0; i < arr.length; i++) {
                arr[i]();
            }
        }
    }

    const pinit = new PiInitialize();
    
    PiExport('PiInitialize', pinit);
    PiExport('PiInit', pinit);
})();/**
 * @class
 */
class PiApp extends PiClass {
    #_services = [];
    services = [];
    routes = [];

    instances() {
        this._scope = {
            context: this
        };
    }

    /**
     * Carrega serviços
     * 
     * @param {array} services - Array das urls dos servicos
     * @returns {PiApp}
     */
    loadServices(services) {
        this.service = new PiService(this.routes);
        this.services = services;

        this._downloadServices(services, () => {
            this.servicesWillStart();
            this.servicesStart();
            this.servicesDidStart();
        });
    }

    /**
     * Cria todos os serviços baseado no nome do arquivo do servico na url
     */
    servicesWillStart() {
        this.#createServices();
    }

    /**
     * Inicia todos os serviços
     */
    servicesStart() {
        const services = this.#_services;
        let totalRouteNotFound = 0;

        for (let i = 0; i < services.length; i++) {
            const service = services[i];
            service.start();

            if (!service.isRouteFound) {
                totalRouteNotFound++;
            }
        }

        this.service.start();
        if (!this.service.isRouteFound) {
            totalRouteNotFound++;
        }

        if (totalRouteNotFound == services.length + 1) {
            if (PiType.isFunction(this.service.routes['default'])) {
                this.service.routes['default']();
            }
        }
    }

    /**
     * Função chamada após todos os serviços serem iniciados
     */
    servicesDidStart() {

    }

    render(component) {

        return this;
    }

    #createServices() {
        const services = this.services;
        for (let i = 0; i < services.length; i++) {
            let serviceUrl = services[i];

            if (serviceUrl instanceof PiUrl) {
                serviceUrl = serviceUrl.toString();
            }

            const filename = PiFile.filename(serviceUrl);
            const serviceName = filename;
            // const serviceName = PiString.capital(filename);

            try {
                const service = new PiEnv.global[serviceName]();
                this.#_services.push(service);
            } catch (error) {
                console.error(`PiApp: Service not found ${serviceName}`)
            }
        }
    }

    _downloadServices(services, fn) {
        yum.download(services, fn);
    }

    setElementRoot(element) {
        this.element = $(element).get(0)
        PiConfig.set('app.parse.selector', element);
    }

    setPage(page) {
        if (this.page) {
            // this.page.destroy();
        }

        page.render(this.$element);

        this.page = page;
    }

}/**
 * @class
 */
class PiBoot extends PiClass {

    load() {
        if (PiConfig.get('app.parse.enable')) {
            this.#createVirtualTree();
        }
    }

    runApp() {
        if (PiEnv.global.App == undefined) {
            PiExport('app', new PiApp());
        } else {
            PiExport('app', new App());
        }
    }

    loadServices() {
        const appServices = app.services || [];
        const configServices = PiConfig.get('services') || [];
        const services = appServices.concat(configServices);

        app.loadServices(services);
    }

    #createVirtualTree() {
        const element = document.querySelector(PiConfig.get('app.parse.selector'));
        if (element == null) {
            throw `PiBoot: Não foi possível encontrar o elemento pelo seletor informado ${PiConfig.get('app.parse.selector')}`;
        }
        
        const vtree = new PiTree(element.innerHTML, app._scope, app);
        vtree.load().render(element, true);

        app.element = element;
        app.$element = $(element);
    }
};

const boot = new PiBoot();
PiUrl.add('localhost', PiUrl.create(PiEnv.location.toString()).href());

PiInitialize
    .init(() => {
        boot.runApp();
    })
    .start(() => {
        boot.loadServices();
        boot.load();
    })
    .load();


HTMLElement.prototype.get = function () {
    if (this instanceof HTMLImageElement) {
        return this.getAttribute('src');
    }

    if (this instanceof HTMLLinkElement) {
        return this.getAttribute('href');
    }

    if (this instanceof HTMLInputElement && this.type == 'checkbox') {
        return this.checked;
    }

    if (this instanceof HTMLInputElement && this.type == 'radio') {
        return this.checked;
    }

    return this.value;
};

HTMLElement.prototype.set = function (v) {
    if (this instanceof HTMLImageElement) {
        this.setAttribute('src', v);
        return;
    }

    if (this instanceof HTMLLinkElement) {
        this.setAttribute('href', v);
        return;
    }

    if (this instanceof HTMLInputElement && this.type == 'checkbox') {
        this.checked = v;
        return;
    }

    if (this instanceof HTMLInputElement && this.type == 'radio') {
        this.checked = v;
        return;
    }

    this.value = v;
};