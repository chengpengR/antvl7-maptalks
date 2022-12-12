/**
 * MapboxService
 */
import { IMercator, IViewport, BaseMapService, Bounds, IStatusOptions } from '@antv/l7';
import { MercatorCoordinate } from '@antv/l7-map';
import { Map, Point, Coordinate } from 'maptalks';
import 'maptalks/dist/maptalks.css';
import { mat4, vec3 } from 'gl-matrix';
import Viewport from './Viewport';

var mapdivCount = 0;

export default class MapService extends BaseMapService<Map> {
  // @ts-ignore
  public viewport: Viewport;

  public getType() {
    return 'maptalks';
  }

  /**
   * 将经纬度转成墨卡托坐标
   * @param lnglat
   * @returns
   */
  public lngLatToCoord(lnglat: [number, number], origin: IMercator = { x: 0, y: 0, z: 0 }) {
    // @ts-ignore
    const { x, y } = this.lngLatToMercator(lnglat, 0);
    return [x - origin.x, y - origin.y] as [number, number];
  }

  public lngLatToMercator(lnglat: [number, number], altitude?: number): IMercator {
    const {
      x = 0,
      y = 0,
      z = 0,
    } = this.map.coordToViewPoint(new Coordinate(lnglat), null, altitude);
    return { x, y, z };
  }
  public getModelMatrix(
    lnglat: [number, number],
    altitude: number,
    rotate: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    origin: IMercator = { x: 0, y: 0, z: 0 },
  ): number[] {
    const modelAsMercatorCoordinate = MercatorCoordinate.fromLngLat(lnglat, altitude);
    // @ts-ignore
    const meters = modelAsMercatorCoordinate.meterInMercatorCoordinateUnits();
    const modelMatrix = mat4.create();

    mat4.translate(
      modelMatrix,
      modelMatrix,
      vec3.fromValues(
        modelAsMercatorCoordinate.x - origin.x,
        modelAsMercatorCoordinate.y - origin.y,
        modelAsMercatorCoordinate.z || 0 - origin.z,
      ),
    );

    mat4.scale(
      modelMatrix,
      modelMatrix,
      vec3.fromValues(meters * scale[0], -meters * scale[1], meters * scale[2]),
    );

    mat4.rotateX(modelMatrix, modelMatrix, rotate[0]);
    mat4.rotateY(modelMatrix, modelMatrix, rotate[1]);
    mat4.rotateZ(modelMatrix, modelMatrix, rotate[2]);

    return modelMatrix as unknown as number[];
  }

  // 地图初始化
  public async init(): Promise<void> {
    const {
      id = 'map',
      style = 'light',
      rotation = 0,
      mapInstance,
      version = 'maptalks',
      mapSize = 10000,
      ...rest
    } = this.config;

    this.viewport = new Viewport();

    if (mapInstance) {
      // @ts-ignore
      this.map = mapInstance;
      this.$mapContainer = this.map.getContainer();
    } else {
      this.$mapContainer = this.creatMapContainer(id);
      // @ts-ignore
      this.map = new Map(this.$mapContainer, {
        zoomAnimation: true,
        bearing: rotation,
        ...rest,
      });
    }
    this.map.project = (lonlat: [number, number]) =>
      this.map.getProjection().project(new Point(...lonlat));
    this.map.unproject = (lonlat: [number, number]) =>
      this.map.getProjection().unproject(new Point(...lonlat));
    this.map.on('loaded', this.handleCameraChanged.bind(this));
    this.map.on('moving', this.handleCameraChanged.bind(this));
    this.map.on('zooming', this.handleCameraChanged.bind(this));
    this.map.on('pitch', this.handleCameraChanged.bind(this));
    this.map.on('viewchange', this.handleCameraChanged.bind(this));

    // 触发首次渲染
    this.handleCameraChanged();
  }
  // 地图销毁
  public destroy() {
    this.$mapContainer?.parentNode?.removeChild(this.$mapContainer);
    this.eventEmitter.removeAllListeners();
    if (this.map) {
      this.map.remove();
      this.$mapContainer = null;
    }
  }
  // 设置 Marker 容器
  public addMarkerContainer(): void {
    const panels = this.map.getPanels() as Record<string, HTMLElement>;
    this.markerContainer = panels.frontStatic;
  }
  public setCenter(lonlat: [number, number]) {
    this.map.setCenter(new Coordinate(lonlat));
  }

