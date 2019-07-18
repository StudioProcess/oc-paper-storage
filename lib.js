const default_params = {
  width: 1000,
  sort: false,
  invert: false,
};

// Encodes bytes (ArrayBuffer) into to an image (ImageData)
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
// https://developer.mozilla.org/en-US/docs/Web/API/ImageData
export function encode(buf, params) {
  
  params = Object.assign({}, default_params, params);

  let arr = new Uint8Array(buf); // make byte array
  if (params.sort) arr.sort(); // sort values
  
  let w = params.width;
  let h = Math.ceil( arr.length / w );
  let img = new ImageData(w, h);
  
  console.log(`${arr.length} bytes`);
  console.log(`${w}x${h} px`);
  console.log(`${Math.ceil(w/300*25.4)} x ${Math.ceil(h/300*25.4)} mm @ 300 ppi`);
  
  let stats = { min: 255, max: 0, avg: 0 };
  
  for (let i=0; i<arr.length; i++) {
    let g = arr[i]; // gray value
    if (params.invert) g = 255-g;
    // console.log(g);
    img.data[ i*4 + 0 ] = g;
    img.data[ i*4 + 1 ] = g;
    img.data[ i*4 + 2 ] = g;
    img.data[ i*4 + 3 ] = 255;
    
    if (g < stats.min) stats.min = g;
    if (g > stats.max) stats.max = g;
    stats.avg = (stats.avg * (i) + g) / (i+1);
    
    // img.data[i*4+0] = 255-g;
    // img.data[i*4+1] = 255-g;
    // img.data[i*4+2] = 255-g;
    // img.data[i*4+3] = 255;
    
    // img.data[i*4+0] = 50;
    // img.data[i*4+1] = 10;
    // img.data[i*4+2] = 255-g;
    // img.data[i*4+3] = 255;
  }

  return {
    img,
    bytes: arr.length,
    width: w,
    height: h,
    stats,
  };
}

export function img2svg(img, scale = 1) {
  function makePixel(x, y, r, g, b, a) { return `<rect fill="rgb(${r},${g},${b},${a/255})" x="${x}" y="${y}" width="1" height="1" />`; }
  let pixels = '';
  for (let i=0; i<img.width*img.height; i++) {
    pixels += makePixel(
      i % img.width,
      Math.ceil(i / img.width),
      img.data[ i*4 + 0 ],
      img.data[ i*4 + 1 ],
      img.data[ i*4 + 2 ],
      img.data[ i*4 + 3 ]
    ) + '\n';
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${img.width} ${img.height}" shape-rendering="crispEdges">\n<g transform="scale(${scale})">\n${pixels}</g>\n</svg>`;
}


function saveURL(url, filename) {
  let link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
}

function saveBlob(blob, filename) {
  let url = URL.createObjectURL(blob);
  saveURL(url, filename);
  URL.revokeObjectURL(url);
}

export function saveSVG(string, filename) {
  let blob = new Blob( [string], {type: 'image/svg+xml'} );
  saveBlob(blob, filename);
}
