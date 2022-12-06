# eleventy-plugin-parcel

<a href="https://npmjs.com/package/@kitschpatrol/eleventy-plugin-parcel"><img src="https://img.shields.io/npm/v/@kitschpatrol/eleventy-plugin-parcel.svg" alt="npm package"></a>

**A plugin integrating the [Parcel 2.x](https://parceljs.org) build tool and dev server with the [Eleventy 2.x](https://www.11ty.dev) static site generator.**

## Overview

This plugin adds a Parcel bundling step to the Eleventy build process, and optionally allows the use of the Parcel Development Server as middleware during development.

Parcel is invoked automatically each time Eleventy finishes a build of your site, performing additional optimization and transpilation of various scripts and resources. Eleventy then launches its integrated development server to provide a preview of the site with automatic reloading when files are changed.

This post-processing step happens entirely within Eleventy's plugin system; no additions or modifications to your npm scripts are required.

This plugin is basically a port of Zach Leat's [eleventy-plugin-vite](https://github.com/11ty/eleventy-plugin-vite) from Vite to Parcel.

## Motivation

Simplicity and a sense of containment are part Eleventy's charm, and there's a certain appeal to keeping the build process as "close to the core" as possible, even as a site's complexity accumulates. The very thorough [eleventy-high-performance-blog](https://github.com/google/eleventy-high-performance-blog) starter template illustrates this philosophy in practice.

For a while I've hewn to a similar approach in my own projects, but have found myself plumbing together byzantine chains of smaller tools to optimize images, add cache-busting hashes, generate CSP headers, etc. etc. — problems that have been solved several times over by a variety of build tools.

An official asset pipeline has been [a topic of discussion on Eleventy's issue pages over the years](https://github.com/11ty/eleventy/issues/272). [Vite](https://vitejs.dev) seems likely to be ordained as such, but Parcel has significant feature overlap — so I wanted to kick the tires on it as well as a point of comparison.

## Installation

1.  Add the plugin to your Eleventy project:

    ```
    $ npm install --save-dev @kitschpatrol/eleventy-plugin-parcel
    ```

2.  Load the plugin in your `.eleventy.js` file:

    ```js
    const eleventyParcelPlugin = require("@kitschpatrol/eleventy-plugin-parcel");

    module.exports = function (eleventyConfig) {
      eleventyConfig.addPlugin(eleventyParcelPlugin);
    };
    ```

    Note that if you do _not_ want to use the Parcel Development Server as middleware when serving your site, pass the `useMiddleware: false` option when adding the plugin:

    ```js
    const eleventyParcelPlugin = require("@kitschpatrol/eleventy-plugin-parcel");

    module.exports = function (eleventyConfig) {
      eleventyConfig.addPlugin(eleventyParcelPlugin { useMiddleware: false });
    };
    ```

    This serves your site as usual via an unmodified version of the Eleventy Dev Server, but Parcel will still process your output.

3.  Create a [`.parcelrc`](https://github.com/parcel-bundler/parcel/blob/65500fbb07ff100c1fe5dd32e98fb80ff889f32e/packages/core/types/index.js#L55) file in your project's root including at least the following:

    ```json
    {
      "extends": "@parcel/config-default",
      "resolvers": ["@mischnic/parcel-resolver-root", "..."]
    }
    ```

    _You must include this for absolute links to resolve correctly in the `output` subfolder when Parcel spiders through your site!_

4.  Build and run your Eleventy project as usual. The output from Eleventy will be passed to Parcel, which will process the site, replacing the contents of your `output` folder (usually `_site`), and then start the Eleventy Dev Server:

    ```
    $ npx @11ty/eleventy --serve --quiet
    ```

    A normal Eleventy build will output your site with all Parcel optimizations enabled:

    ```
    $ npx @11ty/eleventy
    ```

## Options

Additional configuration may be passed to Parcel when the plugin is added to Eleventy's configuration.

The available top-level option keys are as follows:

- `parcelOptions`

  Object passed to configure additional options as specified by Parcel's [InitialParcelOptions type](https://parceljs.org/plugin-system/api/#InitialParcelOptions).

  Defaults to:

  ```js
  {
    parcelOptions: {
      entries: "index.html",
      defaultConfig: "@parcel/config-default",
      shouldDisableCache: true,
      shouldAutoInstall: true,
      serveOptions: {
        port: 3000,
      },
      hmrOptions: {
        port: 3001,
      }
    }
  }
  ```

  _Important notes about how the plugin dynamically modifies the `parcelOptions` object in an effort to make your life more convenient:_

  By default, Parcel's `mode` option is set dynamically based on the context of the build. Serve builds, e.g. `npx @11ty/eleventy --serve`, gets `"development"` mode, while release builds, e.g. `npx @11ty/eleventy` gets `"production"`. You can override this by passing an explicit `mode` string to your `parcelOptions`.

  The Plugin automatically uses your Eleventy project's `output` folder to correctly prefix your `parcelOptions.entries` string or array.

  Similarly, for release builds, Parcel's `defaultTargetOptions.distDir` path is automatically set to match Eleventy's `output`.

- `tempFolderName`

  String with name of folder to stage the Parcel builds. Defaults to `.11ty-parcel-temp` There's little reason to change this unless there is a conflict. This folder is automatically created and cleaned up during the release build process, but may linger during a `serve` build. It's recommended to add this path, along with `.parcel-cache` to you `.gitignore`.

- `useMiddleware`

  Boolean specifying whether to use the Parcel development server as middleware. Defaults to `true`.

- `middlewareOptions`

  Object passed to the middleware (if `useMiddleware: true`) as specified by the [http-proxy-middleware options type](https://github.com/chimurai/http-proxy-middleware#options).

Parcel will also pull configuration from a [`.parcelrc`](https://github.com/parcel-bundler/parcel/blob/65500fbb07ff100c1fe5dd32e98fb80ff889f32e/packages/core/types/index.js#L55) file in your project's root to further customize the build process.

Here are a few example configurations to customize the Parcel's plugin's behavior. These object are passed to the plugin via the `addPlugin` method, usually in your projects `.eleventy.js` file.

**Example 1:**

Skip the Parcel middleware and always build with all Parcel's optimizations enabled, regardless of invocation context:

```js
const eleventyParcelPlugin = require("@kitschpatrol/eleventy-plugin-parcel");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyParcelPlugin, {
    parcelOptions: {
      mode: "production",
    },
    useMiddleware: false,
  });
};
```

**Example 2:**

Customize settings passed to `http-proxy-middleware` to rewrite paths in a way that allows you to drop the `.html` from URLs. This works well with the [parcel-optimizer-friendly-urls Parcel plugin](https://github.com/vseventer/parcel-optimizer-friendly-urls).

```js
const eleventyParcelPlugin = require("@kitschpatrol/eleventy-plugin-parcel");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyParcelPlugin, {
    useMiddleware: true,
    middlewareOptions: {
      pathRewrite: {
        "^([^.]+?)$": "$1.html",
      },
    },
  });
};
```

## Caveats

- Only Eleventy 2.x is supported
- Not tested with Eleventy's [Serverless](https://www.11ty.dev/docs/plugins/serverless/) or [Edge](https://www.11ty.dev/docs/plugins/edge/) features
- Passthrough files must be copied to the output folder to be accessible to Parcel (the plugin sets `eleventyConfig.setServerPassthroughCopyBehavior("copy");`)
- The dom-diffing [morphdom](https://github.com/patrick-steele-idem/morphdom) functionality integrated in the Eleventy Dev Server's auto-reloading logic does not play well with Parcel's output, and must be disabled (the plugin sets `eleventyConfig.setServerOptions({ domdiff: false });`)
- Parcel's caching system seems to have issues with Eleventy's output, and is disabled via the `shouldDisableCache` option
- Parcel is configured with `shouldAutoInstall` enabled by default, which means it will automatically make changes to your `package.json` as plugins are needed to handle various file types
- To avoid duplication of certain configuration parameters, the plugin writes an object related to the [parcel-resolver-root](https://github.com/mischnic/parcel-resolver-root) Parcel plug-in default to your `package.json` if needed
- Unlike Parcel 1.x, Parcel 2.x [does not bundle middleware functionality](https://github.com/parcel-bundler/parcel/discussions/4612) as part of its development server... Instead, the plugin establishes the middleware proxy via [http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)
- This plugin is only used on my personal side projects and has not been extensively tested

## Related Efforts to Integrate Eleventy and Parcel

Many others have combined Parcel and Eleventy in various ways and at different points in the build chain:

- Michelle Barker's [eleventy-parcel](https://github.com/mbarker84/eleventy-parcel)
- Rico Sta. Cruz's [eleventy-parcel-demo](https://github.com/rstacruz/eleventy-parcel-demo)
- Mark van Seventer's [eleventy-parcel-boilerplate](https://github.com/vseventer/eleventy-parcel-boilerplate)
- Chris D. Macrae's [parceleventy](https://github.com/chrisdmacrae/parceleventy)
- Dusty Candland's [11ty-starter](https://github.com/candland/11ty-starter)

## TODOs

- [x] Option to use Parcel development server (as middleware) instead of Eleventy Dev Server
- [ ] Eleventy [Serverless](https://www.11ty.dev/docs/plugins/serverless/) / [Edge](https://www.11ty.dev/docs/plugins/edge/) integration
- [ ] Alternative to resolver dependency
- [ ] Pass resolver plugin options differently to avoid dynamically modifying `package.js`
- [ ] Support Parcel's cache (currently has issues with reloading)
- [ ] Support Eleventy 1.x
- [ ] Legacy BrowserSync dev server reload timing issues
- [ ] More intelligent Parcel entry point than `index.html` to accommodate sites with un-crawlable pages
- [ ] HTTPS...
