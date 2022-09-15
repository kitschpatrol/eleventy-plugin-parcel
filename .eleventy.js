const pkg = require("./package.json");
const EleventyParcel = require("./EleventyParcel");

module.exports = function (eleventyConfig, options = {}) {
  try {
    eleventyConfig.versionCheck(pkg["11ty"].compatibility);
  } catch (e) {
    console.warn(
      `[11ty] Warning: Eleventy Plugin (${pkg.name}) Compatibility: ${e.message}`
    );
  }

  let eleventyParcel = new EleventyParcel(eleventyConfig.dir.output, options);

  // Fallback to old passthrough copy behavior for compatibility with parcel
  eleventyConfig.setServerPassthroughCopyBehavior("copy");

  // Dom diffs aren't playing well with parcel, breaks css - timing issue?
  eleventyConfig.setServerOptions({ domdiff: false });

  // Adds support for automatic publicDir passthrough copy
  // Parcel will not touch these files and as part of the build will copy them to the root of your output folder
  // let publicDir = eleventyParcel.options.parcelOptions?.publicDir || "public";
  // eleventyConfig.ignores.add(publicDir);

  // Add temp folder to the ignores
  eleventyConfig.ignores.add(eleventyParcel.getIgnoreDirectory());

  // Run Parcel build
  // TODO use `build.write` option to work with json or ndjson outputs
  eleventyConfig.on(
    "eleventy.after",
    async ({ dir, runMode, outputMode, results }) => {
      // Skips the Parcel build if:
      //   --to=json
      //   --to=ndjson
      //   or 0 output files from Eleventy build
      if (
        outputMode === "json" ||
        outputMode === "ndjson" ||
        results.length === 0
      ) {
        return;
      }

      await eleventyParcel.runBuild(results);
    }
  );
};
