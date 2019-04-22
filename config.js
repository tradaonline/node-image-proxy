module.exports = {
  /**
   * If you use aws s3, you should input your aws configure and s3_bucket name
   * Configuring the AWS CLI : https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html
   **/
  'awsconfig': {
    'region': process.env.AWS_DEFAULT_REGION,
    'accessKeyId': process.env.AWS_ACCESS_KEY_ID,
    'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
    's3_bucket': process.env.AWS_S3_BUCKET
  },
  /**
   * An entry for the option to grant permission.
   * Only the options allowed here are available.
   * If you do not enter anything in the each options, all are allowed by default.
   *
   */
  'permission': {
    /**
     * Input all the allowed remote URL's hostnames. If there is no data, allow all remote URL. It is weak security.
     * ex) www.example.com
     */
    allowTargetHosts: [
      // 'www.example.com'
    ],
    /**
     * If you want, only accessible for certain hosts in the HTTP referrer header
     * ex) www.example.com
     */
    allowReferrers: [
      // 'www.example.com'
    ],
    /**
     * allowed options
     */
    allowOptions: {
      // allowed wh's number
      wh: [
        100, 200, 300
      ],
      // allowed resize's height
      h: [
        100, 200, 300
      ],
      // aloowed resize's width
      w: [
        100, 200, 300
      ],
      // allowed rotate's angle
      r: [
        90, 180, 270
      ],
      // allowed output format
      format: [
        'png', 'webp', 'jpg', 'jpeg'
      ],
      // allowed ohter option
      others: [
        'flip', 'flop', 'grey', 'gray', 'greyscale', 'grayscale'
      ]
    },
    /**
     * Allowed Mime Types of Remote URL's image.
     * default :
     *  'image/jpeg',
     *  'image/png',
     *  'image/gif'
     */
    'allowMimetypes': [
      'image/jpeg',
      'image/png',
      'image/gif'
    ],
    /**
     * allowed complex options.
     */
    allowComplex: [
      'resize',
      'composite',
      'flip',
      'flop',
      'grayscale'
    ],
    /**
      * Allowed Max Content Length
      * default : 20000000 (about 20MB)
      */
    'allowMaxContentLength': 20000000,
  },
  /**
   * HTTP Response Status Code
   * default : 302
   */
  'httpResponseStatusCode': 302,
  /**
   * Select mode 'local' or 's3'.
   * It means the upload target server. default 'local'
   */
  'mode': 'local',
  /**
   * node-image-proxy server's default port
   */
  'port': 3000,
  /**
   * Redis Server Information
   * default :
   *   'host': '127.0.0.1',
   *   'port': 6379,
   *   'db': 0
   */
  'redisServer': {
    'host': '127.0.0.1',
    'port': 6379,
    'db': 0
  },
  'paths':{
    /**
     * Your Domain name (or CDN host name)
     * If not use CDN or Domain, ipnut http://localhost.
     * If config.mode is s3 and empty this value (config.paths.domain_name), s3 use aws s3 public OBJECT URL
     */
    'domain_name': 'http://localhost:3000' ,  // your Dormain name
    /**
     * no image file path
     */
    'noimage': '/noimage.png',
    /**
     * prefix upload path
     */
    'upload_path': '/uploads'
  }
};

