var gulp = require("gulp"),
    gulpPlugins = {
      cleanCss: require("gulp-clean-css"),
      header: require("gulp-header"),
      intercept: require("gulp-intercept"),
      minifyHtml: require("gulp-minify-html"),
      rename: require("gulp-rename"),
      replace: require("gulp-replace"),
      uglify: require("gulp-uglify")
    },
    del = require("del"),
    fs = require("fs"),
    pump = require("pump"),
    request = require("request");

gulp
  .task("clean:dist", function() {
    return del("./dist/**");
  })
;

gulp
  .task("create:./temp/index.html", ["clean:dist"], function(callback) {
    pump([
      gulp.src("./src/index.html"),
      gulp.dest("./temp/")
    ], callback)
  })
;

(function(externalScripts) {
  for (i = 0; i < externalScripts.length; i++) {
    (function(i) {
      (function(processAndInjectExternalScriptContents) {
        if (i == 0) {
          gulp
            .task("inject:" + externalScripts[i].name, ["create:./temp/index.html"], function(callback) {
              request(externalScripts[i].URL, function(err, res, externalScriptContents) {
                if (!err) {
                  processAndInjectExternalScriptContents(externalScriptContents, callback);
                }
              });
            })
          ;
        } else {
          gulp
            .task("inject:" + externalScripts[i].name, ["inject:" + externalScripts[i - 1].name], function(callback) {
              request(externalScripts[i].URL, function(err, res, externalScriptContents) {
                if (!err) {
                  processAndInjectExternalScriptContents(externalScriptContents, callback);
                }
              });
            })
          ;
        }
      })(function(externalScriptContents, callback) {
        pump([
          gulp.src("./blank"),
          gulpPlugins.intercept(function(file) {
            file
              .contents = new Buffer(externalScriptContents)
            ;

            return file;
          }),
          gulpPlugins.uglify(),
          gulpPlugins.replace(/\n/g, ""),
          gulpPlugins.header("/* (source:" + externalScripts[i].URL + ") */"),
          gulpPlugins.intercept(function(file) {
            externalScriptContents = file.contents.toString();
          })
        ], function() {
          pump([
            gulp.src("./temp/index.html"),
            gulpPlugins.replace("/* (externalScript:" + externalScripts[i].name + ") */", externalScriptContents),
            gulp.dest("./temp/")
          ], callback);
        });
      });
    })(i);
  }
})([
  {
    URL: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.js",
    name: "moment.js"
  },
  {
    URL: "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.11/moment-timezone-with-data.min.js",
    name: "moment-timezone-with-data.min.js"
  },
  {
    URL: "https://cdn.rawgit.com/marcj/css-element-queries/master/src/ResizeSensor.js",
    name: "ResizeSensor.js"
  },
  {
    URL: "https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular.js",
    name: "angular.js"
  },
  {
    URL: "https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-aria.js",
    name: "angular-aria.js"
  },
  {
    URL: "https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-animate.js",
    name: "angular-animate.js"
  },
  {
    URL: "https://ajax.googleapis.com/ajax/libs/angularjs/1.6.4/angular-route.js",
    name: "angular-route.js"
  },
  {
    URL: "https://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.js",
    name: "angular-material.js"
  },
  {
    URL: "https://unpkg.com/flickity@2/dist/flickity.pkgd.js",
    name: "flickity.pkgd.js"
  },
  {
    URL: "https://js.stripe.com/v3/",
    name: "stripe.js"
  }
]);

(function(externalStylesheets) {
  for (i = 0; i < externalStylesheets.length; i++) {
    (function(i) {
      (function(processAndInjectExternalStylesheetContents) {
        if (i == 0) {
          gulp
            .task("inject:" + externalStylesheets[i].name, ["inject:stripe.js"], function(callback) {
              request(externalStylesheets[i].URL, function(err, res, externalStylesheetContents) {
                if (!err) {
                  processAndInjectExternalStylesheetContents(externalStylesheetContents, callback);
                }
              });
            })
          ;
        } else {
          gulp
            .task("inject:" + externalStylesheets[i].name, ["inject:" + externalStylesheets[i - 1].name], function(callback) {
              request(externalStylesheets[i].URL, function(err, res, externalStylesheetContents) {
                if (!err) {
                  processAndInjectExternalStylesheetContents(externalStylesheetContents, callback);
                }
              });
            })
          ;
        }
      })(function(externalStylesheetContents, callback) {
        pump([
          gulp.src("./blank"),
          gulpPlugins.intercept(function(file) {
            file
              .contents = new Buffer(externalStylesheetContents)
            ;

            return file;
          }),
          gulpPlugins.cleanCss(),
          gulpPlugins.replace(/\n/g, ""),
          gulpPlugins.header("/* (source:" + externalStylesheets[i].URL + ") */"),
          gulpPlugins.intercept(function(file) {
            externalStylesheetContents = file.contents.toString();
          })
        ], function() {
          pump([
            gulp.src("./temp/index.html"),
            gulpPlugins.replace("/* (externalStylesheet:" + externalStylesheets[i].name + ") */", externalStylesheetContents),
            gulp.dest("./temp/")
          ], callback);
        });
      });
    })(i);
  }
})([
  {
    URL: "https://ajax.googleapis.com/ajax/libs/angular_material/1.0.0/angular-material.css",
    name: "angular-material.css"
  },
  {
    URL: "https://unpkg.com/flickity@2/dist/flickity.css",
    name: "flickity.css"
  },
  {
    URL: "https://fonts.googleapis.com/icon?family=Material+Icons",
    name: "material-icons"
  },
  {
    URL: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic",
    name: "roboto"
  }
]);

