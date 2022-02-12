const Client = require('../models/Client');
const stripe = require('../utils/stripe');
const ClaimRequest = require('../models/ClaimRequests');
const sendNotificationEvent = require('../controllers/NotificationController');
const Chat = require('../models/Chat');

const directEndpointSecret = process.env.STRIPE_DIRECT_WEBHOOK_SECRET;
const connectEndpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

exports.handleDirectWebhook = async (req, res) => {
  console.log('Webhook Event Received');
  const sig = req.headers['stripe-signature'];

  console.log('req.body', req.body);
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, directEndpointSecret);
  } catch (err) {
    console.log('err', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const data = event.data.object;
  console.log('data', data);
  console.log('event.type', event.type);
  switch (event.type) {
    // * This only triggered when session completed but It doesn;t guarantees
    // * that payment is successfull or not
    // case 'checkout.session.completed':
    //   console.log('checkout.session.completed');

    // Then define and call a function to handle the event checkout.session.completed
    // break;

    case 'payment_intent.succeeded':
      console.log('payment_intent.succeeded');
      const claimRequest = await ClaimRequest.findById(
        data.metadata?.claimRequest
      )
        .populate({
          path: 'claimBid',
        })
        .populate({
          path: 'user',
          select: 'firstName lastName email name twitterProfile',
        })
        .populate({
          path: 'auction',
          select: `title`,
        });

      if (!claimRequest) {
        // ! Wrong metadata at the time of session crreation
        // * Possible actions are send email to customer and  refund payment and also notify admin
        return;
      }
      claimRequest.status = 'accepted';
      claimRequest.bidderPaymentId = data.id;
      claimRequest.bidderPaymentStatus = true;
      await claimRequest.save();

      const claimBidder = claimRequest.claimBid?.user;
      const claimRequestUser = claimRequest.user;

      // * Send Notifications to Bidder and claimant
      sendNotificationEvent({
        title: `Your Payment Accepted for auction ${claimRequest.auction?.title}".`,
        description: `for Claim Request ${claimRequest.message}`,
        type: 'claimRequest',
        link: `/myauctions/claim-requests/?tab=received&claimRequest=${claimRequest._id}`,
        userId: claimBidder?._id,
      });

      sendNotificationEvent({
        title: `The Bidder accepted your Claim Request for auction ${claimRequest.auction?.title}".`,
        description: `of Claim Request ${claimRequest.message}`,
        type: 'claimRequest',
        link: `/myauctions/claim-requests/?tab=sent&claimRequest=${claimRequest._id}`,
        userId: claimRequestUser?._id,
      });

      // * Create Chat between these two
      let alreadyChat = await Chat.findOne({
        $and: [
          {
            participants: { $in: [claimBidder?._id] },
          },
          {
            participants: { $in: [claimRequestUser?._id] },
          },
        ],
      });

      if (alreadyChat) {
        console.log('chat already exists');
        console.log('alreadyChat', alreadyChat);
        return;
      }
      // * ChatAlready Exists, so no need to create newChat

      // * Check if receiver a user
      const receiver = await Client.findById(claimRequestUser?._id);
      if (!receiver) return;

      const chat = await Chat.create({
        participants: [claimBidder?._id, claimRequestUser?._id],
      });

      console.log('chat', chat);

      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.failed':
      console.log('payment_intent.failed');
      // * Send Notifications to Bidder
      sendNotificationEvent({
        title: `Your Payment Failed for auction ${claimRequest.auction?.title}".`,
        description: `for Claim Request ${claimRequest.message}`,
        type: 'claimRequest',
        link: `/myauctions/claim-requests/?tab=received?claimRequest=${claimRequest._id}`,
        userId: claimBidder?._id,
      });
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case 'payout.failed':
      console.log('payout.failed');

      // Then define and call a function to handle the event payout.failed
      break;
    case 'payout.paid':
      console.log('payout.paid');

      // Then define and call a function to handle the event payout.paid
      break;
    case 'transfer.failed':
      console.log('transfer.failed', transfer.failed);

      // Then define and call a function to handle the event transfer.failed
      break;
    case 'transfer.paid':
      console.log('transfer.paid');

      // Then define and call a function to handle the event transfer.paid
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 res to acknowledge receipt of the event
  res.send();
};
exports.handleConnectWebhook = async (req, res) => {
  console.log('Webhook Event Received');
  const sig = req.headers['stripe-signature'];

  console.log('req.body', req.body);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      connectEndpointSecret
    );
  } catch (err) {
    console.log('err', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  const data = event.data.object;
  console.log('data', data);
  console.log('event.type', event.type);
  switch (event.type) {
    case 'account.updated':
      console.log('account.updated');
      const user = await Client.findOneAndUpdate(
        { email: data.email },
        {
          stripeAccount: {
            id: data.id,
            charges_enabled: data.charges_enabled,
            details_submitted: data.details_submitted,
            capabilities: data.capabilities,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      console.log('user', user);
      // Then define and call a function to handle the event account.updated
      break;
    case 'account.application.deauthorized':
      console.log('account.application.deauthorized');

      // Then define and call a function to handle the event account.application.deauthorized
      break;
    case 'checkout.session.completed':
      console.log('checkout.session.completed');

      // Then define and call a function to handle the event checkout.session.completed
      break;
    case 'payment_intent.payment_failed':
      console.log('payment_intent.payment_failed');

      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case 'payment_intent.succeeded':
      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    case 'payout.failed':
      console.log('payout.failed');

      // Then define and call a function to handle the event payout.failed
      break;
    case 'payout.paid':
      console.log('payout.paid');

      // Then define and call a function to handle the event payout.paid
      break;
    case 'transfer.failed':
      console.log('transfer.failed', transfer.failed);

      // Then define and call a function to handle the event transfer.failed
      break;
    case 'transfer.paid':
      console.log('transfer.paid');

      // Then define and call a function to handle the event transfer.paid
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 res to acknowledge receipt of the event
  res.send();
};
