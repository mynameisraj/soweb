"use strict";
process.env.NODE_ENV= "development";

var gulp = require("gulp"),
    browserify = require("browserify"),
    source = require("vinyl-source-stream"),
    size = require("gulp-size"),
    clean = require("gulp-clean"),
    sass = require("gulp-sass"),
    reactify = require("reactify");


// File constants. 
var STATIC = "./soweb/static/"

var JSX_SRC = STATIC + "jsx/*.js",
    JS_SRC = STATIC + "js/*.js",
    SASS_SRC = STATIC + "scss/*.scss";

var JSX_DEST = STATIC + "jsx/",
    JS_DEST = STATIC + "js/",
    CSS_DEST = STATIC + "css/";

var APP = STATIC + "js/app.js"; 

gulp.task("transform", function() { 
    return browserify(APP)
        .transform(reactify)
        .bundle()
        .pipe(source("bundle.js"))
        .pipe(gulp.dest(JS_DEST))
        .pipe(size());
});

gulp.task("default", ["transform"], function() {
    console.log("Default task started");
});

gulp.watch([APP, STATIC + "js/components/*.jsx"], ["transform"]);
