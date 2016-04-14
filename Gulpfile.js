var gulp = require('gulp');
var gulpif = require('gulp-if');
// 引入插件
var uglify = require('gulp-uglify'); // 压缩
var minifyCss = require('gulp-minify-css');
var stripDebug = require('gulp-strip-debug'); // 该插件用来去掉console和debugger语句
var useref = require('gulp-useref');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var clean = require('gulp-clean');
var rev = require('gulp-rev-append');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');

// 任务处理的文件路径配置
var paths = {
    src:'src/',
    js: [ // js目录
        'src/js/*'
    ],
    css: [
        'src/css/*'
    ],
    img: [
        'src/image/*'
    ],
    html: [
        'src/html/*'
    ],
    lib: { // 第三方依赖文件

    }
};

var output = 'dist/';

gulp.task('clean', function () {
    gulp.src(output)
        .pipe(clean({force: true}));
});

gulp.task('develop', function() {
    gulp.src(paths.js)
        .pipe(gulp.dest(output + '/js'));

    gulp.src(paths.css)
        .pipe(gulp.dest(output + '/css'));

    gulp.src(paths.img)
        .pipe(gulp.dest(output + '/image'));

});


/* 部署环境 */
gulp.task('release', function() {
    gulp.src(paths.js)
        .pipe(stripDebug())
        .pipe(gulp.dest(output + '/js'));

    gulp.src(paths.css)
        .pipe(gulp.dest(output + '/css'));

    gulp.src(paths.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(output + '/image'));

    gulp.src(paths.html)
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(rev())
        .pipe(gulp.dest(output + '/html'));
});

var watcher = gulp.watch(paths.js, ['release']);
watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});

gulp.task('default', ['release']);