  public setMaxZoom(max: number) {
    this.map.setMaxZoom(max + 1);
  }

  public setMinZoom(max: number) {
    this.map.setMinZoom(max + 1);
  }

  public getBounds() {
    const { xmin, ymin, xmax, ymax } = this.map.getExtent();
    return [
      [xmin, ymin],
      [xmax, ymax],
    ] as Bounds;
  }

  public fitBounds(bounds: Bounds, options?: any) {
    this.map.fitExtent(bounds.flat());
  }

  public setZoomAndCenter(zoom: number, center: [number, number]) {
    this.map.flyTo({
      //maptalks与l7相差1
      zoom: zoom + 1,
      center,
    });
  }

  public setZoom(zoom: number) {
    this.map.setZoom(zoom + 1);
  }

  public panTo(p: [number, number]) {
    this.map.panTo(new Coordinate(p));
  }

  setMapStatus(option: Partial<IStatusOptions>) {
    throw new Error('Method not implemented.');
  }

  setMapStyle(style: any) {
    throw new Error('Method not implemented.');
  }

  public meterToCoord(center: [number, number], outer: [number, number]) {
    // 统一根据经纬度来转化
    // Tip: 实际米距离 unit meter
    const centerPoint = new Point(center[0], center[1]);

    const outerPoint = new Point(outer[0], outer[1]);
    const meterDis = centerPoint.distanceTo(outerPoint);

    // Tip: 三维世界坐标距离
    const centerMercator = this.lngLatToMercator(center);
    const outerMercator = this.lngLatToMercator(outer);
    const { x: x1, y: y1 } = centerMercator;
    const { x: x2, y: y2 } = outerMercator;
    // Math.pow(2, 22) 4194304
    const coordDis = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) * 4194304 * 2;

    return coordDis / meterDis;
  }

  protected handleCameraChanged = (e?: any) => {
    const { x: lon, y: lat } = this.map.getCenter();
    const pitch = this.map.getPitch();
    const bearing = this.map.getBearing();
    const { width: x, height: y } = this.map.getSize();
    const zoom = this.getMapBoxZoom();

    (this.viewport as IViewport).syncWithMapCamera({
      bearing,
      center: [lon, lat],
      pitch,
      viewportWidth: x,
      viewportHeight: y,
      zoom,
    });

    this.updateCoordinateSystemService();
    this.cameraChangedCallback(this.viewport as IViewport);
  };

  private getMapBoxZoom() {
    const MAX_RES = (2 * 6378137 * Math.PI) / (256 * Math.pow(2, 20));
    const res = this.map.getResolution();
    return 19 - Math.log(res / MAX_RES) / Math.LN2;
  }

  public subtract(cur: Point, point: Point) {
    cur.x -= point.x;
    cur.y -= point.y;
    return cur;
  }

  public exportMap(type: 'jpg' | 'png'): string {
    return this.map.toDataURL({
      mimeType: `image/${type === 'jpg' ? 'jpeg' : 'png'}`,
    });
  }

  public getZoomScale(toZoom: number, fromZoom: number) {
    var z = fromZoom ?? this.getZoom();
    var to = this.map.getResolution(toZoom),
      from = this.map.getResolution(z);

    return from / to;
  }
  public onCameraChanged(callback: (viewport: IViewport) => void): void {
    this.cameraChangedCallback = callback;
  }
  protected creatMapContainer(id: string | HTMLDivElement) {
    let $wrapper = id as HTMLDivElement;
    if (typeof id === 'string') {
      $wrapper = document.getElementById(id) as HTMLDivElement;
    }
    const $amapdiv = document.createElement('div');
    $amapdiv.style.cssText += `
			position: absolute;
			top: 0;
			height: 100%;
			width: 100%;
		`;
    $amapdiv.id = 'l7_maptalks_div' + mapdivCount++;
    $wrapper.appendChild($amapdiv);
    return $amapdiv;
  }
}
