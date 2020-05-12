jQuery.noConflict();

(function($, PLUGIN_ID) {
  'use strict';

  const okButton = $('.kintoneplugin-button-dialog-ok');
  const cancelButton = $('.kintoneplugin-button-dialog-cancel');

  const region = $('#region');
  const identityPoolId = $('#identity_pool_id');
  const bucket = $('#bucket');
  const keyPrefix = $('#key_prefix');
  const spaceId = $('#space_id');
  const filenameId = $('#filename_id');
  const acl = $('#acl');

  const config = kintone.plugin.app.getConfig(PLUGIN_ID);

  if (config.region) region.val(config.region);
  if (config.identityPoolId) identityPoolId.val(config.identityPoolId);
  if (config.bucket) bucket.val(config.bucket);
  if (config.keyPrefix) keyPrefix.val(config.keyPrefix);
  if (config.spaceId) spaceId.val(config.spaceId);
  if (config.filenameId) filenameId.val(config.filenameId);
  if (config.acl) acl.val(config.acl);

  okButton.on('click', (e) => {
    e.preventDefault();
    kintone.plugin.app.setConfig(
      {
        region: region.val(),
        identityPoolId: identityPoolId.val(),
        bucket: bucket.val(),
        keyPrefix: keyPrefix.val(),
        spaceId: spaceId.val(),
        filenameId: filenameId.val(),
        acl: acl.val(),
      },
      () => {
        window.location.href = `../../flow?app=${kintone.app.getId()}`;
      }
    );
  });

  cancelButton.on('click', () => {
    window.location.href = `../../${kintone.app.getId()}/plugin/`;
  });
})(jQuery, kintone.$PLUGIN_ID);
