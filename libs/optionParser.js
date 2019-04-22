let defaultOptions = {};

const setResize = ({width, height}) => {

  defaultOptions.resize = defaultOptions.resize ? defaultOptions.resize : {};
  defaultOptions.resize.width = width;
  defaultOptions.resize.height = height;

};

const setRotate = (angle) => {

  defaultOptions.rotate = angle;

};


//  w200        - 200 pixels wide, auto-scaled height
//  h100        - 100 pixels high, auto-scaled width
// 	w200,h300   - 200 pixels wide and 300 pixels high image
// 	wh100       - 100 pixels wide and 100 pixels high image
// 	w100,r90    - 100 pixels wide, rotated 90 degrees
// 	w200,png    - 200 pixels wide, converted to PNG format
// 	w200,jpg    - 200 pixels wide, converted to JPEG format
// 	w200,webp   - 200 pixels wide, converted to WEBP format
// 	w200,grey   - 200 pixels wide, converted to 8-bit greyscale; 256 shades of grey
//  w200,flip   - 200 pixels wide, flip the image about the vertical Y axis.
//  w200,flop   - 200 pixels wide, flop the image about the horizontal X axis.
const parseOption = (options) => {

  defaultOptions = {};

  if (options.length < 2) {
    return defaultOptions;
  }

  for (let option of options.split(',')) {

    let whVal, width, height, angle;

    switch (true) {

      // resize
      case /wh[0-9]+/.test(option):
        whVal = +option.match(/[0-9]+/);
        setResize( { width: whVal, height: whVal } );
        break;
      case /w[0-9]+/.test(option):
        width = +option.match(/[0-9]+/);
        setResize( { width } );
        break;
      case /h[0-9]+/.test(option):
        height = +option.match(/[0-9]+/);
        setResize( { height } );
        break;
      // rotate
      case /r[0-9]+/.test(option):
        angle = +option.match(/[0-9]+/);
        setRotate( angle );
        break;
      // output
      case /(jpeg|png|webp|jpg)/.test(option):
        if (option === 'jpg') option = 'jpeg';
        defaultOptions[ option ] = true;
        break;
      case /(grey|greyscale|gray|grayscale)/.test(option):
        defaultOptions['greyscale'] = true;
        break;
      case /(flip|flop)/.test(option):
        defaultOptions[ option ] = true;
        break;
      default:
        console.log('not supported option');
    }
  }
  return defaultOptions;
};

exports.parseOption = parseOption;