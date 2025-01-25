import AskmeLibrary from './askme-library'
window.initAskmeBot = function (config) {
    console.log('config = ' + JSON.stringify(config))
    return new AskmeLibrary(config);
};