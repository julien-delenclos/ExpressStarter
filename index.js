"use strict";

var _express = _interopRequireDefault(require("express"));

var _path = _interopRequireDefault(require("path"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cluster = _interopRequireDefault(require("cluster"));

var _os = _interopRequireDefault(require("os"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** ExpressApp Class to create and start an Express Application */
var ExpressApp =
/**
 * Constructor
 * @param {{
 *     title: string,
 *     version: string,
 *     port: number,
 *     logger: {
 *         write: (message?: any, ...optionalParams: any[]): void,
 *         info: (message?: any, ...optionalParams: any[]): void,
 *         error: (message?: any, ...optionalParams: any[]): void,
 *         debug: (message?: any, ...optionalParams: any[]): void,
 *         warn: (message?: any, ...optionalParams: any[]): void
 *     };
 *     routes: (app: express): void,
 *     publicDirectory: string
 * }} config 
 */
function ExpressApp(config) {
  var _this = this;

  _classCallCheck(this, ExpressApp);

  this.config = {
    title: 'ExpressApp',
    version: '',
    port: 3000,
    logger: _objectSpread({}, console, {
      write: console.log
    }),
    routes: undefined,
    publicDirectory: 'public'
  };

  this.start = function () {
    if (process.env.NODE_ENV === 'development') {
      _this.workerTask();

      _this.masterTask();
    } else {
      if (_cluster["default"].isMaster) {
        var started = 0;
        Array(_os["default"].cpus().length).fill().forEach(function () {
          return _cluster["default"].fork();
        });

        _cluster["default"].on('exit', function (worker) {
          return _this.config.logger.info("Module #".concat(worker.id, " has exitted."));
        });

        _cluster["default"].on('online', function (worker) {
          return _this.config.logger.info("Start module #".concat(worker.id));
        });

        _cluster["default"].on('listening', function (worker, address) {
          _this.config.logger.info("Module #".concat(worker.id, " started and listening on port ").concat(address.port));

          if (++started == _os["default"].cpus().length) {
            _this.masterTask();
          }
        });
      } else {
        _this.workerTask();
      }
    }
  };

  this.masterTask = function () {
    _this.config.logger.info("".concat(_this.config.title, " ").concat(_this.config.version, " started"));

    _this.config.logger.info("URL : http://localhost:".concat(_this.config.port));
  };

  this.workerTask = function () {
    var app = (0, _express["default"])();
    app.use(_express["default"].json(), _express["default"].urlencoded({
      extended: false
    }), _express["default"]["static"](_path["default"].join(__dirname, _this.config.publicDirectory)), (0, _cookieParser["default"])(), (0, _morgan["default"])('tiny', {
      stream: _this.config.logger
    }), function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', '*');
      next();
    });

    _this.config.routes(app);

    var server = app.listen(process.env.PORT || _this.config.port);
    server.setTimeout(500000);
  };

  Object.assign(this.config, config);
};

module.exports = ExpressApp;
//# sourceMappingURL=index.js.map