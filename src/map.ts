import { Map } from 'maptalks';
import { BaseMapWrapper } from '@antv/l7';
import MapService from './lib/map';
export default class MapboxWrapper extends BaseMapWrapper<Map> {
  // @ts-ignore
  protected getServiceConstructor() {
    return MapService;
  }
}
