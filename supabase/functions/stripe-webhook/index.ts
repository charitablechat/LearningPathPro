import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import Stripe from 'npm:stripe@14.10.0';

// PRODUCTION SETUP: Add your production domain(s) here before deploying
// Example: 'https://yourdomain.com', 'https://www.yourdomain.com'
const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // Development
  'http://localhost:4173',  // Preview
  // ADD YOUR PRODUCTION DOMAIN HERE:
  // 'https://yourdomain.com',
  // 'https://www.yourdomain.com',
];

const isDevelopment = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = isDevelopment
    ? '*'
    : (origin && ALLOWED_ORIGINS.includes(origin)) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
    'Access-Control-Max-Age': '86400',
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'No signature provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);

    if (isDevelopment) {
      console.log('Webhook event type:', event.type);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id;
        const planId = session.metadata?.plan_id;
        const billingCycle = session.metadata?.billing_cycle || 'monthly';

        if (!organizationId || !planId) {
          if (isDevelopment) {
            console.error('Missing metadata in checkout session');
          }
          break;
        }

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id;

        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            organization_id: organizationId,
            plan_id: planId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
            status: 'active',
            billing_cycle: billingCycle,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
          });

        if (subError) {
          if (isDevelopment) {
            console.error('Error creating subscription:', subError);
          }
        }

        const { error: orgError } = await supabase
          .from('organizations')
          .update({
            subscription_status: 'active',
            trial_ends_at: null,
          })
          .eq('id', organizationId);

        if (orgError) {
          if (isDevelopment) {
            console.error('Error updating organization:', orgError);
          }
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq('stripe_subscription_id', stripeSubId);

        if (error) {
          if (isDevelopment) {
            console.error('Error updating subscription:', error);
          }
        }

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', stripeSubId)
          .single();

        if (subData) {
          const orgStatus = subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'canceled';
          await supabase
            .from('organizations')
            .update({ subscription_status: orgStatus })
            .eq('id', subData.organization_id);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const stripeSubId = subscription.id;

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', stripeSubId)
          .single();

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', stripeSubId);

          await supabase
            .from('organizations')
            .update({ subscription_status: 'canceled' })
            .eq('id', subData.organization_id);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;

        if (stripeSubId) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('organization_id')
            .eq('stripe_subscription_id', stripeSubId)
            .single();

          if (subData) {
            await supabase
              .from('organizations')
              .update({ subscription_status: 'past_due' })
              .eq('id', subData.organization_id);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const stripeSubId = typeof invoice.subscription === 'string'
          ? invoice.subscription
          : invoice.subscription?.id;

        if (stripeSubId) {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('organization_id')
            .eq('stripe_subscription_id', stripeSubId)
            .single();

          if (subData) {
            await supabase
              .from('organizations')
              .update({ subscription_status: 'active' })
              .eq('id', subData.organization_id);
          }
        }

        break;
      }

      default:
        if (isDevelopment) {
          console.log('Unhandled event type:', event.type);
        }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    const corsHeaders = getCorsHeaders(req.headers.get('origin'));

    if (isDevelopment) {
      console.error('Webhook error:', errorMessage);
    }

    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});