// pages/_document.js
import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '@/createEmotionCache';
import {
  DocumentHeadTags,
  documentGetInitialProps,
} from '@mui/material-nextjs/v15-pagesRouter';

export default function Document(props) {
  return (
    <Html lang="en">
      <Head>
        {/* this will inject exactly the same style tags that were used on the server */}
        <DocumentHeadTags {...props} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

Document.getInitialProps = async (ctx) => {
  // 1) create a cache *with the same key* as in _app.js
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  // 2) let the pagesRouter helper use your cache and extractor
  const initialProps = await documentGetInitialProps(ctx, cache, extractCriticalToChunks);
  return initialProps;
};