(function(scriptPaths) {
  for (i = 0; i < scriptPaths.length; i++) {
    (function(i) {
      (function(processAndInjectScriptContents) {
        if (i == 0) {
          gulp
            .task("inject:" + scriptPaths[i], ["inject:roboto"], function(callback) {
              processAndInjectScriptContents(callback);
            })
          ;
        } else {
          gulp
            .task("inject:" + scriptPaths[i], ["inject:" + scriptPaths[i - 1]], function(callback) {
              processAndInjectScriptContents(callback);
            })
          ;
        }
      })(function(callback) {
        (function(scriptContents) {
          pump([
            gulp.src("./src/" + scriptPaths[i]),
            gulpPlugins.uglify(),
            gulpPlugins.replace(/\n/g, ""),
            gulpPlugins.header("/* (source:" + scriptPaths[i] + ") - Licensed under CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/) */"),
            gulpPlugins.intercept(function(file) {
              scriptContents = file.contents.toString();
            })
          ], function() {
            pump([
              gulp.src("./temp/index.html"),
              gulpPlugins.replace("/* (script:" + scriptPaths[i] + ") */", scriptContents),
              gulp.dest("./temp/")
            ], callback);
          });
        })("");
      });
    })(i);
  }
})([
  "APP/JS/modules.js",
  "APP/JS/animations.js",
  "APP/JS/components.js",
  "APP/JS/configs.js",
  "APP/JS/controllers.js",
  "APP/JS/directives.js",
  "APP/JS/factories.js",
  "APP/JS/filters.js",
]);

(function(stylesheetPaths) {
  for (i = 0; i < stylesheetPaths.length; i++) {
    (function(i) {
      (function(processAndInjectStylesheetContents) {
        if (i == 0) {
          gulp
            .task("inject:" + stylesheetPaths[i], ["inject:APP/JS/filters.js"], function(callback) {
              processAndInjectStylesheetContents(callback);
            })
          ;
        } else {
          gulp
            .task("inject:" + stylesheetPaths[i], ["inject:" + stylesheetPaths[i - 1]], function(callback) {
              processAndInjectStylesheetContents(callback);
            })
          ;
        }
      })(function(callback) {
        (function(stylesheetContents) {
          pump([
            gulp.src("./src/" + stylesheetPaths[i]),
            gulpPlugins.cleanCss(),
            gulpPlugins.replace(/\n/g, ""),
            gulpPlugins.header("/* (source:" + stylesheetPaths[i] + ") - Licensed under CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/) */"),
            gulpPlugins.intercept(function(file) {
              stylesheetContents = file.contents.toString();
            })
          ], function() {
            pump([
              gulp.src("./temp/index.html"),
              gulpPlugins.replace("/* (stylesheet:" + stylesheetPaths[i] + ") */", stylesheetContents),
              gulp.dest("./temp/")
            ], callback);
          });
        })("");
      });
    })(i);
  }
})([
  "APP/CSS/_.css",
  "APP/FONTS/FUTURA/_.css",
  "APP/FONTS/REALTIME/_.css",
  "APP/FONTS/REALTIME_ROUNDED/_.css"
]);

gulp
  .task("process:APP/index.html", ["inject:APP/FONTS/REALTIME_ROUNDED/_.css"], function(callback) {
    pump([
      gulp.src("./temp/index.html"),
      gulpPlugins.minifyHtml(),
      gulpPlugins.header([
        "<!--",
        "",
        "  Origin: Plausible Webapp, v0",
        "  Copyright: (c) 2017 Gavin Sawyer.",
        "  License: CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)",
        "",
        "  All rights reserved.",
        "",
        "-->",
        ""
      ].join("\n")),
      gulpPlugins.rename({
        suffix: ".min"
      }),
      gulp.dest("./dist/")
    ], callback);
  })
;

gulp
  .task("process:APP/HTML/**/*.html", ["process:APP/index.html"], function(callback) {
    pump([
      gulp.src("./src/APP/HTML/**/*.html"),
      gulpPlugins.minifyHtml(),
      gulpPlugins.header([
        "<!--",
        "",
        "  Origin: Plausible Webapp, v0",
        "  Copyright: (c) 2017 Gavin Sawyer.",
        "  License: CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/)",
        "",
        "  All rights reserved.",
        "",
        "-->",
        ""
      ].join("\n")),
      gulpPlugins.rename({
        suffix: ".min"
      }),
      gulp.dest("./dist/APP/HTML/")
    ], callback);
  })
;

gulp
  .task("copy:APP/FONTS/", ["process:APP/HTML/**/*.html"], function(callback) {
    pump([
      gulp.src("./src/APP/FONTS/**/*"),
      gulp.dest("./dist/APP/FONTS/")
    ], callback);
  })
;

gulp
  .task("copy:APP/IMAGES/", ["copy:APP/FONTS/"], function(callback) {
    pump([
      gulp.src("./src/APP/IMAGES/**/*"),
      gulp.dest("./dist/APP/IMAGES/")
    ], callback);
  })
;

gulp
  .task("clean:temp x2", ["copy:APP/IMAGES/"], function() {
    return del("./temp/**");
  })
;

gulp
  .task("default", ["clean:temp x2"])
;
