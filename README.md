# eleventy-plugin-parcel

**A plugin integrating the [Parcel 2.x](https://parceljs.org) build tool as a post-processor for the [Eleventy 2.x](https://www.11ty.dev) static site generator.**

## Overview

This plugin adds a post-build step to the Eleventy build process. Parcel is invoked automatically each time Eleventy finishes a build of your site, performing additional optimization and transpilation of various scripts and resources. Eleventy then launches its integrated development server to provide a preview of the site with automatic reloading when files are changed.

This post-processing step happens entirely within Eleventy's plugin system; no additions or modifications to your npm scripts are required.

This plugin is basically a port of Zach Leat's [elventy-plugin-vite](https://github.com/11ty/eleventy-plugin-vite) from Vite to Parcel. Hypothetically, the Parcel development server could be used to serve the site — as Vite does in the aforelinked plugin — but for now the new [Eleventy Dev Server](https://www.11ty.dev/docs/dev-server/) is used to serve and reload Parcel's output.

## Motivation

Simplicity is one of Eleventy's charms, and there's a certain appeal to keeping the build process as "close to the core" as possible, even as a site's complexity accumulates. The very thorough [eleventy-high-performance-blog](https://github.com/google/eleventy-high-performance-blog) starter template is a good example of this philosophy in practice.

I've hewn to a similar approach in my own projects, but have found myself plumbing together byzantine chains of smaller tools to optimize images, add cache-busting hashes, generate CSP headers, etc. etc. — problems that have been solved several times over by a variety of build tools.

An official asset pipeline has been [a topic of discussion on Elevent's issue pages over the years](https://github.com/11ty/eleventy/issues/272). [Vite](https://vitejs.dev) looks like a promising candidate. Parcel has significant feature overlap, so I wanted to kick the tires on it as well as a point of comparison.

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

## Options

Additional configuration may be passed to Parcel when the plugin is added to Eleventy's configuration.

The `parcelOptions` object will pass any settings specified by Parcel's [InitialParcelOptions](https://parceljs.org/plugin-system/api/#InitialParcelOptions) type.

Note that at build time `entries` are automatically prefixed with the `tempFolderName`, and the `defaultTargetOptions.distDir` value is set dynamically based on the `tempFolderName`.

Here's an example of passing options to the plugin in your `.eleventy.js` file:

```js
const eleventyParcelPlugin = require("@kitschpatrol/eleventy-plugin-parcel");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(eleventyParcelPlugin, {
    tempFolderName: ".11ty-parcel", // (default) name of temporary folder where Parcel stages its build
    parcelOptions: {
      entries: "index.html", // (default) Parcel entry file(s)
      mode: "production", // (default) Parcel build mode
    },
  });
};
```

Parcel will also pull configuration from a [`.parcelrc`](https://github.com/parcel-bundler/parcel/blob/65500fbb07ff100c1fe5dd32e98fb80ff889f32e/packages/core/types/index.js#L55) file in your project's root to further customize the build process.

## Caveats

- Only Eleventy 2.x is supported
- Parcel is configured to use `production` mode regardless of how Eleventy is invoked, so that you see output more reflective of the final build (this may be overridden in the plugin's options)
- Not tested with Eleventy's [Serverless](https://www.11ty.dev/docs/plugins/serverless/) or [Edge](https://www.11ty.dev/docs/plugins/edge/) features
- Passthrough files must be copied to the output folder to be accessible to Parcel (the plugin sets `eleventyConfig.setServerPassthroughCopyBehavior("copy");`)
- The dom-diffing [morphdom](https://github.com/patrick-steele-idem/morphdom) functionality integrated in the Eleventy Dev Server's auto-reloading logic does not play well with Parcel's output, and must be disabled (the plugin sets `eleventyConfig.setServerOptions({ domdiff: false });`)
- Parcel's caching system seems to have issues with Eleventy's output, and is disabled via the `shouldDisableCache` option
- Parcel is configured with `shouldAutoInstall` enabled by default, which means it will automatically make changes to your `package.json` as plugins are needed to handle various file types
- To avoid duplication of certain configuration parameters, the plugin writes an object related to the [parcel-resolver-root](https://github.com/mischnic/parcel-resolver-root) Parcel plug-in default to your `package.json` if needed
- HMR and other features specific to the Parcel development server won't work, since we're using Eleventy's build-in server
- This plugin is only used on my personal side projects and has not been extensively tested

## Related Efforts to Integrate Eleventy and Parcel

Many others have combined Parcel and Eleventy in various ways and at different points in the build chain:

- Michelle Barker's [eleventy-parcel](https://github.com/mbarker84/eleventy-parcel)
- Rico Sta. Cruz's [eleventy-parcel-demo](https://github.com/rstacruz/eleventy-parcel-demo)
- Mark van Seventer's [eleventy-parcel-boilerplate](https://github.com/vseventer/eleventy-parcel-boilerplate)
- Chris D. Macrae's [parceleventy](https://github.com/chrisdmacrae/parceleventy)
- Dusty Candland's [11ty-starter](https://github.com/candland/11ty-starter)

## TODOs

- [ ] Option to use Parcel development server instead of Eleventy Dev Server
- [ ] Eleventy [Serverless](https://www.11ty.dev/docs/plugins/serverless/) / [Edge](https://www.11ty.dev/docs/plugins/edge/) integration
- [ ] Alternative to resolver dependency
- [ ] Pass resolver plugin options differently to avoid dynamically modifying `package.js`
- [ ] Support Parcel's cache (currently has issues with reloading)
- [ ] Support Eleventy 1.x
- [ ] Legacy BrowserSync dev server reload timing issues
- [ ] More intelligent Parcel entry point than `index.html` to account for
