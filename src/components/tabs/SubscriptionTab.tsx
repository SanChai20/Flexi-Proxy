export default function SubscriptionTab() {
  const plans = [
    {
      name: 'Basic',
      price: '$9',
      period: 'per month',
      features: [
        'Up to 5 users',
        'Basic analytics',
        'Email support',
        '1GB storage',
      ],
      current: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: [
        'Up to 20 users',
        'Advanced analytics',
        'Priority email support',
        '10GB storage',
        'API access',
      ],
      current: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      features: [
        'Unlimited users',
        'Advanced analytics',
        '24/7 phone & email support',
        '100GB storage',
        'API access',
        'Custom integrations',
      ],
      current: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Current Plan</h2>
        <p className="text-gray-600 mb-4">
          You are currently on the <span className="font-semibold">Pro</span> plan.
        </p>
        <div className="flex items-center">
          <span className="text-3xl font-bold text-gray-900">$29</span>
          <span className="text-gray-600 ml-2">per month</span>
        </div>
        <p className="text-gray-600 mt-2">
          Next billing date: <span className="font-medium">June 1, 2023</span>
        </p>
        <div className="mt-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Update Payment Method
          </button>
          <button
            type="button"
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Change Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`border rounded-lg p-6 ${
                plan.current
                  ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50'
                  : 'border-gray-200'
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="ml-1 text-gray-600">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    plan.current
                      ? 'bg-indigo-100 text-indigo-700 cursor-default'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}