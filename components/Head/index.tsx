import NextHead from "next/head";
import React from "react";

const Head = ({ title }) => {
  return (
    <NextHead>
      <meta charSet="UTF-8" />
      <title>{title}</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />

      <link
        href="/favicon.ico"
        rel="icon"
        sizes="16x16 32x32"
        type="image/x-icon"
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
