import { Viewport } from '@antv/l7';

export default class TViewport extends Viewport {
  private focalDistance: number = 1;
  private scale!: number;
  private modelMatrix: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  private viewMatrix!: Array<number>;
  private viewMatrixUncentered!: Array<number>;
  private viewProjectionMatrix!: Array<number>;
  private ViewProjectionMatrixUncentered!: Array<number>;
  private projectionMatrix!: Array<number>;

  public getViewMatrix(): number[] {
    return this.viewMatrix ?? this.viewport.viewMatrix;
  }

  public getViewMatrixUncentered(): number[] {
    // @ts-ignore
    return this.viewMatrixUncentered ?? this.viewport.viewMatrixUncentered;
  }
  public getViewProjectionMatrix(): number[] {
    // @ts-ignore
    return this.viewProjectionMatrix ?? this.viewport.viewProjectionMatrix;
  }

  public getViewProjectionMatrixUncentered(): number[] {
    // @ts-ignore
    return this.ViewProjectionMatrixUncentered ?? this.viewport.ViewProjectionMatrixUncentered;
  }

  public getProjectionMatrix(): number[] {
    return this.projectionMatrix ?? this.viewport.projectionMatrix;
  }

  public getZoomScale(): number {
    return this.scale ?? Math.pow(2, this.getZoom());
  }

  public getFocalDistance() {
    return this.focalDistance;
  }

  public getModelMatrix(): number[] {
    return this.modelMatrix;
  }

  public setFocalDistance(distance: number) {
    this.focalDistance = distance;
  }

  public setScale(scale: number) {
    this.scale = scale;
  }

  public setModelMatrix(matrix: number[]) {
    this.modelMatrix = matrix;
  }

  public setProjectionMatrix(matrix: number[]) {
    this.projectionMatrix = matrix;
  }

  public setViewMatrix(matrix: number[]) {
    this.viewMatrix = matrix;
  }

  public setViewMatrixUncentered(matrix: number[]) {
    this.viewMatrixUncentered = matrix;
  }
  public setViewProjectionMatrix(matrix: number[]) {
    this.viewProjectionMatrix = matrix;
  }

  public setViewProjectionMatrixUncentered(matrix: number[]) {
    this.ViewProjectionMatrixUncentered = matrix;
  }

  public projectFlat(lngLat: [number, number], scale?: number | undefined): [number, number] {
    return this.viewport.projectFlat(lngLat, scale);
  }
}
