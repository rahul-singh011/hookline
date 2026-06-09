const PLANS = {
  free: {
    name: "Free",
    monthlyLimit: 1_000,
    price: 0,
    razorpayAmount: null,
  },
  pro: {
    name: "Pro",
    monthlyLimit: 10_000,
    price: 999,
    razorpayAmount: 99900,
  },
  business: {
    name: "Business",
    monthlyLimit: 100_000,
    price: 2999,
    razorpayAmount: 299900,
  },
};
const getPlan = (planName) => {
  return PLANS[planName] || PLANS.free;
};


export {PLANS , getPlan}

