
var d3 = require('d3'),
    http = require('http')
var fs = require('fs');
var jsdom = require('jsdom');

const pnfs = require("pn/fs"); // https://www.npmjs.com/package/pn
const svg2png = require("svg2png");

http.createServer(function (req, res) {

    var chartWidth = 500, chartHeight = 500;

    var arc = d3.svg.arc()
        .outerRadius(chartWidth / 2 - 10)
        .innerRadius(0);

    var colours = ['#F00', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'];
    var pieData = [12, 31];
    var outputLocation = 'test.svg';

    jsdom.env({
        html: '',
        features: { QuerySelector: true }, //you need query selector for D3 to work
        done: function (errors, window) {
            window.d3 = d3.select(window.document); //get d3 into the dom

            //do yr normal d3 stuff
            var svg = window.d3.select('body')
                .append('div').attr('class', 'container') //make a container div to ease the saving process
                .append('svg')
                .attr({
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: chartWidth,
                    height: chartHeight
                })
                .append('g')
                .attr('transform', 'translate(' + chartWidth / 2 + ',' + chartWidth / 2 + ')');

            svg.selectAll('.arc')
                .data(d3.layout.pie()(pieData))
                .enter()
                .append('path')
                .attr({
                    'class': 'arc',
                    'd': arc,
                    'fill': function (d, i) {
                        return colours[i];
                    },
                    'stroke': '#fff'
                });

            //write out the children of the container div
            // fs.writeFileSync(outputLocation, window.d3.select('.container').html()) //using sync to keep the code simple
            // fs.writeFileSync(outputLocation, window.d3.select('.container').()) //using sync to keep the code simple

            pnfs.readFile(outputLocation)
                .then(svg2png)
                // .then(buffer => fs.writeFile("dest.png", buffer))
                .then(buffer => {
                    res.writeHead(200, { 'Content-Type': 'image/png' })
                    res.end(buffer);
                })
                // .then(() => {
                //     // res.writeHead(200, { 'Content-Type': 'image/svg+xml' })
                //     res.writeHead(200, { 'Content-Type': 'image/png' })
                //     // res.end(d3.select('body').node().innerHTML)
                //     // res.end(window.d3.select('.container').html());
                //     var s = fs.createReadStream("dest.png");
                //     s.on('open', function () {
                //         s.pipe(res);
                //     });
                //     // res.end(window.d3.select('.container').html());
                // })
                .catch(e => console.error(e));
        }
    });
}).listen(1337, '127.0.0.1')

console.log('Server running at http://127.0.0.1:1337/');