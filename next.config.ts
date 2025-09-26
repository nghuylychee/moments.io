import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	outputFileTracingRoot: __dirname,
	experimental: {
		outputFileTracingIgnores: [
			"C:/Users/**/Application Data/**",
			"C:\\Users\\**\\Application Data\\**",
		],
	},
};

export default nextConfig;
