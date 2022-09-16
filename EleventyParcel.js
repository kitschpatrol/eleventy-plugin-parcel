const { promises: fsp } = require("fs");
const fs = require("fs");
const path = require("path");
const { Parcel } = require("@parcel/core");
const lodashMerge = require("lodash.merge");
const lodashSome = require("lodash.some");
const { createProxyMiddleware } = require("http-proxy-middleware");

const DEFAULT_OPTIONS = {
  tempFolderName: ".11ty-parcel",
  useMiddleware: true,
  middlewareOptions: {}, // In case you need to pass more options to createProxyMiddleware, e.g. specify a rewrite
  parcelOptions: {
    entries: "index.html", // Prefixed with build folder name automatically
    defaultConfig: "@parcel/config-default",
    shouldDisableCache: true, // TODO what's the catch?
    shouldAutoInstall: true,
    serveOptions: {
      port: 3000,
    },
    hmrOptions: {
      port: 3001, // Hmm https://github.com/parcel-bundler/parcel/issues/6994
    },
  },
};

class EleventyParcel {
  constructor(outputDir, pluginOptions = {}) {
    this.outputDir = outputDir;
    this.options = lodashMerge({}, DEFAULT_OPTIONS, pluginOptions);
    this.runMode = "unknown"; // Run mode determines development vs. production default option when running without Parcel middleware

    // Set configuration for parcel-resolver-root if needed
    // TODO allow this config to be specified elsewhere so we don't have to touch package.json?
    // Unpleasant to use sync file methods, but alternative would be an additional init function
    let packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const resolverConfig = {
      "@mischnic/parcel-resolver-root": {
        "/": `./${this.outputDir}`,
      },
    };

    if (!lodashSome([packageJson], resolverConfig)) {
      console.log(
        "[11ty] 📦 Parcel plugin edited your package.json to include resolver configuration"
      );

      fs.writeFileSync(
        "package.json",
        JSON.stringify(lodashMerge(packageJson, resolverConfig), null, 2)
      );
    }
  }

  setRunMode(runMode) {
    this.runMode = runMode;
  }

  getIgnoreDirectory() {
    return path.join(this.options.tempFolderName, "**");
  }

  getPrefixedEntries(prefix) {
    // Prefix entry points to reflect the temp folder
    return [].concat(this.options.parcelOptions.entries).map((entry) => {
      return path.resolve(prefix, entry);
    });
  }

  async getServerMiddleware() {
    let bundler = new Parcel(
      lodashMerge(this.options.parcelOptions, {
        entries: this.getPrefixedEntries(this.outputDir),
      })
    );
    try {
      await bundler.watch();
      console.log(
        `[11ty] 📦 Started Parcel dev server middleware on port ${this.options.parcelOptions.serveOptions.port}`
      );
    } catch (e) {
      console.warn("[11ty] 📦 Encountered a Parcel watch error", e);
    }

    return createProxyMiddleware(
      // TODO what about https...
      lodashMerge(
        {
          target: `http://localhost:${this.options.parcelOptions.serveOptions.port}/`,
        },
        this.options.middlewareOptions
      )
    );
  }

  async runBuild(input) {
    // Tweak parcel options to build to temp path
    const tempPath = path.resolve(".", this.options.tempFolderName);

    // Build with Parcel
    try {
      // TODO warn about option modification
      let bundler = new Parcel(
        lodashMerge(
          {
            // Build in production mode by default... overridable
            mode: this.runMode == "serve" ? "development" : "production",
          },
          this.options.parcelOptions,
          {
            entries: this.getPrefixedEntries(this.outputDir),
            serveOptions: false, // Build time doubles if we leave this in???
            hmrOptions: false, // Build time doubles if we leave this in???
            defaultTargetOptions: {
              distDir: tempPath,
            },
          }
        )
      );

      let { bundleGraph, buildTime } = await bundler.run();

      let bundles = bundleGraph.getBundles();
      console.log(
        `[11ty] 📦 Parcel Built ${bundles.length} bundles in ${buildTime}ms`
      );

      // Clean up the Parcel build folder
    } catch (e) {
      console.warn(
        `[11ty] 📦 Encountered a Parcel build error, restoring original Eleventy output to ${this.outputDir}`,
        e
      );
      throw e;
    } finally {
      await fsp.rm(this.outputDir, { recursive: true });
      await fsp.rename(tempPath, this.outputDir);
    }
  }
}

module.exports = EleventyParcel;
