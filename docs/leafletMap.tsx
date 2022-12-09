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
        center: [109.40618991851805, 24.336068050903056],
        zoom: 7.5,
        pitch: 45,
        rotation: 0,
      }),
    });

    scene.on("loaded", () => {
      var china_vec_02 = new TileLayer('vec', {
        tileSystem : [1, -1, -180, 90],
        urlTemplate: 'https://t{s}.tianditu.gov.cn/vec_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=59d3a78163c2741d6aa0cb12f77fa62a',
        subdomains:['1', '2', '3', '4', '5'],
        spatialReference:{
          projection:'EPSG:4326'
        },
      });
      var china_txt_02 = new TileLayer('txt', {
        tileSystem : [1, -1, -180, 90],
        urlTemplate: 'https://t{s}.tianditu.gov.cn/cva_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=59d3a78163c2741d6aa0cb12f77fa62a',
        subdomains:['1', '2', '3', '4', '5'],
        spatialReference:{
          projection:'EPSG:4326'
        },
      });
      (scene.getMapService() as any).map?.addLayer(china_vec_02);
      (scene.getMapService() as any).map?.addLayer(china_txt_02);

      const polygon = new PolygonLayer({
        zIndex: 3,
      })
        .source(data)
        .color("red")
        .shape("fill")
        .active(true);

      const line = new LineLayer({
        zIndex: 3,
      })
        .source(data)
        .color("#fff")
        .active(true)
        .size(1)
        .style({
          lineType: "dash",
          dashArray: [2, 2],
        });
      scene.addLayer(polygon);
      scene.addLayer(line);
    });

    return () => {
      scene.destroy();
    };

  },[]);
  
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
