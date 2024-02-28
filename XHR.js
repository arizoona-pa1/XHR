const http = {
    username: undefined,
    password: undefined,
    url: undefined,
    data: undefined,
    async: true,
    method: undefined,
    javascripts: [],
    scripts: [],
    message: undefined,
    document: undefined,
    status: undefined,
    statusText: undefined,
    response: undefined,
    responseText: undefined,
    responseType: "text",
    responseXML: undefined,
    responseURL: undefined,
    scriptPath: "javascript",
    scriptType: undefined,
    parentElement: undefined,
    errorURLpage: undefined,
    //  parentElement_reaction only display url. dont show error 
    parentElement_reaction: false,
    elementEventListener: undefined,
    __construct: function (value) {
        this.username = value?.username;
        this.password = value?.password;
        this.url = value?.url;
        this.data = value?.data;
        this.async = value?.async ?? true;
        this.method = value?.method;
        this.parentElement = value?.parentElement;
        this.parentElement_reaction = value?.parentElement_reaction ?? false;
        this.responseType = value?.responseType;
        this.elementEventListener = value?.elementEventListener;
        this.errorURLpage = value?.errorURLpage;
        if (value?.scriptPath) {
            this.scriptPath = value.scriptPath;
        }
        if (Array.isArray(value.scripts)) {
            this.scripts = value.scripts;
        }
        // if (this.data) {
        //     this.sortData();
        // }
    },
    // --####--
    sortData: function () {
        var dataKeys = Object.keys(this.data);
        var dataValues = Object.values(this.data);
        let EntriesData = "";
        for (let i = 0; i < dataKeys.length; i++) {
            EntriesData += dataKeys[i] + "=" + dataValues[i];
            if (i == dataKeys.length - 1) {
                break;
            }
            EntriesData += "&";
        }
        this.data = EntriesData;
    },
    isRequire: function (...args) {
        let isUndefined = false;
        args.forEach((arg) => {

            if (arg.value === undefined || arg.value === null || arg.value === '') {
                switch (arg.name) {
                    case 'url':
                        if (this.parentElement != undefined) {
                            // jump through isRequire method
                            this.url = this.errorURLpage?.['404'] ?? 'error/404.php';
                        } else {
                            console.log(arg.name + " is required");
                            isUndefined = true;
                        }
                        break;
                    default:
                        console.log(arg.name + " is required");
                        isUndefined = true;
                }
            }
        });
        return isUndefined;
    },
    // --####--
    asyncFetch: async function (value = undefined) {
        return await this.fetch(value);
    },
    fetch: function (value = undefined) {
        this.__construct(value);
        let isRequireReturn = this.isRequire(
            { name: "url", value: this.url },
            { name: "method", value: this.method }
        );
        if (isRequireReturn) {
            return;
        }
        return new Promise((resolve, reject) => {
            var xhr = new XMLHttpRequest();

            if (this.responseType) {
                xhr.responseType = this.responseType;
            }
            xhr.onreadystatechange = function () {
                if (xhr.status == 200 && xhr.readyState == 4) {
                    if (this.responseType == "text") {
                        var responseText = xhr.responseText;
                    } else {
                        var responseText = "responseType is not TEXT";
                    }

                    if (this.responseType == "document") {
                        var responseXML = xhr.responseXML;
                    } else {
                        var responseText = "responseType is not Document";
                    }

                    resolve({
                        statusText: xhr.statusText,
                        status: xhr.status,
                        response: xhr.response,
                        responseText: responseText,
                        responseXML: responseXML,
                        responseURL: xhr.responseURL
                    });
                }
            }

            if (this.username == undefined) {
                xhr.open(this.method, this.url, this.async);
            } else {
                xhr.open(this.method, this.url, this.async, this.username, this.password);
            }
            xhr.onloadstart = () => {
                this.dispatchEvent(this.elementEventListener, this.loadstart);
                // loading must be start :)
                console.log('loading is started');
            }
            xhr.onprogress = (event) => {
                var loaded = event.loaded;
                var total = event.total;
                percentageCompleted = (loaded / total) * 100;
                console.log(Math.floor(percentageCompleted));
                this.dispatchEvent(this.elementEventListener, this.progress);
            }
            xhr.ontimeout = () => {
                //  something should be throw Error here
                // example throw Error Disconnect  DOMException
                this.dispatchEvent(this.elementEventListener, this.timeout);
            }
            xhr.onerror = () => {
                console.error('an error occurred during the transaction');
                this.dispatchEvent(this.elementEventListener, this.error);
            }
            xhr.onloadend = () => {
                // loading is ended
                console.log('loading is ended');
                // console.log(this.responseText);
                if (xhr.status == 404) {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
                this.dispatchEvent(this.elementEventListener, this.loadend);
            }
            xhr.onload = () => {
                // loading is ended
                console.log('loading is ended');
                // console.log(this.responseText);
                this.dispatchEvent(this.elementEventListener, this.load);
            }

            xhr.send(this.data);

        }).then(
            result => {
                console.log("i'm here");
                console.log(result.statusText);

                this.statusText = result.statusText;
                this.status = result.status;
                this.response = result.response;
                this.responseText = result.responseText;
                this.responseXML = result.responseXML;
                this.responseURL = result.responseURL;
                if (typeof value.success === "function") {
                    // safe to use the function
                    value.success(this);
                }
            },
            error => {
                this.statusText = error.statusText;
                this.status = error.status;
                if (this.errorURLpage?.[404] && this.parentElement) {
                    this.loadDocument({
                        method: "GET",
                        url: '',
                        parentElement: this.parentElement,
                        errorURLpage: this.errorURLpage
                    });
                    // console.log('done');
                }
                if (typeof value.success === "function") {
                    // safe to use the function
                    value.error(this);
                }
            }
        )
    },
    // --####--
    loadDocument: async function (value = undefined) {
        let isRequireReturn = this.isRequire(
            { name: "parentElement", value: value.parentElement }
        );
        if (isRequireReturn) {
            return;
        }
        await this.fetch(value);

        if (this.parentElement_reaction) {
            if (this.status == 200) {
                console.log("Document only shoooooooooooo");
                this.parentElement.innerHTML = this.response;
            }
        } else {
            this.parentElement.innerHTML = this.response;
        }
        this.appendScript();
    },
    // --####--

    appendScript: function () {
        if (!this.scripts) {
            return;
        }
        this.scripts.forEach((script) => {
            let scriptExists = document.querySelectorAll(`[src="${this.scriptPath}/${script}"]`);
            // replace tag script js on Document (similar)
            scriptExists.forEach((exists) => {
                exists.remove();
            });
        });
        this.loadScript(this.loadScriptCompleted);
    },
    // --####--

    loadScriptCompleted: function () {
        console.log('Uploaded script has be successfull');
    },
    // --####--
    detectScriptType: function (script) {
        let Return = undefined;
        patterns = [
            ["/.js/i", "text/javascript"]
        ];
        patterns.forEach((pattern) => {
            Return = script.match(pattern[0]);
            if (Return) {
                this.scriptType = pattern[1];
            }
            return Return;
        })
    },
    loadScript: function (callback) {
        // Adding the script tag to the head as suggested before
        return new Promise((resolve, reject) => {
            var body = document.body;
            this.scripts.forEach((script) => {
                var DOMscript = document.createElement('script');
                if (this.scriptType = this.detectScriptType(script)) {
                    DOMscript.type = this.scriptType;
                }
                DOMscript.src = `${this.scriptPath}/${script}`;

                // Then bind the event to the callback function.
                // There are several events for cross browser compatibility.
                // script.onreadystatechange = callback;
                DOMscript.onload = () => resolve(callback);;
                DOMscript.onerror = () => reject(new Error(`Script load error for ${DOMscript.src}`));
                console.log(DOMscript);
                // Fire the loading
                body.appendChild(DOMscript);
            });
        });
    },
    dispatchEvent(element, name) {
        if (element != undefined) {
            element.dispatchEvent(name);
        }
    },
    error: new CustomEvent('error', {
        detail: {
            message: 'error occurs on fetch data!'
        },
        cancelable: true
    }),
    timeout: new CustomEvent('timeout', {
        detail: {
            message: 'timeout occurs on fetch data!'
        },
        cancelable: true
    }),
    progress: new CustomEvent('progress', {
        detail: {
            message: 'We \'re still in progress'
        },
        cancelable: true
    }),
    loadstart: new CustomEvent('loadstart', {
        detail: {
            message: 'We start your fetch data'
        },
        cancelable: true
    }),
    loadend: new CustomEvent('loadend', {
        detail: {
            message: 'We done your fetch data'
        },
        cancelable: true
    }),
    load: new CustomEvent('load', {
        detail: {
            message: 'We successfully get your fetch data'
        },
        cancelable: true
    }),

};
