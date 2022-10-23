const fs = require('fs');

if (process.argv.length < 3) {
    console.log('Usage: node objTransformation.js <input.obj> <output.obj>');
    process.exit(1);
}
const input_path = process.argv[2];
const output_path = process.argv[3];

var obj = fs.readFileSync(input_path, 'utf8');
function round(n) {
    return Math.round(n * 1000) / 1000;
}
function rotate_y(x, y, z) {
    return [z, y, -x];
}
function point_transfo(x, y, z) {
    return rotate_y(
        x * 0.16 + 0.71, // * 0.2 + 2,
        y * 0.16 - 0.84,// * 0.2 - 1.2,
        z * 0.16 + 1.8 // * 0.2 + 2.16
    );
}
console.log(`Origine: ${point_transfo(0, 0, 0)}`);
function corner_pos(line) {
    var m = line.match(/v ([\d\-\.E]+) ([\d\-\.E]+) ([\d\-\.E]+) (.+)/);
    var posA = [m[1], m[2], m[3]].map(v => parseFloat(v));
    var posB = point_transfo(...posA).map(v => round(v));
    return `v ${posB[0]} ${posB[1]} ${posB[2]} ${m[4]}`;
}
var output = obj.split('\n').map(line => line.startsWith('v ') ? corner_pos(line) : line).join('\n');

fs.writeFileSync(output_path, output);
