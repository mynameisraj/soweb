"use strict";

var gulp = require("gulp"),
    browserify = require("gulp-browserify"),
    size = require("gulp-size"),
    clean = require("gulp-clean"),
    sass = require("gulp-sass");

// File constants. 
var STATIC = "./soweb/static/"

var JSX_SRC = STATIC + "jsx/*.js",
    JS_SRC = STATIC + "js/*.js",
    SASS_SRC = STATIC + "scss/*.scss";

var JSX_DEST = STATIC + "jsx/",
    JS_DEST = STATIC + "js/",
    CSS_DEST = STATIC + "css/";

gulp.task("transform", ["clean"], function() { 
    return gulp.src(JSX_SRC)
        .pipe(browserify({transform: ['reactify']}))
        .pipe(gulp.dest(JS_DEST))
        .pipe(size());
});

gulp.task("clean", function() {
    return gulp.src(JS_DEST)
        .pipe(clean())
});

gulp.task("default", ["transform"], function() {
    console.log("Default task started");
});

gulp.watch(JSX_SRC, ["transform"]);
