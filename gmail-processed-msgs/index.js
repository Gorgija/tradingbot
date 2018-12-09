/**
 * Triggered by a change to a Firebase RTDB reference.
 *
 * @param {!Object} event Event payload and metadata.
 * @param {!Function} callback Callback function to signal completion.
 */
exports.processCryptoMasgs = (event, callback) => {
  const triggerResource = event.resource;
  console.log('Function triggered by change to: ' +  triggerResource);
  console.log(JSON.stringify(event));
  callback();
};
