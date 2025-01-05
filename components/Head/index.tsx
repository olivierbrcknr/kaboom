import React from "react";

import NextHead from "next/head";

const Head = ({ title }) => {
  return (
    <NextHead>
      <meta charSet="UTF-8" />
      <title>{title}</title>
      <meta content="Play the card game 'Kaboom' online." name="description" />

      <link href="/favicon.ico" rel="icon" />

      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta content="Kaboom" name="application-name" />
      <meta content="Kaboom" name="apple-mobile-web-app-title" />
      <meta content="yes" name="apple-mobile-web-app-capable" />
      <meta content="yes" name="mobile-web-app-capable" />
      <meta content="default" name="apple-mobile-web-app-status-bar-style" />
      <link href="/AppIcon.png" rel="apple-touch-icon" />
    </NextHead>
  );
};

export default Head;
