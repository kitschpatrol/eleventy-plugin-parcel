const { promises: fsp } = require("fs");
const path = require("path");
const { Parcel } = require("@parcel/core");
const lodashMerge = require("lodash.merge");
const lodashSome = require("lodash.some");

const DEFAULT_OPTIONS = {
  tempFolderName: ".11ty-parcel",
  parcelOptions: {
    entries: "index.html", // Prefixed with temp folder name automatically
    defaultConfig: "@parcel/config-default",
    mode: "production",
    shouldDisableCache: true, // TODO why?
    shouldAutoInstall: true,
  },
};

class EleventyParcel {
  constructor(outputDir, pluginOptions = {}) {
    this.outputDir = outputDir;
    this.options = lodashMerge({}, DEFAULT_OPTIONS, pluginOptions);
  }

  getIgnoreDirectory() {
    return path.join(this.options.tempFolderName, "**");
  }

  async runBuild(input) {
    let tempPath = path.resolve(".", this.options.tempFolderName);
    let distPath = `${tempPath}-dist`;

    await fsp.mkdir(tempPath, { recursive: true });
    await fsp.rename(this.outputDir, tempPath);

    // Set configuration for parcel-resolver-root if needed
    // TODO allow this config to be specified elsewhere so we don't have to touch package.json?
    let packageJson = JSON.parse(await fsp.readFile("package.json", "utf8"));
    const resolverConfig = {
      "@mischnic/parcel-resolver-root": {
        "/": `./${this.options.tempFolderName}`,
      },
    };

    if (!lodashSome([packageJson], resolverConfig)) {
      console.log(
        "[11ty] 📦 Editing package.json to include resolver configuration"
      );

      await fsp.writeFile(
        "package.json",
        JSON.stringify(lodashMerge(packageJson, resolverConfig), null, 2)
      );
    }

    // Build with parcel
    try {
      // Prefix entry points to reflect the temp folder
      const prefixedEntries = []
        .concat(this.options.parcelOptions.entries)
        .map((entry) => {
          return path.resolve(".", this.options.tempFolderName, entry);
        });

      let bundler = new Parcel(
        lodashMerge(this.options.parcelOptions, {
          entries: prefixedEntries,
          defaultTargetOptions: {
            distDir: distPath,
          },
        })
      );

      let { bundleGraph, buildTime } = await bundler.run();
      let bundles = bundleGraph.getBundles();
      console.log(
        `[11ty] 📦 Parcel Built ${bundles.length} bundles in ${buildTime}ms`
      );

      await fsp.rename(distPath, this.outputDir);
    } catch (e) {
      console.warn(
        `[11ty] Encountered a Parcel build error, restoring original Eleventy output to ${this.outputDir}`,
        e
      );
      await fsp.rename(tempPath, this.outputDir);
      throw e;
    } finally {
      // clean up the tmp dir
      await fsp.rm(tempPath, { recursive: true });
    }
  }
}

module.exports = EleventyParcel;
