import { CheckIcon } from '@heroicons/react/20/solid';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    price: 'Free',
    priceUnit: '',
    description: 'Perfect for getting started with local gigs and opportunities',
    features: [
      'Basic gig listings',
      'Access to community posts',
      'Standard visibility',
      'Community support',
      'Mobile app access',
    ],
    featured: false,
  },
  {
    name: 'Premium',
    id: 'tier-premium',
    href: '#',
    price: '$20',
    priceUnit: '/month',
    description: 'Boosted visibility and analytics for serious users',
    features: [
      'All Free features',
      'Boosted visibility',
      'Advanced analytics',
      'Priority support',
      'Performance insights',
      'Marketing tools',
      'Enhanced profile',
    ],
    featured: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    price: '$150',
    priceUnit: '/month',
    description: 'Full suite of features for businesses and organizations',
    features: [
      'All Premium features',
      'Verified badge',
      'Business insights',
      'Dedicated support',
      'Custom integrations',
      'API access',
      'Marketing automation',
      'White-label options',
    ],
    featured: false,
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PricingSection({ showNavAndFooter = true }) {
  return (
    <>
      {showNavAndFooter && <Navbar />}
      
      <div className="relative isolate bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
        <div aria-hidden="true" className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl">
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="mx-auto aspect-1155/678 w-288.75 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"
          />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <p className="mt-2 text-2xl font-semibold tracking-tight text-balance bg-gradient-to-r from-green-400 via-green-200 to-green-600 bg-clip-text text-transparent leading-normal pb-1 sm:text-6xl">
            Plans and Pricing
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-lg font-light text-pretty text-gray-400 sm:text-xl/8">
          Transparent pricing that keeps our platform accessible while ensuring quality service for everyone in the Greensboro community.
        </p>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={classNames(
                tier.featured ? 'relative bg-gray-800 ring-2 ring-green-500' : 'bg-white/5',
                'rounded-3xl p-8 ring-1 ring-white/10 sm:p-10',
              )}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                    Popular
                  </span>
                </div>
              )}
              <h3
                id={tier.id}
                className={classNames(tier.featured ? 'text-green-200' : 'text-green-200', 'text-base/7 font-semibold')}
              >
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-x-2 flex-wrap">
                <span
                  className={classNames(
                    tier.featured ? 'text-white' : 'text-white',
                    'text-4xl font-semibold tracking-tight',
                  )}
                >
                  {tier.price}
                </span>
                {tier.priceUnit && (
                  <span className={classNames(tier.featured ? 'text-gray-400' : 'text-gray-400', 'text-base')}>
                    {tier.priceUnit}
                  </span>
                )}
              </p>
              <p className={classNames(tier.featured ? 'text-gray-300' : 'text-gray-300', 'mt-6 text-base/7')}>
                {tier.description}
              </p>
              <ul
                role="list"
                className={classNames(
                  tier.featured ? 'text-gray-300' : 'text-gray-300',
                  'mt-8 space-y-3 text-sm/6 sm:mt-10',
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className={classNames(tier.featured ? 'text-green-400' : 'text-green-400', 'h-6 w-5 flex-none')}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={classNames(
                  tier.featured
                    ? 'bg-green-400 text-white hover:bg-green-300 focus-visible:outline-green-500'
                    : 'bg-white/10 text-white ring-1 ring-inset ring-white/5 hover:bg-white/20 focus-visible:outline-white/75',
                  'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
                )}
              >
                Get started today
              </a>
            </div>
          ))}
        </div>
      </div>

      {showNavAndFooter && <Footer />}
    </>
  );
}