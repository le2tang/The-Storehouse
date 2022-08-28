const cwd = process.cwd()

module.exports = {
  port: process.env.PORT || 3000,
  cwd: cwd,
  paths: {
    partials: cwd + "/public/partials",
    scripts: cwd + "/public/scripts",
    styles: cwd + "/public/styles",
    views: cwd + "/public/views"
  }
}