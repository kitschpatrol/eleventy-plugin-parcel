const pkg = require("./package.json");
const EleventyParcel = require("./EleventyParcel");

module.exports = function (eleventyConfig, options = {}) {
  try {
    eleventyConfig.versionCheck(pkg["11ty"].compatibility);
  } catch (e) {
    console.warn(
      `[11ty] Warning: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}`,
    );
  }

  let eleventyParcel = new EleventyParcel(eleventyConfig.dir.output, options);

  // Fallback to old passthrough copy behavior for compatibility with parcel
  eleventyConfig.setServerPassthroughCopyBehavior("copy");

  // TODO revisit this
  // Adds support for automatic publicDir passthrough copy
  // Parcel will not touch these files and as part of the build will copy them to the root of your output folder
  // let publicDir = eleventyParcel.options.parcelOptions?.publicDir || "public";
  // eleventyConfig.ignores.add(publicDir);

  // Use for-free passthrough copy on the public directory
  // let passthroughCopyObject = {};
  // passthroughCopyObject[`${publicDir}/`] = "/"
  // eleventyConfig.addPassthroughCopy(passthroughCopyObject);

  // Add temp folder to the ignores
  eleventyConfig.ignores.add(eleventyParcel.getIgnoreDirectory());

  // Set up development server
  let serverOptions = Object.assign(
    {
      module: "@11ty/eleventy-dev-server",
      // enabled: false,
      domdiff: false, // Dom diffs aren't playing well with parcel, breaks css - timing issue?
      showVersion: true,
    },
    options.serverOptions,
  );

  if (eleventyParcel.options.useMiddleware) {
    serverOptions.setup = async () => {
      // Use Parcel as Middleware
      let middleware = await eleventyParcel.getServerMiddleware();

      return {
        middleware: [middleware],
      };
    };
  }

  eleventyConfig.setServerOptions(serverOptions);

  // Run Parcel build
  // TODO use `build.write` option to work with json or ndjson outputs
  eleventyConfig.on(
    "eleventy.after",
    async ({ dir, runMode, outputMode, results }) => {
      // Skips the Parcel build if:
      //   --serve and eleventyParcel.options.useMiddleware == false
      //   --to=json
      //   --to=ndjson
      //   or 0 output files from Eleventy build
      if (
        (eleventyParcel.options.useMiddleware && runMode === "serve") ||
        outputMode === "json" ||
        outputMode === "ndjson" ||
        results.length === 0
      ) {
        return;
      }

      eleventyParcel.setRunMode(runMode);
      await eleventyParcel.runBuild(results);
    },
  );
};
