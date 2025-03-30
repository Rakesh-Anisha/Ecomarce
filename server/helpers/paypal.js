const paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: 'sandbox', // Use 'sandbox' for testing
  client_id: 'your_sandbox_client_id_here',
  client_secret: 'your_sandbox_client_secret_here'
});

module.exports = paypal;