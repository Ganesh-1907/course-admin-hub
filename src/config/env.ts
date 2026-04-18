const getRequiredEnv = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

export const env = {
  API_BASE_URL: getRequiredEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL),
  APP_TOKEN: getRequiredEnv('VITE_APP_TOKEN', import.meta.env.VITE_APP_TOKEN),
};

export default env;
