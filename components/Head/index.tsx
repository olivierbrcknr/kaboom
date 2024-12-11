import React from "react";
import NextHead from "next/head";

const Head = ({ title }) => {
  return (
    <NextHead>
      <meta charSet="UTF-8" />
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <link
        rel="icon"
        type="image/x-icon"
        sizes="16x16 32x32"
        href="/favicon.ico"
      />

      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=IBM+Plex+Sans:ital,wght@0,400;0,600;1,400;1,600&display=swap"
        rel="stylesheet"
      />
    </NextHead>
  );
};

// Head.propTypes = {
//   title: string,
//   description: string,
//   url: string,
//   ogImage: string,
// };

export default Head;
