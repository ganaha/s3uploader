jQuery.noConflict();

(function($, PLUGIN_ID, AWS, kintoneUIComponent) {
  'use strict';

  // 設定値読み込み用変数
  const CONFIG = kintone.plugin.app.getConfig(PLUGIN_ID);
  // 設定値読み込み
  if (!CONFIG) return;

  // 定数
  const AWS_REGION = CONFIG.region;
  const AWS_IDENTITY_POOL_ID = CONFIG.identityPoolId;
  const AWS_BUCKET = CONFIG.bucket;
  const AWS_KEY_PREFIX = CONFIG.keyPrefix ? CONFIG.keyPrefix : '';
  const AWS_OBJECT_ACL = CONFIG.acl;

  const SPACE_ELEMENT_ID = CONFIG.spaceId;
  const KEY_FIELD_ID = CONFIG.filenameId;

  // Amazon Cognito 認証情報プロバイダーを初期化します
  AWS.config.region = AWS_REGION; // リージョン
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: AWS_IDENTITY_POOL_ID,
  });

  let attachment = null;

  // 新規追加
  kintone.events.on([
    'app.record.create.show', 'app.record.edit.show'
  ], (event) => {
    // スペースフィールドを取得
    const space = kintone.app.record.getSpaceElement(SPACE_ELEMENT_ID);

    // ファイル選択タグ生成
    attachment = new kintoneUIComponent.Attachment();
    attachment.setDropZoneText('Drop files here.');
    attachment.setBrowseButtonText('画像を選択');

    // スペースフィールドにinputタグ挿入
    space.appendChild(attachment.render());

    return event;
  });

  // 新規保存
  kintone.events.on([
    'app.record.create.submit', 'app.record.edit.submit'
  ], async (event) => {
    // ファイルを取得
    const files = getFiles();
    if (!files || files.length === 0) return event;

    // スピナーの設置
    const spinner = new kintoneUIComponent.Spinner();
    const body = document.getElementsByTagName('BODY')[0];
    body.appendChild(spinner.render());

    // スピナー開始
    spinner.show();

    // ファイルパス
    const keys = [];

    // アップロード
    for (let i = 0; i < files.length; i++) {
      const key = await upload(files[i]);
      if (!key) continue;
      keys.push(key);
    }

    // アップロードファイル名の設定
    event.record[KEY_FIELD_ID].value = JSON.stringify(keys);

    // スピナー終了
    spinner.hide();

    return event;
  });

  // 詳細表示
  kintone.events.on(['app.record.detail.show'], async (event) => {
    // ファイルパスを取得
    const val = event.record[KEY_FIELD_ID].value;
    if (!val) return event;

    const keys = JSON.parse(val);

    const urls = [];

    // 一時URLを取得
    for (let i = 0; i < keys.length; i++) {
      urls.push(await getSignedUrl(keys[i]));
    }

    // スペースフィールドを取得
    const space = kintone.app.record.getSpaceElement(SPACE_ELEMENT_ID);

    for (let j = 0; j < keys.length; j++) {
      // imgタグ生成
      const imgElement = document.createElement('img');
      imgElement.src = urls[j];
      imgElement.style = 'max-width: 100px; max-heigt: 100px;';

      // スペースフィールドにimgタグ挿入
      space.appendChild(imgElement);
    }

    return event;
  });

  // ファイル取得
  function getFiles() {
    if (!attachment) return null;
    return attachment.getFiles();
  }

  // アップロード
  function upload(file) {
    return new kintone.Promise((resolve, reject) => {
      const key = `${AWS_KEY_PREFIX}${file.name}`;
      const params = {
        Bucket: AWS_BUCKET,
        Key: key,
        ContentType: file.type,
        Body: file,
        ACL: AWS_OBJECT_ACL,
      };
      const s3 = new AWS.S3();
      s3.putObject(params, (err) => {
        if (err) return reject(err);
        return resolve(key);
      });
    });
  }

  // 一時URL取得
  function getSignedUrl(key) {
    return new kintone.Promise((resolve, reject) => {
      const s3 = new AWS.S3();
      const params = {
        Bucket: AWS_BUCKET,
        Key: key,
        Expires: 10,
      };
      s3.getSignedUrl('getObject', params, (err, url) => {
        if (err) return reject();
        return resolve(url);
      });
    });
  }
  // eslint-disable-next-line no-undef
})(jQuery, kintone.$PLUGIN_ID, AWS, kintoneUIComponent);
