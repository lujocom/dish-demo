var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    rev = require('gulp-rev-append');

var dest = "dest";
gulp.task('jsmin', function () {
    gulp.src(['src/js/*.js'])
        .pipe(gulp.dest(dest+'/js'))
        .pipe(uglify({
            mangle: true,//类型：Boolean 默认：true 是否修改变量名
            compress: true//类型：Boolean 默认：true 是否完全压缩
        }))
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest(dest+'/js'));
});

gulp.task('minify-css', function () {
    return gulp.src('src/css/*.css')
        .pipe(gulp.dest(dest+'/css'))
        .pipe(cleanCSS())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(dest+'/css'));
});

gulp.task('testRev', function () {
    return gulp.src(['src/html/*.jsp','src/html/*.html'])
        .pipe(rev())
        .pipe(rev())
        .pipe(gulp.dest(dest+'/html'));
});

gulp.task('imageCopy', function () {
    gulp.src(['src/image/*.png','src/image/*.jpg']).pipe(gulp.dest('microweb/image'));
});


// 注册缺省任务
gulp.task('default',['jsmin','minify-css','imageCopy','testRev']);