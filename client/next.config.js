/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
   NEXT_PUBLIC_ZEGO_APP_ID:234172395,
   NEXT_PUBLIC_ZEGO_SERVER_ID:"10377078a9110c780a6d2ee168492365",

  },
  images:{
    domains:["localhost"],
  }
};

module.exports = nextConfig;
