# L7-maptalks

- [L7](https://github.com/antvis/l7) Large-scale WebGL-powered Geospatial data visualization analysis engine.

<img src="https://camo.githubusercontent.com/9dce91a0264bc3f6eb0b54c4cb7b4911555af7206db6eb9cb9bd9a9d000e8de8/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3835356261622f616674732f696d672f412a532d373351704f386430594141414141414141414141426b4152516e4151" alt="l7demo" style="width:500px;"/>

### maptalks

[doc](https://maptalks.org/)

### L7 maptalks

### install

```
 npm install l7-maptalks

```

### L7 plugin for maptalks use in maptalks

```jsx pure
import { Scene, PolygonLayer, LineLayer } from "@antv/l7";
import { TileLayer } from 'maptalks';
import { Map, data } from 'l7-maptalks';
import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    const scene = new Scene({
      id: "map",
      map: new Map({
        style: "light",
        center: [112, 30],
        zoom: 4,
        pitch: 45,
        rotation: 0,
      }),
    });

    scene.on("loaded", () => {
      var china_vec_02 = new TileLayer('vec', {
        tileSystem: [1, -1, -180, 90],
        urlTemplate:
          'https://t{s}.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b72aa81ac2b3cae941d1eb213499e15e',
        subdomains: ['1', '2', '3', '4', '5'],
        spatialReference: {
          projection: 'EPSG:4326',
        },
      });
      var china_txt_02 = new TileLayer('txt', {
        tileSystem: [1, -1, -180, 90],
        urlTemplate:
          'https://t{s}.tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=b72aa81ac2b3cae941d1eb213499e15e',
        subdomains: ['1', '2', '3', '4', '5'],
        spatialReference: {
          projection: 'EPSG:4326',
        },
      });
      (scene.getMapService() as any).map?.addLayer(china_vec_02);
      (scene.getMapService() as any).map?.addLayer(china_txt_02);

      fetch('https://gw.alipayobjects.com/os/rmsportal/UEXQMifxtkQlYfChpPwT.txt')
      .then((res) => res.text())
      .then((data) => {
        const layer = new LineLayer({})
          .source(data, {
            parser: {
              type: 'csv',
              x: 'lng1',
              y: 'lat1',
              x1: 'lng2',
              y1: 'lat2',
            },
          })
          .size(1)
          .shape('arc')
          .color('#8C1EB2')
          .style({
            opacity: 0.8,
            blur: 0.99,
          });
        scene.addLayer(layer);
      });
    });

    return () => {
      scene.destroy();
    };

  }, []);

  return (
    <div
      id="map"
      style={{
        height: '500px',
        position: 'relative',
      }}
    />
  );
};
```
