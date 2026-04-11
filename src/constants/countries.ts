export const COUNTRY_CONFIGS = [
  { country: "USA", currency: "USD", symbol: "$" },
  { country: "Canada", currency: "CAD", symbol: "C$" },
  { country: "Europe", currency: "EUR", symbol: "EUR" },
  { country: "India", currency: "INR", symbol: "Rs" },
  { country: "Australia", currency: "AUD", symbol: "A$" },
  { country: "Singapore", currency: "SGD", symbol: "S$" },
];

export const COUNTRY_OPTIONS = COUNTRY_CONFIGS.map((config) => config.country);
