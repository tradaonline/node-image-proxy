const config = require('../config');
const debug = require('debug')('libs:Permissionchecker');

class PermissionChecker {

  static get allowTargetHosts() {
    return config.permission.allowTargetHosts;
  }

  static get allowReferrers() {
    return config.permission.allowReferrers;
  }

  static get allowOptions() {
    return config.permission.allowOptions;
  }

  static get allowMimetypes() {
    return config.permission.allowMimetypes;
  }

  static get allowComplex() {
    return config.permission.allowComplex;
  }

  static get allowMaxContentLength() {
    return config.permission.allowMaxContentLength;
  }


  static isAllowTargetHosts(hostname) {

    if (!config.permission) true;

    if (config.permission.allowTargetHosts.length !== 0) {
      if (config.permission.allowTargetHosts.indexOf(hostname) < 0) {
        debug('not allowed host, see config.permission.allowTargetHosts');
        return false;
      }
    }
    return true;
  }

  static isAllowReferrers(referrer) {

    if (!config.permission) true;

    if (config.permission.allowReferrers.length !== 0) {
      if (config.permission.allowReferrers.indexOf(referrer) < 0) {
        debug('not allowed referrer, see config.permission.allowReferrers');
        return false;
      }
    }
    return true;
  }

  static isAllowOptions(options) {

    if (!config.permission) true;

    if (options.length < 2) {
      debug('not allowed. option is required.');
      return false;
    }

    for (let option of options.split(',')) {

      let whVal, width, height, angle;

      switch (true) {

        // resize
        case /wh[0-9]+/.test(option):
          whVal = +option.match(/[0-9]+/);
          if ( config.permission.allowOptions.wh.length !== 0 ) {
            if (config.permission.allowOptions.wh.indexOf(whVal) < 0) {
              debug('not allowed allowOptions.wh, see config.permission.allowOptions.wh');
              return false;
            }
          }
          break;
        case /w[0-9]+/.test(option):
          width = +option.match(/[0-9]+/);
          if (config.permission.allowOptions.w.length !== 0) {
            if (config.permission.allowOptions.w.indexOf(width) < 0) {
              debug('not allowed allowOptions.w, see config.permission.allowOptions.w');
              return false;
            }
          }
          break;
        case /h[0-9]+/.test(option):
          height = +option.match(/[0-9]+/);
          if (config.permission.allowOptions.h.length !== 0) {
            if (config.permission.allowOptions.h.indexOf(height) < 0) {
              debug('not allowed allowOptions.h, see config.permission.allowOptions.h');
              return false;
            }
          }
          break;
        // rotate
        case /r[0-9]+/.test(option):
          angle = +option.match(/[0-9]+/);
          if (config.permission.allowOptions.r.length !== 0) {
            if (config.permission.allowOptions.r.indexOf(angle) < 0) {
              debug('not allowed allowOptions.r, see config.permission.allowOptions.r');
              return false;
            }
          }
          break;
        // output
        case /(jpeg|png|webp|jpg)/.test(option):
          if (option === 'jpg') option = 'jpeg';
          if (config.permission.allowOptions.format.length !== 0) {
            if (config.permission.allowOptions.format.indexOf(option) < 0) {
              debug('not allowed allowOptions.format, see config.permission.allowOptions.format');
              return false;
            }
          }
          break;
        case /(grey|greyscale|gray|grayscale)/.test(option):
          if (config.permission.allowOptions.others.length !== 0) {
            if (config.permission.allowOptions.others.indexOf(option) < 0) {
              debug('not allowed allowOptions.others, see config.permission.allowOptions.others');
              return false;
            }
          }
          break;
        case /(flip|flop)/.test(option):
          if (config.permission.allowOptions.others.length !== 0) {
            if (config.permission.allowOptions.others.indexOf(option) < 0) {
              debug('not allowed allowOptions.others, see config.permission.allowOptions.others');
              return false;
            }
          }
          break;
        default:
          debug('not supported option');
          console.error ('not supported option');
          return false;
      }
    }

      return true;
  }

  static isAllowMimetypes(contentType) {

    if (!config.permission) true;

    if (config.permission.allowMimetypes.indexOf(contentType) < 0) {
      debug('not allowed mimetypes, see config.permission.allowMimetypes');
      return false;
    }
    return true;
  }

  static isAllowComplex(option) {

    if (!config.permission) true;

    if(config.permission.allowComplex.length !== 0) {
      if (config.permission.allowComplex.indexOf(option) < 0) {
        debug('not allowed allowComplex, see config.permission.allowComplex');
        return false;
      }
    }

    return true;
  }

  static isAllowMaxContentLength(contentLength) {

    if (!config.permission) true;

    if (contentLength > config.permission.allowMaxContentLength) {
      debug('overflowed contentLength, see config.permission.allowMaxContentLength');
      return false;
    }

    return true;
  }

}

module.exports = PermissionChecker;