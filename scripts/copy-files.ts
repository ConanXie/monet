const path = require("path")
const fse = require("fs-extra")

const packagePath = process.cwd()
const distPath = path.join(packagePath, "./dist")
const srcPath = path.join(packagePath, "./src")

async function includeFileInBuild(file: string) {
  const sourcePath = path.resolve(packagePath, file)
  const targetPath = path.resolve(distPath, path.basename(file))
  await fse.copy(sourcePath, targetPath)
  console.log(`Copied ${sourcePath} to ${targetPath}`)
}

async function createPackageFile() {
  const packageData = await fse.readFile(
    path.resolve(packagePath, "./package.json"),
    "utf8",
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { nyc, scripts, devDependencies, workspaces, ...packageDataOther } =
    JSON.parse(packageData)

  const newPackageData = {
    ...packageDataOther,
    private: false,
    // types: "./index.d.ts",
  }

  const targetPath = path.resolve(distPath, "./package.json")

  await fse.writeFile(
    targetPath,
    JSON.stringify(newPackageData, null, 2),
    "utf8",
  )
  console.log(`Created package.json in ${targetPath}`)

  return newPackageData
}

async function prepend(file: string, string: string) {
  const data = await fse.readFile(file, "utf8")
  await fse.writeFile(file, string + data, "utf8")
}

async function addLicense(packageData: any) {
  const license = `/** @license ConanXie v${packageData.version}
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`
  await Promise.all(
    ["./index.js", "./lib.cjs", "./lib.min.js", "./lib.mjs"].map(
      async (file) => {
        try {
          await prepend(path.resolve(distPath, file), license)
        } catch (err: any) {
          if (err.code === "ENOENT") {
            console.log(`Skipped license for ${file}`)
          } else {
            throw err
          }
        }
      },
    ),
  )
}

async function run() {
  try {
    const packageData = await createPackageFile()

    await Promise.all(
      [
        // use enhanced readme from workspace root for `@monet/theme`
        packageData.name === "@monet/theme" ? "../../README.md" : "./README.md",
        "../../CHANGELOG.md",
        "../../LICENSE",
      ].map((file) => includeFileInBuild(file)),
    )

    await addLicense(packageData)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

run()
