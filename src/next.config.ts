import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL(
        "https://raw.githubusercontent.com/metno/weathericons/refs/heads/main/weather/png/**"
      ),
      new URL("https://nrkno.github.io/yr-warning-icons/png/**"),
      new URL("https://slaps.met.no/**"),
    ],
  },
};

export default nextConfig;
