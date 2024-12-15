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
