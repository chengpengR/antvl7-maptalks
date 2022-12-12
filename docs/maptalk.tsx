import { Scene, LineLayer } from '@antv/l7';
import { TileLayer } from 'maptalks';
import { Map } from 'l7-maptalks';
import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    const scene = new Scene({
      id: 'map',
      map: new Map({
        style: 'light',
        center: [112, 30],
        zoom: 4,
        pitch: 45,
        rotation: 0,
      }),
    });

    scene.on('loaded', () => {
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
