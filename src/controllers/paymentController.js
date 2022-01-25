const endpointSecret = process.env.whsec_76FfQH8u2ookb5hLqGDcTjcFm9nV9JtH;

exports.handleWebhook = async (req, res) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const data = event.data.object;
  console.log('data', data);
  switch (event.type) {
    case 'account.updated':
      console.log('account.updated');
      // Then define and call a function to handle the event account.updated
      break;
    case 'checkout.session.completed':
      console.log('checkout.session');
      // Then define and call a function to handle the event checkout.session.completed
      break;
    case 'transfer.created':
      console.log('transfer.created');
      // const transfer = event.data.object;
      // Then define and call a function to handle the event transfer.created
      break;
    case 'transfer.failed':
      console.log('transfer.failed');
      // Then define and call a function to handle the event transfer.failed
      break;
    case 'transfer.paid':
      console.log('transfer.paid');
      // Then define and call a function to handle the event transfer.paid
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
};
